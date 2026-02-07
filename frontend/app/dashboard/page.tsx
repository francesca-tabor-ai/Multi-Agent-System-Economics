"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { api, type CostSummary } from "@/lib/api";

export default function DashboardPage() {
  const [summary, setSummary] = useState<CostSummary | null>(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [days]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCostSummary(days);
      setSummary(data);
    } catch {
      setError("Failed to load dashboard data. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  const agentChartData = summary
    ? Object.entries(summary.cost_by_agent)
        .map(([agent, cost]) => ({ agent, cost: parseFloat(cost.toFixed(4)) }))
        .sort((a, b) => b.cost - a.cost)
    : [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cost Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Live cost telemetry from workflow executions.
          </p>
        </div>
        <div className="flex gap-2">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                days === d
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-500">
          Loading...
        </div>
      ) : summary ? (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard label="Total Cost" value={`$${summary.total_cost.toFixed(2)}`} />
            <MetricCard
              label="Total Executions"
              value={summary.total_executions.toLocaleString()}
            />
            <MetricCard
              label="Avg Cost / Execution"
              value={`$${summary.avg_cost_per_execution.toFixed(4)}`}
            />
            <MetricCard
              label="Total Tokens"
              value={summary.total_tokens.toLocaleString()}
            />
          </div>

          {summary.spike_detected && (
            <div className="p-4 rounded-lg bg-amber-900/30 border border-amber-800 text-amber-400 text-sm">
              Cost spike detected — one or more days exceeded 2x the average
              daily spend.
            </div>
          )}

          {/* Cost Trend Chart */}
          <div className="p-6 rounded-lg border border-gray-800 bg-gray-900/50">
            <h2 className="text-lg font-semibold mb-4">Cost Trend</h2>
            {summary.cost_trend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={summary.cost_trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="date"
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={(v) => v.slice(5)}
                  />
                  <YAxis
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111827",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => [`$${Number(value).toFixed(4)}`, "Cost"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="cost"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: "#10b981", r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-sm text-center py-12">
                No cost data available for the selected period.
              </p>
            )}
          </div>

          {/* Agent Cost Distribution */}
          <div className="p-6 rounded-lg border border-gray-800 bg-gray-900/50">
            <h2 className="text-lg font-semibold mb-4">
              Cost by Agent
            </h2>
            {agentChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={agentChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    type="number"
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <YAxis
                    dataKey="agent"
                    type="category"
                    stroke="#6b7280"
                    fontSize={12}
                    width={140}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111827",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => [`$${Number(value).toFixed(4)}`, "Cost"]}
                  />
                  <Bar dataKey="cost" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-sm text-center py-12">
                No agent data available.
              </p>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-lg border border-gray-800 bg-gray-900/50">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  );
}
