"""Generate synthetic workflow events for demo mode."""

import random
import uuid
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.models.workflow import Workflow
from app.models.execution_event import ExecutionEvent
from app.models.budget_policy import BudgetPolicy

MODEL_TIERS = {
    "gpt-4-turbo": 0.01,
    "gpt-4o": 0.005,
    "gpt-3.5-turbo": 0.0015,
    "claude-3-opus": 0.015,
    "claude-3-sonnet": 0.003,
}

AGENT_NAMES = [
    "planner-agent",
    "research-agent",
    "writer-agent",
    "reviewer-agent",
    "tool-agent",
    "summarizer-agent",
    "validator-agent",
    "router-agent",
]

WORKFLOW_TYPES = [
    "content-generation",
    "data-analysis",
    "customer-support",
    "code-review",
    "document-processing",
]


def seed_demo_data(db: Session, customer_id: str = "demo-customer"):
    existing = db.query(Workflow).filter(Workflow.customer_id == customer_id).first()
    if existing:
        return {"message": "Demo data already exists", "seeded": False}

    workflows = []
    for i in range(5):
        wf = Workflow(
            workflow_id=uuid.uuid4(),
            customer_id=customer_id,
            workflow_name=f"workflow-{WORKFLOW_TYPES[i]}",
            task_type=WORKFLOW_TYPES[i],
            created_at=datetime.utcnow() - timedelta(days=random.randint(0, 14)),
        )
        db.add(wf)
        workflows.append(wf)

    db.flush()

    events = []
    for day_offset in range(14):
        date = datetime.utcnow() - timedelta(days=day_offset)
        num_runs = random.randint(3, 12)

        for _ in range(num_runs):
            wf = random.choice(workflows)
            num_agents = random.randint(2, 8)
            agents = random.sample(AGENT_NAMES, min(num_agents, len(AGENT_NAMES)))
            model_name = random.choice(list(MODEL_TIERS.keys()))
            cost_per_1k = MODEL_TIERS[model_name]

            for agent_id in agents:
                steps = random.randint(1, 6)
                for step in range(steps):
                    tokens_in = random.randint(500, 3000)
                    tokens_out = random.randint(200, 2000)
                    tool_calls = random.randint(0, 4)
                    tool_cost = round(tool_calls * random.uniform(0.01, 0.50), 4)
                    token_cost = ((tokens_in + tokens_out) / 1000) * cost_per_1k
                    total_cost = round(token_cost + tool_cost, 6)

                    event = ExecutionEvent(
                        execution_id=uuid.uuid4(),
                        workflow_id=wf.workflow_id,
                        agent_id=agent_id,
                        model_name=model_name,
                        tokens_in=tokens_in,
                        tokens_out=tokens_out,
                        tool_calls=tool_calls,
                        tool_cost_total=tool_cost,
                        execution_cost_total=total_cost,
                        latency_ms=random.randint(100, 5000),
                        confidence_score=round(random.uniform(0.6, 1.0), 2),
                        timestamp=date + timedelta(
                            hours=random.randint(0, 23),
                            minutes=random.randint(0, 59),
                        ),
                    )
                    db.add(event)
                    events.append(event)

    # Seed a default budget policy
    policy = BudgetPolicy(
        policy_id=uuid.uuid4(),
        customer_id=customer_id,
        daily_budget_limit=50.0,
        workflow_budget_limit=5.0,
        step_limit_per_agent=10,
    )
    db.add(policy)

    db.commit()

    return {"message": f"Seeded {len(workflows)} workflows, {len(events)} events, 1 policy", "seeded": True}
