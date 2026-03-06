"""
FilteredMCPTools - Extends agno's MCPTools with toolset-based filtering

This module provides a FilteredMCPTools class that extends agno's MCPTools
to add toolset-based filtering capabilities using tool annotations.
"""

import warnings
from typing import List, Optional, Union, Literal, Callable, Dict, Any
from agno.tools.mcp import MCPTools, SSEClientParams, StreamableHTTPClientParams
from agno.utils.log import log_debug, log_warning, set_log_level_to_debug

try:
    from mcp import ClientSession, StdioServerParameters
except (ImportError, ModuleNotFoundError):
    raise ImportError("`mcp` not installed. Please install using `pip install mcp`")


class FilteredMCPToolsMeta(type):
    """Metaclass to make FilteredMCPTools report as 'MCPTools' to AgentOS."""

    @property
    def __name__(cls) -> str:  # type: ignore[override]
        return "MCPTools"


class FilteredMCPTools(MCPTools, metaclass=FilteredMCPToolsMeta):
    """
    Extension of agno's MCPTools that adds toolset-based filtering capabilities.

    This class extends MCPTools to filter tools based on their toolset annotations,
    allowing agents to only access tools from specific domains or categories.

    Note: This class uses a metaclass to make AgentOS recognize it as "MCPTools"
    for proper MCP lifecycle management.
    """

    def __init__(
        self,
        command: Optional[str] = None,
        *,
        url: Optional[str] = None,
        env: Optional[dict[str, str]] = None,
        transport: Literal["stdio", "sse", "streamable-http"] = "stdio",
        server_params: Optional[Union[StdioServerParameters, SSEClientParams, StreamableHTTPClientParams]] = None,
        session: Optional[ClientSession] = None,
        timeout_seconds: int = 30,  # Increased from 5 for slower MCP servers
        client=None,
        include_tools: Optional[List[str]] = None,
        exclude_tools: Optional[List[str]] = None,
        # MCP connection management
        refresh_connection: bool = True,  # Re-establish connection on each agent run (recommended for AgentOS)
        lazy_connect: bool = True,  # Defer connection until first use (avoids anyio conflicts with enable_mcp_server)
        # Generic annotation filtering
        annotation_filters: Optional[Dict[str, Union[Any, List[Any], Callable]]] = None,
        # Legacy filtering parameters (for backward compatibility)
        toolsets: Optional[Union[str, List[str]]] = None,
        custom_filter: Optional[Callable] = None,
        debug_filtering: bool = False,
        **kwargs,
    ):
        """
        Initialize FilteredMCPTools with generic annotation-based filtering.

        Args:
            All standard MCPTools parameters, plus:
            annotation_filters: Dict mapping annotation names to filter values.
                              Filter values can be:
                              - Primitives (str/bool/int): Exact match
                              - Lists: OR logic (annotation must be in list or lists must intersect)
                              - Callables: function(annotation_value) -> bool
            toolsets: Legacy parameter - single toolset string or list (backward compatibility)
            custom_filter: Legacy parameter - custom function(tool) -> bool (backward compatibility)
            debug_filtering: Whether to print filtering debug information
            lazy_connect: If True (default), skip connection during AgentOS startup lifespan.
                         Connection happens on first agent run instead, avoiding anyio TaskGroup
                         conflicts when enable_mcp_server=True.
        """
        # Handle backward compatibility and parameter validation
        if toolsets is not None and annotation_filters is not None:
            raise ValueError(
                "Cannot specify both 'toolsets' and 'annotation_filters'. Use annotation_filters with 'toolsets' key instead."
            )

        # Store filtering configuration before calling parent __init__
        if annotation_filters is not None:
            self.annotation_filters = annotation_filters.copy()
        elif toolsets is not None:
            # Convert legacy toolsets to new annotation_filters format
            toolsets_list = [toolsets] if isinstance(toolsets, str) else list(toolsets)
            self.annotation_filters = {"toolsets": toolsets_list}
        else:
            self.annotation_filters = {}

        self.custom_filter = custom_filter
        self.debug_filtering = debug_filtering
        self.lazy_connect = lazy_connect
        self._lazy_connect_pending = lazy_connect  # Track if we skipped initial connect
        if self.debug_filtering:
            set_log_level_to_debug()
        # Legacy properties for backward compatibility
        self.toolsets = self.annotation_filters.get("toolsets", [])

        # Initialize parent class
        super().__init__(
            command=command,
            url=url,
            env=env,
            transport=transport,
            server_params=server_params,
            session=session,
            timeout_seconds=timeout_seconds,
            client=client,
            include_tools=include_tools,
            exclude_tools=exclude_tools,
            refresh_connection=refresh_connection,
            **kwargs,
        )

    def log(self, message: str) -> None:
        """
        Custom logging function for FilteredMCPTools operations.

        Only logs if debug mode is enabled in agno logging system.
        Prefixes all messages with [FilteredMCPTools] for easy identification.

        Args:
            message: The message to log
            level: Log level ('info' or 'debug')
        """
        if self.debug_filtering:
            prefix = "[FilteredMCPTools] "
            log_debug(prefix + message)

    async def connect(self, force: bool = False) -> None:  # type: ignore[override]
        """
        Connect to the MCP server with lazy connection support.

        When lazy_connect=True (default), this method is a no-op during AgentOS
        startup lifespan. The actual connection happens on first tool use,
        which occurs outside the lifespan context and avoids anyio TaskGroup
        conflicts with enable_mcp_server=True.

        Args:
            force: If True, forces reconnection even if already connected
        """
        if force:
            self._lazy_connect_pending = False

        if self._lazy_connect_pending:
            # Skip connection during startup - will connect on first use
            self.log("Lazy connect enabled - deferring MCP connection until first use")
            return

        # Proceed with actual connection using parent's _connect method
        try:
            await self._connect()
            self.log(f"Connected to MCP server, {len(self.functions)} tools available")
        except RuntimeError as e:
            if "cancel scope" in str(e).lower():
                log_warning(f"[FilteredMCPTools] MCP connection cancelled (will retry on first use): {e}")
                self._lazy_connect_pending = True  # Will try again on first use
            else:
                raise
        except Exception as e:
            log_warning(f"[FilteredMCPTools] MCP connection failed (will retry on first use): {e}")
            self._lazy_connect_pending = True

    async def _ensure_connected(self) -> None:
        """Ensure connection is established before tool use."""
        if self._lazy_connect_pending and not self._initialized:
            self._lazy_connect_pending = False
            self.log("Lazy connect: establishing MCP connection on first use")
            await self._connect()

    def _get_annotation_value(self, tool, annotation_key: str) -> Any:
        """
        Extract annotation value from tool, handling both MCP standard and custom annotations.

        Args:
            tool: MCP tool object
            annotation_key: Name of the annotation to extract (e.g., 'toolsets', 'readOnlyHint')

        Returns:
            The annotation value, or None if annotation doesn't exist or tool has no annotations.
        """
        try:
            if hasattr(tool, "annotations") and tool.annotations:
                return getattr(tool.annotations, annotation_key, None)
            return None
        except Exception:
            return None

    def _annotation_value_matches_filter(self, annotation_value: Any, filter_value: Any) -> bool:
        """
        Check if annotation value matches the filter criteria.

        Args:
            annotation_value: The actual annotation value from the tool
            filter_value: The filter criteria to match against

        Returns:
            True if the annotation value matches the filter, False otherwise

        Filter types supported:
        - Primitive (str/bool/int): Exact match
        - List: OR logic - annotation_value must be in list OR list intersection for list annotations
        - Callable: filter_value(annotation_value) must return True
        """
        if callable(filter_value):
            try:
                return bool(filter_value(annotation_value))
            except Exception:
                return False

        if isinstance(filter_value, list):
            if isinstance(annotation_value, list):
                # List annotation: check if any annotation values match any filter values
                return bool(set(annotation_value) & set(filter_value))
            else:
                # Single annotation: check if it's in the filter list
                return annotation_value in filter_value

        # Primitive exact match
        return annotation_value == filter_value

    def _should_include_tool(self, tool) -> bool:
        """
        Determine if a tool should be included based on all filtering criteria.

        Combines:
        1. Legacy custom_filter (backward compatibility)
        2. Generic annotation_filters (new system)
        3. All filters use AND logic (tool must match ALL criteria)

        Args:
            tool: MCP tool object to evaluate

        Returns:
            True if tool should be included, False otherwise
        """
        # Apply legacy custom filter first (backward compatibility)
        if self.custom_filter:
            try:
                if not self.custom_filter(tool):
                    self.log(f"Tool {tool.name} excluded by custom_filter")
                    return False
            except Exception as e:
                self.log(f"Custom filter error for tool {tool.name}: {e}")
                return False

        # Apply generic annotation filters
        if self.annotation_filters:
            for annotation_key, filter_value in self.annotation_filters.items():
                annotation_value = self._get_annotation_value(tool, annotation_key)

                if not self._annotation_value_matches_filter(annotation_value, filter_value):
                    self.log(
                        f"Tool {tool.name} excluded: {annotation_key}={annotation_value} doesn't match filter {filter_value}"
                    )
                    return False

        return True

    def _coerce_parameters(self, params: Dict[str, Any], schema: Dict[str, Any]) -> Dict[str, Any]:
        """
        Coerce parameter types based on JSON Schema to fix type mismatches from LLM responses.

        Args:
            params: Dictionary of parameters from the LLM
            schema: JSON Schema from the tool's inputSchema

        Returns:
            Dictionary with parameters coerced to correct types
        """
        if not schema or "properties" not in schema:
            return params

        coerced = {}
        properties = schema.get("properties", {})

        for key, value in params.items():
            if key not in properties:
                # Pass through parameters not in schema
                coerced[key] = value
                continue

            prop_schema = properties[key]
            prop_type = prop_schema.get("type")

            # Skip if no type specified or value is None
            if not prop_type or value is None:
                coerced[key] = value
                continue

            try:
                # Coerce based on schema type
                if prop_type == "number" or prop_type == "integer":
                    if isinstance(value, str):
                        coerced[key] = int(value) if prop_type == "integer" else float(value)
                    else:
                        coerced[key] = value
                elif prop_type == "boolean":
                    if isinstance(value, str):
                        coerced[key] = value.lower() in ("true", "1", "yes")
                    else:
                        coerced[key] = bool(value)
                elif prop_type == "string":
                    coerced[key] = str(value) if not isinstance(value, str) else value
                elif prop_type == "array":
                    coerced[key] = list(value) if not isinstance(value, list) else value
                elif prop_type == "object":
                    coerced[key] = dict(value) if not isinstance(value, dict) else value
                else:
                    # Unknown type, pass through
                    coerced[key] = value

                if self.debug_filtering and coerced[key] != value:
                    self.log(
                        f"Parameter coercion: {key} from {type(value).__name__}({value}) to {type(coerced[key]).__name__}({coerced[key]})"
                    )

            except (ValueError, TypeError) as e:
                # If coercion fails, log and pass through original value
                self.log(f"Failed to coerce parameter {key}: {e}")
                coerced[key] = value

        return coerced

    async def initialize(self) -> None:
        """
        Override initialize to add generic annotation-based filtering before the standard filtering.

        If lazy_connect was enabled and connection was deferred, this will be called
        when tools are first needed (outside the startup lifespan context).
        """
        if self._initialized:
            return

        # If lazy connect is pending, we need to establish connection first
        if self._lazy_connect_pending:
            self._lazy_connect_pending = False
            self.log("Lazy connect: establishing MCP connection during initialize")
            # Need to set up the transport context before we can initialize
            # This calls the parent's _connect which sets up session
            await super()._connect()
            return  # _connect already called initialize

        try:
            if self.session is None:
                raise ValueError("Failed to establish session connection")

            # Initialize the session if not already initialized
            await self.session.initialize()

            # Get the list of tools from the MCP server
            available_tools = await self.session.list_tools()

            # Apply annotation-based filtering FIRST
            annotation_filtered_tools = []

            if self.debug_filtering and (self.annotation_filters or self.custom_filter):
                filter_descriptions = []
                if self.annotation_filters:
                    filter_descriptions.append(f"annotation_filters: {self.annotation_filters}")
                if self.custom_filter:
                    filter_descriptions.append("custom_filter")
                filter_desc = ", ".join(filter_descriptions)
                self.log(f"=== FILTERING TOOLS BY {filter_desc.upper()} ===")

            for tool in available_tools.tools:
                if self._should_include_tool(tool):
                    annotation_filtered_tools.append(tool)
                    self.log(f"✓ Including tool: {tool.name}")
                else:
                    if self.debug_filtering:
                        # Show annotation values for excluded tools
                        annotations_info = []
                        for annotation_key in self.annotation_filters.keys():
                            annotation_value = self._get_annotation_value(tool, annotation_key)
                            annotations_info.append(f"{annotation_key}={annotation_value}")
                        annotations_str = ", ".join(annotations_info) if annotations_info else "no matching annotations"
                        self.log(f"✗ Excluding tool: {tool.name} ({annotations_str})")

            if self.debug_filtering and (self.annotation_filters or self.custom_filter):
                self.log(f"=== ANNOTATION FILTERED TOOLS COUNT: {len(annotation_filtered_tools)} ===")

            # Check the existing include/exclude tools filters
            self._check_tools_filters(
                available_tools=[tool.name for tool in annotation_filtered_tools],
                include_tools=self.include_tools,
                exclude_tools=self.exclude_tools,
            )

            # Apply standard include/exclude filtering on top of annotation filtering
            final_filtered_tools = []
            for tool in annotation_filtered_tools:
                if self.exclude_tools and tool.name in self.exclude_tools:
                    continue
                if self.include_tools is None or tool.name in self.include_tools:
                    final_filtered_tools.append(tool)

            self.log(f"=== FINAL FILTERED TOOLS COUNT: {len(final_filtered_tools)} ===")

            # Register the tools with the toolkit
            from agno.utils.mcp import get_entrypoint_for_tool
            from agno.tools.function import Function

            for tool in final_filtered_tools:
                try:
                    # Get an entrypoint for the tool
                    original_entrypoint = get_entrypoint_for_tool(tool, self.session)

                    # Create a type-coercing wrapper around the entrypoint
                    def create_coercing_entrypoint(self_ref, schema, original_fn):
                        """Create an entrypoint that coerces parameter types based on schema."""

                        async def coercing_entrypoint(agent=None, **kwargs):
                            # Coerce parameters based on schema (excluding agent from tool params)
                            coerced_kwargs = self_ref._coerce_parameters(kwargs, schema)
                            # Call original entrypoint (which is a partial with tool_name already bound)
                            # IMPORTANT: Do NOT pass agent to MCP tools - it causes serialization errors
                            # when the agent contains non-serializable objects like ModelInference.
                            # The agent param is accepted here for Agno compatibility but not forwarded.
                            result = original_fn(**coerced_kwargs)

                            # Handle both coroutines and async generators
                            import inspect

                            if inspect.isasyncgen(result):
                                # If it's an async generator, collect all results
                                results = []
                                async for item in result:
                                    results.append(item)
                                return results
                            else:
                                # If it's a coroutine, await it normally
                                return await result

                        return coercing_entrypoint

                    # Wrap the entrypoint with type coercion
                    entrypoint = create_coercing_entrypoint(self, tool.inputSchema, original_entrypoint)

                    # Create a Function for the tool
                    f = Function(
                        name=tool.name,
                        description=tool.description,
                        parameters=tool.inputSchema,
                        entrypoint=entrypoint,
                        # Set skip_entrypoint_processing to True to avoid processing the entrypoint
                        skip_entrypoint_processing=True,
                    )

                    # Register the Function with the toolkit
                    self.functions[f.name] = f
                    self.log(f"Function: {f.name} registered with {self.name}")
                except Exception as e:
                    self.log(f"Failed to register tool {tool.name}: {e}")

            self.log(f"{self.name} initialized with {len(final_filtered_tools)} tools")
            self._initialized = True
        except Exception as e:
            self.log(f"Failed to get MCP tools: {e}")
            raise

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """
        Exit the async context manager with graceful error handling.

        Handles the anyio cancel scope error that occurs when MCP connections
        are cleaned up in a different async task than where they were created.
        This is a known issue with streamable-http transport and AgentOS lifecycle.
        """
        # Suppress async generator and cancel scope warnings during cleanup
        with warnings.catch_warnings():
            warnings.filterwarnings("ignore", category=RuntimeWarning, message=".*async_generator.*")
            warnings.filterwarnings("ignore", message=".*cancel scope.*")

            try:
                # Call parent __aexit__ for proper cleanup
                await super().__aexit__(exc_type, exc_val, exc_tb)
            except RuntimeError as e:
                # Handle the cancel scope error gracefully
                if "cancel scope" in str(e).lower():
                    log_warning(f"[FilteredMCPTools] MCP connection cleanup warning (non-fatal): {e}")
                    # Mark as not initialized so next use will reconnect
                    self._initialized = False
                    self.session = None
                    self._session_context = None
                    self._context = None
                else:
                    raise
            except Exception as e:
                # Log but don't raise for other cleanup errors
                log_warning(f"[FilteredMCPTools] MCP cleanup error (non-fatal): {e}")
                self._initialized = False
                self.session = None
                self._session_context = None
                self._context = None

    async def close(self) -> None:  # type: ignore[override]
        """
        Close the MCP connection with enhanced error handling.

        Overrides parent close() to handle cancel scope errors gracefully.
        """
        if not self._initialized:
            return

        with warnings.catch_warnings():
            warnings.filterwarnings("ignore", category=RuntimeWarning, message=".*async_generator.*")
            warnings.filterwarnings("ignore", message=".*cancel scope.*")

            try:
                await super().close()
            except RuntimeError as e:
                if "cancel scope" in str(e).lower():
                    log_warning(f"[FilteredMCPTools] MCP close warning (non-fatal): {e}")
                else:
                    raise
            except Exception as e:
                log_warning(f"[FilteredMCPTools] MCP close error (non-fatal): {e}")
            finally:
                self._initialized = False
                self.session = None
                self._session_context = None
                self._context = None
