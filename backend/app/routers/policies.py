from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.budget_policy import BudgetPolicy
from app.schemas.policy import PolicyCreate, PolicyResponse, GuardrailRequest, GuardrailResult
from app.services.guardrail_service import evaluate_guardrail

router = APIRouter(tags=["policies"])


@router.post("/policies/create", response_model=PolicyResponse)
def create_policy(policy: PolicyCreate, db: Session = Depends(get_db)):
    db_policy = BudgetPolicy(**policy.model_dump())
    db.add(db_policy)
    db.commit()
    db.refresh(db_policy)
    return db_policy


@router.get("/policies/{customer_id}", response_model=list[PolicyResponse])
def get_policies(customer_id: str, db: Session = Depends(get_db)):
    policies = (
        db.query(BudgetPolicy)
        .filter(BudgetPolicy.customer_id == customer_id)
        .order_by(BudgetPolicy.created_at.desc())
        .all()
    )
    return policies


@router.post("/guardrail/evaluate", response_model=GuardrailResult)
def evaluate(req: GuardrailRequest, db: Session = Depends(get_db)):
    return evaluate_guardrail(db, req)
