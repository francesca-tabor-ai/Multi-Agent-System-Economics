from app.schemas.simulation import WorkflowSimulationRequest, CostBreakdown

RUNS_PER_DAY = 10
DAYS_PER_MONTH = 30


def simulate_workflow_cost(req: WorkflowSimulationRequest) -> CostBreakdown:
    token_cost_per_step = (req.tokens_per_step / 1000) * req.model_cost_per_1k_tokens
    tool_cost_per_step = req.tool_calls_per_step * req.tool_cost_per_call
    cost_per_step = token_cost_per_step + tool_cost_per_step
    cost_per_agent = cost_per_step * req.avg_steps_per_agent
    cost_per_workflow = cost_per_agent * req.num_agents
    monthly_projection = cost_per_workflow * RUNS_PER_DAY * DAYS_PER_MONTH

    return CostBreakdown(
        cost_per_step=round(cost_per_step, 6),
        cost_per_agent=round(cost_per_agent, 6),
        cost_per_workflow=round(cost_per_workflow, 6),
        monthly_projection=round(monthly_projection, 2),
        token_cost_per_step=round(token_cost_per_step, 6),
        tool_cost_per_step=round(tool_cost_per_step, 6),
    )
