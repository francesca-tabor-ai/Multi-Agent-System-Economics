const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export interface SimulationRequest {
  num_agents: number;
  avg_steps_per_agent: number;
  tokens_per_step: number;
  model_cost_per_1k_tokens: number;
  tool_calls_per_step: number;
  tool_cost_per_call: number;
}

export interface CostBreakdown {
  cost_per_step: number;
  cost_per_agent: number;
  cost_per_workflow: number;
  monthly_projection: number;
  token_cost_per_step: number;
  tool_cost_per_step: number;
}

export interface CostSummary {
  total_cost: number;
  total_executions: number;
  avg_cost_per_execution: number;
  total_tokens: number;
  cost_by_agent: Record<string, number>;
  cost_by_workflow: Record<string, number>;
  cost_trend: { date: string; cost: number }[];
  spike_detected: boolean;
}

export interface PolicyCreate {
  customer_id: string;
  daily_budget_limit: number;
  workflow_budget_limit: number;
  step_limit_per_agent: number;
}

export interface Policy {
  policy_id: string;
  customer_id: string;
  daily_budget_limit: number;
  workflow_budget_limit: number;
  step_limit_per_agent: number;
  created_at: string;
}

export interface GuardrailRequest {
  customer_id: string;
  workflow_id: string;
  execution_cost: number;
  step_count: number;
  agent_id: string;
}

export interface GuardrailResult {
  status: string;
  reason: string;
  daily_spend: number;
  daily_budget_limit: number;
  workflow_budget_limit: number;
  cost_pressure: string;
  spend_velocity: number;
}

export const api = {
  simulateWorkflowCost(data: SimulationRequest) {
    return apiFetch<CostBreakdown>("/simulate/workflow-cost", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getCostSummary(days: number = 7) {
    return apiFetch<CostSummary>(`/telemetry/cost-summary?days=${days}`);
  },

  createPolicy(data: PolicyCreate) {
    return apiFetch<Policy>("/policies/create", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getPolicies(customerId: string) {
    return apiFetch<Policy[]>(`/policies/${customerId}`);
  },

  evaluateGuardrail(data: GuardrailRequest) {
    return apiFetch<GuardrailResult>("/guardrail/evaluate", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  seedDemoData() {
    return apiFetch<{ message: string; seeded: boolean }>("/seed-demo-data", {
      method: "POST",
    });
  },
};
