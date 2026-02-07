"use client";

import { useState } from "react";
import { api, type CostBreakdown, type SimulationRequest } from "@/lib/api";

const MODEL_TIERS: Record<string, number> = {
  "gpt-4-turbo": 0.01,
  "gpt-4o": 0.005,
  "gpt-3.5-turbo": 0.0015,
  "claude-3-opus": 0.015,
  "claude-3-sonnet": 0.003,
};

const defaultForm: SimulationRequest = {
  num_agents: 4,
  avg_steps_per_agent: 5,
  tokens_per_step: 1500,
  model_cost_per_1k_tokens: 0.01,
  tool_calls_per_step: 2,
  tool_cost_per_call: 0.05,
};

export default function SimulatorPage() {
  const [form, setForm] = useState<SimulationRequest>(defaultForm);
  const [result, setResult] = useState<CostBreakdown | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField(field: keyof SimulationRequest, value: number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSimulate() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.simulateWorkflowCost(form);
      setResult(data);
    } catch {
      setError("Simulation failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Workflow Cost Simulator</h1>
        <p className="text-gray-400 mt-1">
          Estimate costs before executing your multi-agent workflow.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="space-y-6 p-6 rounded-lg border border-gray-800 bg-gray-900/50">
          <h2 className="text-lg font-semibold">Workflow Parameters</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Number of Agents
              </label>
              <input
                type="number"
                min={1}
                value={form.num_agents}
                onChange={(e) =>
                  updateField("num_agents", parseInt(e.target.value) || 1)
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Avg Steps per Agent
              </label>
              <input
                type="number"
                min={1}
                value={form.avg_steps_per_agent}
                onChange={(e) =>
                  updateField(
                    "avg_steps_per_agent",
                    parseInt(e.target.value) || 1
                  )
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Tokens per Step
              </label>
              <input
                type="number"
                min={1}
                value={form.tokens_per_step}
                onChange={(e) =>
                  updateField("tokens_per_step", parseInt(e.target.value) || 1)
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Model Cost Tier
              </label>
              <select
                value={form.model_cost_per_1k_tokens}
                onChange={(e) =>
                  updateField(
                    "model_cost_per_1k_tokens",
                    parseFloat(e.target.value)
                  )
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              >
                {Object.entries(MODEL_TIERS).map(([name, cost]) => (
                  <option key={name} value={cost}>
                    {name} (${cost}/1K tokens)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Tool Calls per Step
              </label>
              <input
                type="number"
                min={0}
                value={form.tool_calls_per_step}
                onChange={(e) =>
                  updateField(
                    "tool_calls_per_step",
                    parseInt(e.target.value) || 0
                  )
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Tool Cost per Call ($)
              </label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.tool_cost_per_call}
                onChange={(e) =>
                  updateField(
                    "tool_cost_per_call",
                    parseFloat(e.target.value) || 0
                  )
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleSimulate}
            disabled={loading}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 rounded-md text-sm font-medium transition-colors"
          >
            {loading ? "Calculating..." : "Simulate Cost"}
          </button>

          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>

        {/* Results */}
        <div className="space-y-6 p-6 rounded-lg border border-gray-800 bg-gray-900/50">
          <h2 className="text-lg font-semibold">Cost Breakdown</h2>

          {result ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <CostCard
                  label="Cost per Step"
                  value={result.cost_per_step}
                  sub={`Token: $${result.token_cost_per_step.toFixed(6)} | Tool: $${result.tool_cost_per_step.toFixed(6)}`}
                />
                <CostCard
                  label="Cost per Agent"
                  value={result.cost_per_agent}
                />
                <CostCard
                  label="Cost per Workflow"
                  value={result.cost_per_workflow}
                  highlight
                />
                <CostCard
                  label="Monthly Projection"
                  value={result.monthly_projection}
                  highlight
                  sub="Based on 10 runs/day"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
              Run a simulation to see cost breakdown
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CostCard({
  label,
  value,
  highlight,
  sub,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  sub?: string;
}) {
  return (
    <div
      className={`p-4 rounded-lg ${highlight ? "bg-emerald-900/20 border border-emerald-800" : "bg-gray-800/50"}`}
    >
      <p className="text-xs text-gray-400">{label}</p>
      <p
        className={`text-xl font-bold mt-1 ${highlight ? "text-emerald-400" : ""}`}
      >
        ${value < 1 ? value.toFixed(6) : value.toFixed(2)}
      </p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}
