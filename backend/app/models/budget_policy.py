import uuid
from datetime import datetime

from sqlalchemy import Column, String, Float, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class BudgetPolicy(Base):
    __tablename__ = "budget_policies"

    policy_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(String, nullable=False, index=True)
    daily_budget_limit = Column(Float, nullable=False)
    workflow_budget_limit = Column(Float, nullable=False)
    step_limit_per_agent = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
