"use client";

import Link from "next/link";
import { api } from "@/lib/api";
import { useState } from "react";

export default function Home() {
  const [seedStatus, setSeedStatus] = useState<string | null>(null);

  async function handleSeed() {
    setSeedStatus("Seeding...");
    try {
      const result = await api.seedDemoData();
      setSeedStatus(result.message);
    } catch {
      setSeedStatus("Failed to seed data. Is the backend running?");
    }
  }

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4 pt-12">
        <h1 className="text-4xl font-bold tracking-tight">
          Multi-Agent System Economics
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Real-time cost visibility, cost forecasting, and runtime budget
          guardrails for multi-agent workflows.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <Link
          href="/simulator"
          className="group block p-6 rounded-lg border border-gray-800 bg-gray-900/50 hover:border-emerald-600 transition-colors"
        >
          <h2 className="text-lg font-semibold mb-2 group-hover:text-emerald-400 transition-colors">
            Cost Simulator
          </h2>
          <p className="text-sm text-gray-400">
            Estimate workflow costs before execution. Input agent counts, token
            usage, and model tiers to get instant cost breakdowns.
          </p>
        </Link>

        <Link
          href="/dashboard"
          className="group block p-6 rounded-lg border border-gray-800 bg-gray-900/50 hover:border-emerald-600 transition-colors"
        >
          <h2 className="text-lg font-semibold mb-2 group-hover:text-emerald-400 transition-colors">
            Cost Dashboard
          </h2>
          <p className="text-sm text-gray-400">
            Monitor live cost telemetry. Track spending by agent, workflow, and
            time with spike detection.
          </p>
        </Link>

        <Link
          href="/guardrails"
          className="group block p-6 rounded-lg border border-gray-800 bg-gray-900/50 hover:border-emerald-600 transition-colors"
        >
          <h2 className="text-lg font-semibold mb-2 group-hover:text-emerald-400 transition-colors">
            Budget Guardrails
          </h2>
          <p className="text-sm text-gray-400">
            Set budget policies and evaluate guardrails. Get PASS, WARN, or
            BLOCK signals with cost pressure indicators.
          </p>
        </Link>
      </div>

      <div className="text-center">
        <button
          onClick={handleSeed}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-sm font-medium transition-colors"
        >
          Seed Demo Data
        </button>
        {seedStatus && (
          <p className="mt-2 text-sm text-gray-400">{seedStatus}</p>
        )}
      </div>
    </div>
  );
}
