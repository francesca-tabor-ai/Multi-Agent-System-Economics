import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class Workflow(Base):
    __tablename__ = "workflows"

    workflow_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(String, nullable=False, index=True)
    workflow_name = Column(String, nullable=False)
    task_type = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    executions = relationship("ExecutionEvent", back_populates="workflow")
