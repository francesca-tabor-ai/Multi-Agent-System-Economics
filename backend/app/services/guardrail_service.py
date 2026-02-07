from datetime import datetime, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.budget_policy import BudgetPolicy
from app.models.execution_event import ExecutionEvent
from app.schemas.policy import GuardrailRequest, GuardrailResult


def evaluate_guardrail(db: Session, req: GuardrailRequest) -> GuardrailResult:
    policy = (
        db.query(BudgetPolicy)
        .filter(BudgetPolicy.customer_id == req.customer_id)
        .order_by(BudgetPolicy.created_at.desc())
        .first()
    )

    if not policy:
        return GuardrailResult(
            status="PASS",
            reason="No policy configured — defaulting to PASS",
            daily_spend=0.0,
            daily_budget_limit=0.0,
            workflow_budget_limit=0.0,
            cost_pressure="GREEN",
            spend_velocity=0.0,
        )

    # Calculate daily spend
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    daily_spend_result = (
        db.query(func.coalesce(func.sum(ExecutionEvent.execution_cost_total), 0.0))
        .filter(
            ExecutionEvent.timestamp >= today_start,
        )
        .scalar()
    )
    daily_spend = float(daily_spend_result)

    # Calculate spend velocity (cost per hour today)
    hours_elapsed = max((datetime.utcnow() - today_start).total_seconds() / 3600, 1)
    spend_velocity = daily_spend / hours_elapsed

    # Forecast remaining daily spend
    hours_remaining = 24 - hours_elapsed
    forecasted_spend = daily_spend + (spend_velocity * hours_remaining)

    # Evaluate guardrail rules
    status = "PASS"
    reason = "Within budget"

    if req.execution_cost > policy.workflow_budget_limit:
        status = "BLOCK"
        reason = f"Execution cost ${req.execution_cost:.4f} exceeds workflow budget limit ${policy.workflow_budget_limit:.2f}"
    elif daily_spend > policy.daily_budget_limit:
        status = "BLOCK"
        reason = f"Daily spend ${daily_spend:.4f} exceeds daily budget ${policy.daily_budget_limit:.2f}"
    elif daily_spend > policy.daily_budget_limit * 0.8:
        status = "WARN"
        reason = f"Daily spend ${daily_spend:.4f} is at {(daily_spend / policy.daily_budget_limit * 100):.0f}% of daily budget"
    elif req.step_count > policy.step_limit_per_agent:
        status = "WARN"
        reason = f"Step count {req.step_count} exceeds agent step limit {policy.step_limit_per_agent}"

    # Cost pressure indicator
    if policy.daily_budget_limit > 0:
        budget_ratio = forecasted_spend / policy.daily_budget_limit
        if budget_ratio >= 1.0:
            cost_pressure = "RED"
        elif budget_ratio >= 0.7:
            cost_pressure = "AMBER"
        else:
            cost_pressure = "GREEN"
    else:
        cost_pressure = "GREEN"

    return GuardrailResult(
        status=status,
        reason=reason,
        daily_spend=round(daily_spend, 4),
        daily_budget_limit=policy.daily_budget_limit,
        workflow_budget_limit=policy.workflow_budget_limit,
        cost_pressure=cost_pressure,
        spend_velocity=round(spend_velocity, 4),
    )
