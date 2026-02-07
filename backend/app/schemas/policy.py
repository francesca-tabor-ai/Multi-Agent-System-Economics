from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class PolicyCreate(BaseModel):
    customer_id: str
    daily_budget_limit: float
    workflow_budget_limit: float
    step_limit_per_agent: int


class PolicyResponse(BaseModel):
    policy_id: UUID
    customer_id: str
    daily_budget_limit: float
    workflow_budget_limit: float
    step_limit_per_agent: int
    created_at: datetime

    class Config:
        from_attributes = True


class GuardrailRequest(BaseModel):
    customer_id: str
    workflow_id: UUID
    execution_cost: float
    step_count: int
    agent_id: str


class GuardrailResult(BaseModel):
    status: str  # PASS, WARN, BLOCK
    reason: str
    daily_spend: float
    daily_budget_limit: float
    workflow_budget_limit: float
    cost_pressure: str  # GREEN, AMBER, RED
    spend_velocity: float
