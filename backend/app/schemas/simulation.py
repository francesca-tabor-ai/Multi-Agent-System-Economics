from pydantic import BaseModel


class WorkflowSimulationRequest(BaseModel):
    num_agents: int
    avg_steps_per_agent: int
    tokens_per_step: int
    model_cost_per_1k_tokens: float
    tool_calls_per_step: int = 0
    tool_cost_per_call: float = 0.0


class CostBreakdown(BaseModel):
    cost_per_step: float
    cost_per_agent: float
    cost_per_workflow: float
    monthly_projection: float
    token_cost_per_step: float
    tool_cost_per_step: float
