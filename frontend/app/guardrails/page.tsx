"use client";

import { useState, useEffect } from "react";
import {
  api,
  type Policy,
  type PolicyCreate,
  type GuardrailResult,
} from "@/lib/api";
import { StatusBadge } from "@/components/status-badge";

const CUSTOMER_ID = "demo-customer";

export default function GuardrailsPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [evalResult, setEvalResult] = useState<GuardrailResult | null>(null);

  const [policyForm, setPolicyForm] = useState<PolicyCreate>({
    customer_id: CUSTOMER_ID,
    daily_budget_limit: 50,
    workflow_budget_limit: 5,
    step_limit_per_agent: 10,
  });

  const [evalForm, setEvalForm] = useState({
    execution_cost: 1.5,
    step_count: 5,
    agent_id: "planner-agent",
    workflow_id: "00000000-0000-0000-0000-000000000000",
  });

  useEffect(() => {
    loadPolicies();
  }, []);

  async function loadPolicies() {
    setLoading(true);
    try {
      const data = await api.getPolicies(CUSTOMER_ID);
      setPolicies(data);
    } catch {
      // Backend may not be running
    } finally {
      setLoading(false);
    }
  }

  async function handleCreatePolicy() {
    try {
      await api.createPolicy(policyForm);
      await loadPolicies();
    } catch {
      // Handle error
    }
  }

  async function handleEvaluate() {
    try {
      const result = await api.evaluateGuardrail({
        customer_id: CUSTOMER_ID,
        workflow_id: evalForm.workflow_id,
        execution_cost: evalForm.execution_cost,
        step_count: evalForm.step_count,
        agent_id: evalForm.agent_id,
      });
      setEvalResult(result);
    } catch {
      // Handle error
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Budget Guardrails</h1>
        <p className="text-gray-400 mt-1">
          Configure budget policies and evaluate guardrail signals.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Policy Form */}
        <div className="space-y-6 p-6 rounded-lg border border-gray-800 bg-gray-900/50">
          <h2 className="text-lg font-semibold">Create Policy</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Daily Budget Limit ($)
              </label>
              <input
                type="number"
                min={0}
                step={1}
                value={policyForm.daily_budget_limit}
                onChange={(e) =>
                  setPolicyForm((p) => ({
                    ...p,
                    daily_budget_limit: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Workflow Budget Limit ($)
              </label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={policyForm.workflow_budget_limit}
                onChange={(e) =>
                  setPolicyForm((p) => ({
                    ...p,
                    workflow_budget_limit: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Max Steps per Agent
              </label>
              <input
                type="number"
                min={1}
                value={policyForm.step_limit_per_agent}
                onChange={(e) =>
                  setPolicyForm((p) => ({
                    ...p,
                    step_limit_per_agent: parseInt(e.target.value) || 1,
                  }))
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <button
              onClick={handleCreatePolicy}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-md text-sm font-medium transition-colors"
            >
              Save Policy
            </button>
          </div>

          {/* Existing Policies */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-400">
              Active Policies
            </h3>
            {loading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : policies.length === 0 ? (
              <p className="text-sm text-gray-500">No policies configured.</p>
            ) : (
              policies.map((p) => (
                <div
                  key={p.policy_id}
                  className="p-3 rounded-md bg-gray-800/50 text-sm space-y-1"
                >
                  <div className="flex justify-between">
                    <span className="text-gray-400">Daily limit</span>
                    <span>${p.daily_budget_limit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Workflow limit</span>
                    <span>${p.workflow_budget_limit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Max steps/agent</span>
                    <span>{p.step_limit_per_agent}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Guardrail Evaluation */}
        <div className="space-y-6 p-6 rounded-lg border border-gray-800 bg-gray-900/50">
          <h2 className="text-lg font-semibold">Evaluate Guardrail</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Execution Cost ($)
              </label>
              <input
                type="number"
                min={0}
                step={0.1}
                value={evalForm.execution_cost}
                onChange={(e) =>
                  setEvalForm((f) => ({
                    ...f,
                    execution_cost: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Step Count
              </label>
              <input
                type="number"
                min={1}
                value={evalForm.step_count}
                onChange={(e) =>
                  setEvalForm((f) => ({
                    ...f,
                    step_count: parseInt(e.target.value) || 1,
                  }))
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Agent ID
              </label>
              <input
                type="text"
                value={evalForm.agent_id}
                onChange={(e) =>
                  setEvalForm((f) => ({ ...f, agent_id: e.target.value }))
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <button
              onClick={handleEvaluate}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-md text-sm font-medium transition-colors"
            >
              Evaluate
            </button>
          </div>

          {/* Evaluation Result */}
          {evalResult && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-gray-400">Guardrail Status</p>
                  <div className="mt-1">
                    <StatusBadge status={evalResult.status} />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Cost Pressure</p>
                  <div className="mt-1">
                    <StatusBadge status={evalResult.cost_pressure} />
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-300">{evalResult.reason}</p>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-md bg-gray-800/50">
                  <p className="text-xs text-gray-400">Daily Spend</p>
                  <p className="font-medium">${evalResult.daily_spend.toFixed(4)}</p>
                </div>
                <div className="p-3 rounded-md bg-gray-800/50">
                  <p className="text-xs text-gray-400">Daily Limit</p>
                  <p className="font-medium">
                    ${evalResult.daily_budget_limit.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 rounded-md bg-gray-800/50">
                  <p className="text-xs text-gray-400">Workflow Limit</p>
                  <p className="font-medium">
                    ${evalResult.workflow_budget_limit.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 rounded-md bg-gray-800/50">
                  <p className="text-xs text-gray-400">Spend Velocity</p>
                  <p className="font-medium">
                    ${evalResult.spend_velocity.toFixed(4)}/hr
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
