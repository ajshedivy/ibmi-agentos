"""
AgentOS
=======

The main entry point for AgentOS.

Run:
    python -m app.main
"""

from os import getenv
from pathlib import Path

from agno.os import AgentOS

from agents.knowledge_agent import knowledge_agent
from agents.pal import pal, pal_knowledge
from agents.performance_agent import performance_agent
from agents.ptf_agent import ptf_agent
from agents.sample_data_agent import sample_agent
from agents.security_audit_agent import security_audit_agent
from agents.text2sql_agent import text2sql_agent
from agents.skills_agent import skills_agent
from db import get_postgres_db
from teams.ibmi_team import ibmi_team

# ============================================================================
# Create AgentOS
# ============================================================================
agent_os = AgentOS(
    name="AgentOS",
    tracing=True,
    db=get_postgres_db(),
    agents=[
        pal,
        knowledge_agent,
        performance_agent,
        ptf_agent,
        sample_agent,
        security_audit_agent,
        text2sql_agent,
        skills_agent
    ],
    teams=[ibmi_team],
    knowledge=[pal_knowledge],
    config=str(Path(__file__).parent / "config.yaml"),
    enable_mcp_server=True
)

app = agent_os.get_app()

if __name__ == "__main__":
    agent_os.serve(
        app="main:app",
        reload=getenv("RUNTIME_ENV", "prd") == "dev",
    )
