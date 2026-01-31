"use client";

import { SimulationResult } from "@/lib/finance/types";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

function pctAxis(v: number) {
  return `${(v * 100).toFixed(0)}%`;
}

export default function Charts({ result }: { result: SimulationResult | null }) {
  if (!result) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-sm text-neutral-600 shadow-sm">
        Run a stress test to see charts.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="mb-2 text-sm font-semibold">Equity Curve</div>
        <div className="h-72">
          <ResponsiveContainer>
            <LineChart data={result.equity}>
              <XAxis dataKey="date" hide />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="mb-2 text-sm font-semibold">Drawdown</div>
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart data={result.drawdown}>
              <XAxis dataKey="date" hide />
              <YAxis tickFormatter={pctAxis} />
              <Tooltip formatter={(v) => pctAxis(Number(v))} />
              <Line type="monotone" dataKey="value" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
