import structlog
from fastapi import FastAPI, Depends, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.config import settings
from app.database import Base, engine, get_db
from app.logging_config import setup_logging
from app.routers import simulation, telemetry, policies
from app.services.seed_data import seed_demo_data

setup_logging()
log = structlog.get_logger()

app = FastAPI(title=settings.app_name, version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Basic API key auth stub
def verify_api_key(x_api_key: str = Header(default=None)):
    if settings.debug:
        return
    if x_api_key != settings.api_key:
        raise HTTPException(status_code=401, detail="Invalid API key")


app.include_router(simulation.router, dependencies=[Depends(verify_api_key)])
app.include_router(telemetry.router, dependencies=[Depends(verify_api_key)])
app.include_router(policies.router, dependencies=[Depends(verify_api_key)])


@app.on_event("startup")
def on_startup():
    log.info("Creating database tables")
    Base.metadata.create_all(bind=engine)
    log.info("Application started", app_name=settings.app_name)


@app.get("/health")
def health():
    return {"status": "ok", "app": settings.app_name}


@app.post("/seed-demo-data")
def seed_data(db: Session = Depends(get_db)):
    result = seed_demo_data(db)
    return result
