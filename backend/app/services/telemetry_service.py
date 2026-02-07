from datetime import datetime, timedelta
from uuid import UUID

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.execution_event import ExecutionEvent
from app.schemas.telemetry import CostSummary


def get_cost_summary(db: Session, days: int = 7) -> CostSummary:
    cutoff = datetime.utcnow() - timedelta(days=days)

    events = db.query(ExecutionEvent).filter(ExecutionEvent.timestamp >= cutoff).all()

    if not events:
        return CostSummary(
            total_cost=0.0,
            total_executions=0,
            avg_cost_per_execution=0.0,
            total_tokens=0,
            cost_by_agent={},
            cost_by_workflow={},
            cost_trend=[],
            spike_detected=False,
        )

    total_cost = sum(e.execution_cost_total for e in events)
    total_tokens = sum(e.tokens_in + e.tokens_out for e in events)
    avg_cost = total_cost / len(events) if events else 0

    cost_by_agent: dict[str, float] = {}
    for e in events:
        cost_by_agent[e.agent_id] = cost_by_agent.get(e.agent_id, 0) + e.execution_cost_total

    cost_by_workflow: dict[str, float] = {}
    for e in events:
        wf_key = str(e.workflow_id)
        cost_by_workflow[wf_key] = cost_by_workflow.get(wf_key, 0) + e.execution_cost_total

    # Build daily cost trend
    daily_costs: dict[str, float] = {}
    for e in events:
        day_key = e.timestamp.strftime("%Y-%m-%d")
        daily_costs[day_key] = daily_costs.get(day_key, 0) + e.execution_cost_total

    cost_trend = [{"date": k, "cost": round(v, 4)} for k, v in sorted(daily_costs.items())]

    # Spike detection: flag if any day exceeds 2x the average daily cost
    daily_values = list(daily_costs.values())
    avg_daily = sum(daily_values) / len(daily_values) if daily_values else 0
    spike_detected = any(v > avg_daily * 2 for v in daily_values) if len(daily_values) > 1 else False

    return CostSummary(
        total_cost=round(total_cost, 4),
        total_executions=len(events),
        avg_cost_per_execution=round(avg_cost, 4),
        total_tokens=total_tokens,
        cost_by_agent={k: round(v, 4) for k, v in cost_by_agent.items()},
        cost_by_workflow={k: round(v, 4) for k, v in cost_by_workflow.items()},
        cost_trend=cost_trend,
        spike_detected=spike_detected,
    )
