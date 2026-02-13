"""
IBM i Text-to-SQL Agent

Specializes in translating natural language queries into SQL for IBM i (Db2 for i)
databases. Uses MCP tools for schema discovery, query validation, and execution.

Test: python -m agents.text2sql_agent
"""

from os import getenv
from agno.agent import Agent
from agno.db.postgres import PostgresDb
from agno.tools.mcp import MCPTools
from agno.models.anthropic import Claude
from agno.skills import Skills, LocalSkills

from agents.utils.common import AUDIT, DATA_HANDLING, ERROR_HANDLING, GUARDRAILS, USER_CONTEXT
from agents.utils.tools import get_toolset
from db.session import db_url
from pathlib import Path

MCP_URL = getenv("MCP_URL", "http://ibmi-mcp-server:3010/mcp")
# Exa MCP for research
EXA_API_KEY = getenv("EXA_API_KEY", "")
EXA_MCP_URL = (
    f"https://mcp.exa.ai/mcp?exaApiKey={EXA_API_KEY}&tools="
    "web_search_exa,"
    "get_code_context_exa,"
    "company_research_exa,"
    "crawling_exa,"
    "people_search_exa"
)

_PROJECT_ROOT = Path(__file__).resolve().parents[2]
print(f"Project root: {_PROJECT_ROOT}")
_SKILLS_DIR = _PROJECT_ROOT / "app" / ".agents" / "skills"

# =============================================================================
# Model Configuration
# =============================================================================

AGENT_MODEL = "claude-sonnet-4-5"
AGENT_TEAM_MEMBER_MODEL = "claude-haiku-4-5"

# =============================================================================
# Agent Configuration
# =============================================================================

AGENT_ID = "ibmi-skills"
NAME = "IBM i Management Skill"

DESCRIPTION = """\
You are an expert IBM i database assistant specializing in translating natural \
language questions into SQL queries for Db2 for i.

You help users explore schemas, understand table structures, and write accurate \
SQL queries for IBM i systems.\
"""

INSTRUCTIONS = f"""\
Your mission is to translate natural language questions into accurate SQL queries
for IBM i (Db2 for i) databases. Follow this workflow:

## Workflow

### 1. Schema Discovery Phase
- If the user hasn't specified a schema, use `list_tables_in_schema` to explore available tables
- Look at TABLE_TEXT descriptions to understand what each table contains
- Check NUMBER_ROWS to understand table sizes
- Use `describe_sql_object` for detailed object metadata when needed

### 2. Query Planning Phase
- Identify which tables are needed to answer the question
- Determine the columns required based on the schema
- Plan any JOINs needed between tables
- Consider filtering conditions from the user's question

### 3. Query Validation Phase
- ALWAYS use `validate_query` before executing any SQL
- This validates syntax using IBM i's native SQL parser
- If validation fails, fix the query and validate again
- Never execute a query that hasn't been validated

### 4. Data Sampling (when exploring)
- Use `sample_rows` to generate a sample query for a table
- Then execute the generated SAMPLE_QUERY to understand the data
- This helps understand the data before writing complex queries

## Available Tools

| Tool | Purpose |
|------|---------|
| `validate_query` | Validate SQL syntax before execution |
| `execute_sql` | Execute SQL queries against the database |
| `describe_sql_object` | Get metadata about tables, views, columns |

## Research Tools

- `web_search_exa` - General web search
- `company_research_exa` - Company info
- `people_search_exa` - Find people online
- `get_code_context_exa` - Code examples, docs
- `crawling_exa` - Read a specific URL

## IBM i SQL Guidelines

- Use fully qualified names: SCHEMA.TABLE (e.g., QIWS.QCUSTCDT)
- IBM i uses *LIBL for library list resolution - prefer explicit schemas
- Common system schemas: QSYS2 (catalog), QIWS (sample data), QGPL (general)
- Column names are often 10 characters max in traditional files
- Use UPPER() for case-insensitive comparisons on EBCDIC data
- Date format: Use DATE('YYYY-MM-DD') or IBM i date literals
- FETCH FIRST N ROWS ONLY for limiting results (not LIMIT)

## Response Format

When answering questions:
1. Explain your understanding of the question
2. Show the schema/table discovery process
3. Present the SQL query you plan to execute
4. Show the validation result
5. Display results in a formatted table
6. Provide insights about the data

## Error Handling

- If a table doesn't exist, suggest similar tables from the schema
- If a column doesn't exist, show available columns
- If validation fails, explain the error and show the corrected query
- Always be helpful in guiding users to the right data

{GUARDRAILS}

{DATA_HANDLING}

{ERROR_HANDLING}

{AUDIT}

{USER_CONTEXT}\
"""

# =============================================================================
# Tools
# =============================================================================

tools = [
    MCPTools(
        url=MCP_URL,
        transport="streamable-http",
        timeout_seconds=30,
        include_tools=["execute_sql", "describe_sql_object", "validate_query"],
        requires_confirmation_tools=["execute_sql"],
    ),
    MCPTools(url=EXA_MCP_URL),  # Research
]

# =============================================================================
# Skills
# =============================================================================

skills = LocalSkills(
    path=str(_SKILLS_DIR)
)

# =============================================================================
# Agent Instance
# =============================================================================

skills_agent = Agent(
    id=AGENT_ID,
    name=NAME,
    model=Claude(id=AGENT_MODEL),
    description=DESCRIPTION,
    instructions=INSTRUCTIONS,
    tools=tools,
    # Agent Skill
    skills=Skills([skills]),
    # Response formatting
    markdown=True,
    add_datetime_to_context=True,
    # Storage
    db=PostgresDb(id="agno-storage", db_url=db_url),
    # Session history
    search_session_history=True,
    num_history_sessions=2,
    # Agent history
    add_history_to_context=True,
    num_history_runs=3,
    # Chat tools
    read_chat_history=True,
    read_tool_call_history=True,
    # Reliability
    retries=3,
    # Memory
    enable_agentic_memory=True,
)

# =============================================================================
# Team Member Variant (lightweight, no storage)
# =============================================================================

text2sql_team_member = Agent(
    name=NAME,
    role=DESCRIPTION,
    model=Claude(id=AGENT_TEAM_MEMBER_MODEL),
    instructions=INSTRUCTIONS,
    tools=tools,
    markdown=True,
)

if __name__ == "__main__":
    skills_agent.print_response(
        "What tables are available in the QIWS schema?",
        stream=True,
    )
