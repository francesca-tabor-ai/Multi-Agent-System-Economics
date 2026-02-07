# Multi-Agent System Economics

Real-time cost visibility, cost forecasting, and runtime budget guardrails for multi-agent workflows.

## Overview

MAS Economics provides three core capabilities for teams running multi-agent systems:

1. **Pre-execution workflow cost simulation** — Estimate costs before deploying agent workflows
2. **Real-time cost telemetry and attribution** — Track spending by agent, workflow, and time
3. **Budget and guardrail enforcement signaling** — Prevent cost overruns from autonomous agent loops

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js App   │────▶│  FastAPI Backend │────▶│   PostgreSQL    │
│   Port 3000     │     │   Port 8000      │     │   Port 5432     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Recharts |
| Backend  | FastAPI, SQLAlchemy, Pydantic, structlog |
| Database | PostgreSQL 16                     |
| Infra    | Docker Compose                    |

## Quick Start

### Using Docker Compose (recommended)

```bash
cp .env.example .env
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

Click **Seed Demo Data** on the home page to populate the database with synthetic telemetry.

### Local Development

**Backend:**

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Requires a running PostgreSQL instance. Set `DATABASE_URL` in `backend/.env`.

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL` in `frontend/.env.local` (defaults to `http://localhost:8000`).

## Features

### Cost Simulator (`/simulator`)

Input workflow parameters and receive an instant cost estimate:

- Number of agents, steps per agent, tokens per step
- Model cost tier (GPT-4 Turbo, GPT-4o, GPT-3.5 Turbo, Claude 3 Opus, Claude 3 Sonnet)
- Tool calls per step and tool cost per call

**Outputs:** cost per step, cost per agent, cost per workflow, monthly projection.

### Cost Dashboard (`/dashboard`)

Displays cost telemetry from workflow executions:

- Total cost, execution count, average cost per execution, total tokens
- Time series cost trend chart
- Agent cost distribution chart
- Cost spike detection (flags days exceeding 2x average)

### Budget Guardrails (`/guardrails`)

Configure budget policies and evaluate guardrail signals:

**Policy rules:**
- Max cost per workflow
- Daily MAS budget
- Max steps per agent

**Evaluation output:**
- `PASS` — within budget
- `WARN` — approaching limit (>80% daily budget or step limit exceeded)
- `BLOCK` — exceeds limit

**Cost Pressure Indicator:**
- `GREEN` — healthy
- `AMBER` — elevated risk (>70% forecasted spend)
- `RED` — budget overrun likely

## API Endpoints

| Method | Path                          | Description                    |
|--------|-------------------------------|--------------------------------|
| POST   | `/simulate/workflow-cost`     | Run cost simulation            |
| POST   | `/telemetry/execution-event`  | Ingest an execution event      |
| GET    | `/telemetry/cost-summary`     | Get cost summary (query: days) |
| POST   | `/policies/create`            | Create a budget policy         |
| GET    | `/policies/{customer_id}`     | Get policies for a customer    |
| POST   | `/guardrail/evaluate`         | Evaluate guardrail rules       |
| POST   | `/seed-demo-data`             | Generate synthetic demo data   |
| GET    | `/health`                     | Health check                   |

## Cost Calculation Formula

```
Base Token Cost = (tokens_in + tokens_out) / 1000 * model_cost_per_1k_tokens
Tool Cost       = tool_calls * tool_cost_per_call
Total Cost      = Base Token Cost + Tool Cost
```

## Data Model

**Workflow** — `workflow_id`, `customer_id`, `workflow_name`, `task_type`, `created_at`

**ExecutionEvent** — `execution_id`, `workflow_id`, `agent_id`, `model_name`, `tokens_in`, `tokens_out`, `tool_calls`, `tool_cost_total`, `execution_cost_total`, `latency_ms`, `confidence_score`, `timestamp`

**BudgetPolicy** — `policy_id`, `customer_id`, `daily_budget_limit`, `workflow_budget_limit`, `step_limit_per_agent`, `created_at`

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entry point
│   │   ├── config.py            # Environment settings
│   │   ├── database.py          # SQLAlchemy engine and session
│   │   ├── models/              # SQLAlchemy ORM models
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   ├── routers/             # API route handlers
│   │   └── services/            # Business logic
│   ├── alembic/                 # Database migrations
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── page.tsx             # Home page
│   │   ├── simulator/page.tsx   # Cost simulator
│   │   ├── dashboard/page.tsx   # Cost dashboard
│   │   └── guardrails/page.tsx  # Budget guardrails
│   ├── components/              # Shared UI components
│   ├── lib/api.ts               # API client
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── .env.example
```

## Environment Variables

| Variable              | Default                                              | Description            |
|-----------------------|------------------------------------------------------|------------------------|
| `DATABASE_URL`        | `postgresql://postgres:postgres@localhost:5432/mas_economics` | PostgreSQL connection  |
| `API_KEY`             | `dev-api-key`                                        | API authentication key |
| `DEBUG`               | `true`                                               | Enable debug mode      |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000`                               | Backend API URL        |

## Post-MVP Roadmap

- **Phase 2:** Real-time guardrail enforcement API
- **Phase 3:** Cost-aware agent planning SDK
- **Phase 4:** Self-optimising economic routing engine
