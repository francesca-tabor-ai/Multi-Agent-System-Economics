import uuid
from datetime import datetime

from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class ExecutionEvent(Base):
    __tablename__ = "execution_events"

    execution_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workflow_id = Column(UUID(as_uuid=True), ForeignKey("workflows.workflow_id"), nullable=False)
    agent_id = Column(String, nullable=False)
    model_name = Column(String, nullable=False)
    tokens_in = Column(Integer, nullable=False)
    tokens_out = Column(Integer, nullable=False)
    tool_calls = Column(Integer, default=0)
    tool_cost_total = Column(Float, default=0.0)
    execution_cost_total = Column(Float, nullable=False)
    latency_ms = Column(Integer, nullable=True)
    confidence_score = Column(Float, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    workflow = relationship("Workflow", back_populates="executions")
