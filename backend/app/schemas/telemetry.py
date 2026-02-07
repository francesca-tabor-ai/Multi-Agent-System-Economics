from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class ExecutionEventCreate(BaseModel):
    workflow_id: UUID
    agent_id: str
    model_name: str
    tokens_in: int
    tokens_out: int
    tool_calls: int = 0
    tool_cost_total: float = 0.0
    execution_cost_total: float
    latency_ms: Optional[int] = None
    confidence_score: Optional[float] = None


class ExecutionEventResponse(BaseModel):
    execution_id: UUID
    workflow_id: UUID
    agent_id: str
    model_name: str
    tokens_in: int
    tokens_out: int
    tool_calls: int
    tool_cost_total: float
    execution_cost_total: float
    latency_ms: Optional[int]
    confidence_score: Optional[float]
    timestamp: datetime

    class Config:
        from_attributes = True


class CostSummary(BaseModel):
    total_cost: float
    total_executions: int
    avg_cost_per_execution: float
    total_tokens: int
    cost_by_agent: dict[str, float]
    cost_by_workflow: dict[str, float]
    cost_trend: list[dict]
    spike_detected: bool
