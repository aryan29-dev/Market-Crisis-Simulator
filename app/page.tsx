"use client";

import { useMemo, useState } from "react";
import Controls from "@/components/Controls";
import MetricCards from "@/components/MetricCards";
import Charts from "@/components/Charts";
import { CRISES, DEFAULT_TICKERS } from "@/lib/crises";
import { simulate } from "@/lib/finance/simulate";
import { PricesByTicker, Rebalance, SimulationResult } from "@/lib/finance/types";

export default function Page() {
  const crisisNames = Object.keys(CRISES);
  const [crisisName, setCrisisName] = useState<string>(crisisNames[0]);
  const [tickers, setTickers] = useState<string>(DEFAULT_TICKERS.join(", "));
  const [weights, setWeights] = useState<Record<string, number>>(() => {
    const w: Record<string, number> = {};
    for (const t of DEFAULT_TICKERS) w[t] = 1;
    return w;
  });
  const [rebalance, setRebalance] = useState<Rebalance>("monthly");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const tickersList = useMemo(
    () => tickers.split(",").map((t) => t.trim().toUpperCase()).filter(Boolean),
    [tickers]
  );

  async function run() {
    setRunning(true);
    setResult(null);

    try {
      const { start, end } = (CRISES as any)[crisisName];

      const res = await fetch("/api/prices", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tickers: tickersList, start, end }),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }

      if (!res.ok) {
        throw new Error(data?.error ?? `API failed (${res.status})`);
      }

      const prices: PricesByTicker = data.prices;
      const sim = simulate(prices, weights, rebalance, 100);
      setResult(sim);
    } catch (e: any) {
      alert(e?.message ?? "Something went wrong");
    } finally {
      setRunning(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6">
          <div className="text-3xl font-black tracking-tight">Market Stress Simulator</div>
          <div className="mt-1 text-sm text-neutral-600">
            Replay crisis windows, measure drawdowns, and evaluate recovery.
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
          <Controls
            setCrisisName={setCrisisName}
            tickers={tickers}
            setTickers={setTickers}
            weights={weights}
            setWeights={setWeights}
            rebalance={rebalance}
            setRebalance={setRebalance}
            onRun={run}
            running={running} crisisName={"2008 GFC (2007-10 to 2009-03)"}          />

          <div className="space-y-4">
            <MetricCards result={result} />
            <Charts result={result} />

            <div className="rounded-2xl border bg-white p-4 text-sm shadow-sm">
              <div className="font-semibold">Normalized weights (auto in simulator)</div>
              <pre className="mt-2 overflow-auto rounded-xl bg-neutral-50 p-3 text-xs">
                {JSON.stringify(result?.weights ?? {}, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
