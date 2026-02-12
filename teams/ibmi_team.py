"""
IBM i Agent Team

Coordinates specialized IBM i agents (performance, PTF, security, sample data,
and text-to-SQL) under a team leader that routes and synthesizes responses.

Usage:
    from teams.ibmi_team import ibmi_team
"""

from agno.team import Team
from agno.models.anthropic import Claude
from agno.db.postgres import PostgresDb

from agents.performance_agent import performance_team_member
from agents.ptf_agent import ptf_team_member
from agents.security_audit_agent import security_audit_team_member
from agents.sample_data_agent import sample_team_member
from agents.text2sql_agent import text2sql_team_member
from db.session import db_url

# =============================================================================
# Model Configuration
# =============================================================================

TEAM_LEADER_MODEL = "claude-sonnet-4-5"

# =============================================================================
# Team Configuration
# =============================================================================

TEAM_ID = "ibmi-team"
NAME = "IBM i Team"

DESCRIPTION = """\
A coordinated team of IBM i specialists that work together to handle \
complex system administration tasks spanning performance monitoring, \
PTF management, security auditing, database queries, and sample data exploration.\
"""

INSTRUCTIONS = [
    "You are the team leader for a group of IBM i specialists.",
    "Analyze each request and delegate to the most appropriate team member(s).",
    "For requests spanning multiple domains (e.g., 'check system health'), "
    "coordinate across multiple members and synthesize their findings.",
    "Always provide a unified, coherent response that combines member insights.",
    "If a request is ambiguous, use your judgment to route it — "
    "don't ask the user to clarify which agent to use.",
]

# =============================================================================
# Team Instance
# =============================================================================

ibmi_team = Team(
    id=TEAM_ID,
    name=NAME,
    model=Claude(id=TEAM_LEADER_MODEL),
    description=DESCRIPTION,
    instructions=INSTRUCTIONS,
    members=[
        performance_team_member,
        ptf_team_member,
        security_audit_team_member,
        sample_team_member,
        text2sql_team_member,
    ],
    # Storage
    db=PostgresDb(id="agno-storage", db_url=db_url),
    # Reliability
    retries=3,
    # Response formatting
    markdown=True,
    # Show member responses in output
    show_members_responses=True,
    enable_agentic_memory=True,
)
