from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.execution_event import ExecutionEvent
from app.schemas.telemetry import ExecutionEventCreate, ExecutionEventResponse, CostSummary
from app.services.telemetry_service import get_cost_summary

router = APIRouter(prefix="/telemetry", tags=["telemetry"])


@router.post("/execution-event", response_model=ExecutionEventResponse)
def ingest_execution_event(event: ExecutionEventCreate, db: Session = Depends(get_db)):
    db_event = ExecutionEvent(**event.model_dump())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event


@router.get("/cost-summary", response_model=CostSummary)
def cost_summary(days: int = Query(default=7, ge=1, le=90), db: Session = Depends(get_db)):
    return get_cost_summary(db, days=days)
