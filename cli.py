"""Interactive CLI for running AgentOS agents from the command line."""

from __future__ import annotations

import argparse
import asyncio
import importlib
import uuid
from dataclasses import dataclass
from typing import Any

from dotenv import load_dotenv
import os

load_dotenv()
os.environ["MCP_URL"] = "http://localhost:3010/mcp"


@dataclass(frozen=True)
class AgentSpec:
    module: str
    attr: str
    label: str


AGENTS: dict[str, AgentSpec] = {
    "knowledge": AgentSpec(
        "agents.knowledge_agent", "knowledge_agent", "Knowledge Agent"
    ),
    "pal": AgentSpec("agents.pal", "pal", "Pal"),
    "performance": AgentSpec(
        "agents.performance_agent", "performance_agent", "IBM i Performance Monitor"
    ),
    "ptf": AgentSpec("agents.ptf_agent", "ptf_agent", "IBM i PTF Management"),
    "sample": AgentSpec(
        "agents.sample_data_agent", "sample_agent", "IBM i Sample Database"
    ),
    "security": AgentSpec(
        "agents.security_audit_agent", "security_audit_agent", "IBM i Security Audit"
    ),
    "text2sql": AgentSpec(
        "agents.text2sql_agent", "text2sql_agent", "IBM i Text-to-SQL"
    ),
    "library-list": AgentSpec(
        "agents.library_list_security_agent",
        "library_list_agent",
        "IBM i Library List Security",
    ),
    "skills": AgentSpec(
        "agents.skills_agent", "skills_agent", "IBM i Management Skill"
    ),
    "ibmi-team": AgentSpec("teams.ibmi_team", "ibmi_team", "IBM i Team"),
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Run AgentOS agents interactively from the terminal."
    )
    parser.add_argument(
        "-a",
        "--agent",
        default="knowledge",
        choices=sorted(AGENTS.keys()),
        help="Agent key to start with.",
    )
    parser.add_argument(
        "-p",
        "--prompt",
        help="Optional one-shot prompt. If set, runs once and exits.",
    )
    parser.add_argument(
        "--list", action="store_true", help="List available agents and exit."
    )
    return parser.parse_args()


def list_agents() -> None:
    print("Available agents:")
    for key in sorted(AGENTS.keys()):
        print(f"  - {key:<12} {AGENTS[key].label}")


def load_agent(agent_key: str) -> Any:
    spec = AGENTS[agent_key]
    module = importlib.import_module(spec.module)
    return getattr(module, spec.attr)


def print_help() -> None:
    print("Commands:")
    print("  /agents           List available agents")
    print("  /use <agent-key>  Switch active agent")
    print("  /help             Show this help")
    print("  /quit             Exit")


async def run_once(agent: Any, prompt: str, session_id: str) -> None:
    """Run a single prompt against an agent with proper async MCP lifecycle."""
    await agent.aprint_response(prompt, stream=True, session_id=session_id)


async def run_repl(start_agent_key: str) -> None:
    active_key = start_agent_key
    active_agent = load_agent(active_key)
    session_id = str(uuid.uuid4())

    print(f"Interactive Agent CLI (active: {active_key})")
    print("Type /help for commands.")

    loop = asyncio.get_event_loop()

    while True:
        try:
            prompt = await loop.run_in_executor(
                None, lambda: input(f"[{active_key}] > ").strip()
            )
        except (EOFError, KeyboardInterrupt):
            print("\nExiting.")
            break

        if not prompt:
            continue
        if prompt == "/quit":
            print("Exiting.")
            break
        if prompt == "/help":
            print_help()
            continue
        if prompt == "/agents":
            list_agents()
            continue
        if prompt.startswith("/use "):
            next_key = prompt.split(maxsplit=1)[1].strip()
            if next_key not in AGENTS:
                print(f"Unknown agent '{next_key}'. Use /agents to see valid keys.")
                continue
            active_key = next_key
            active_agent = load_agent(active_key)
            session_id = str(uuid.uuid4())
            print(f"Switched to: {active_key}")
            continue

        await run_once(active_agent, prompt, session_id)


def main() -> None:
    load_dotenv()
    args = parse_args()

    if args.list:
        list_agents()
        return

    agent = load_agent(args.agent)
    if args.prompt:
        session_id = str(uuid.uuid4())
        asyncio.run(run_once(agent, args.prompt, session_id))
        return

    asyncio.run(run_repl(args.agent))


if __name__ == "__main__":
    main()
