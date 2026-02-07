from fastapi import APIRouter

from app.schemas.simulation import WorkflowSimulationRequest, CostBreakdown
from app.services.cost_calculator import simulate_workflow_cost

router = APIRouter(prefix="/simulate", tags=["simulation"])


@router.post("/workflow-cost", response_model=CostBreakdown)
def run_simulation(req: WorkflowSimulationRequest):
    return simulate_workflow_cost(req)
