"use client";

import { useMemo, useState } from "react";
import Controls from "@/components/Controls";
import MetricCards from "@/components/MetricCards";
import Charts from "@/components/Charts";
import { CRISES, DEFAULT_TICKERS, type CrisisKey } from "@/lib/crises";
import { simulate } from "@/lib/finance/simulate";
import { PricesByTicker, Rebalance, SimulationResult } from "@/lib/finance/types";

export default function Page() {
  const crisisNames = Object.keys(CRISES) as CrisisKey[];

  const [crisisName, setCrisisName] = useState<CrisisKey>(crisisNames[0]);
  const [tickers, setTickers] = useState<string>(DEFAULT_TICKERS.join(", "));
  const [weights, setWeights] = useState<Record<string, number>>(() => {
    const w: Record<string, number> = {};
    for (const t of DEFAULT_TICKERS) w[t] = 1;
    return w;
  });
  const [rebalance, setRebalance] = useState<Rebalance>("monthly");

  const [recoveryMonths, setRecoveryMonths] = useState<number>(24);

  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const tickersList = useMemo(
    () => tickers.split(",").map((t) => t.trim().toUpperCase()).filter(Boolean),
    [tickers]
  );

  function addMonthsISO(iso: string, months: number) {
    const d = new Date(`${iso}T00:00:00Z`);
    d.setUTCMonth(d.getUTCMonth() + months);
    return d.toISOString().slice(0, 10);
  }

  function clearResults() {
    setResult(null);
  }

  async function run() {
    setRunning(true);
    setResult(null);

    try {
      const { start, end } = CRISES[crisisName];

      const fetchEnd = addMonthsISO(end, recoveryMonths);

      const res = await fetch("/api/prices", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tickers: tickersList, start, end: fetchEnd }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data?.error ?? `API failed (${res.status})`);

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
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-3xl font-black tracking-tight text-(--text)">
                Market Stress & Crisis Simulator
              </div>
              <div className="mt-1 text-sm text-(--muted)">
                Replay crisis windows, measure drawdowns, and evaluate how a portfolio recovers after shocks.
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-(--border) bg-white/70 px-3 py-1 text-xs font-semibold text-(--muted)">
                Selected: {CRISES[crisisName].label}
              </span>

              <span
                className={[
                  "rounded-full border px-3 py-1 text-xs font-semibold",
                  result
                    ? "border-(--primary) bg-white text-(--primary)"
                    : "border-(--border) bg-white/70 text-(--muted)",
                ].join(" ")}
              >
                {result ? "Results Ready" : "No Results Yet"}
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="text-xs font-semibold text-(--muted)">Recovery Window:</div>

            {[12, 18, 24, 36].map((m) => {
              const active = recoveryMonths === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    if (m === recoveryMonths) return;
                    setRecoveryMonths(m);
                    clearResults();
                  }}
                  className={[
                    "rounded-full border px-3 py-1 text-xs font-semibold transition",
                    active
                      ? "border-(--primary) bg-white text-(--primary)"
                      : "border-(--border) bg-white/70 text-(--muted) hover:bg-white",
                  ].join(" ")}
                >
                  {m} months
                </button>
              );
            })}

            <span className="ml-1 text-xs text-(--muted)">
              (Used for recovery metrics, not the displayed crisis dates.)
            </span>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
          <Controls
            crisisName={crisisName}
            setCrisisName={(v) => {
              if (v === crisisName) return;
              setCrisisName(v);
              clearResults();
            }}
            tickers={tickers}
            setTickers={(v) => {
              if (v === tickers) return;
              setTickers(v);
              clearResults();
            }}
            weights={weights}
            setWeights={(w) => {
              setWeights(w);
              clearResults();
            }}
            rebalance={rebalance}
            setRebalance={(r) => {
              if (r === rebalance) return;
              setRebalance(r);
              clearResults();
            }}
            onRun={run}
            running={running}
          />

          <div className="space-y-4">
            <MetricCards result={result} />
            <Charts result={result} />

            <div className="card p-4 text-sm">
              <div className="font-semibold text-(--text)">Normalized Weights (Auto In Simulator)</div>
              <pre className="mt-2 overflow-auto rounded-xl bg-white/70 p-3 text-xs">
                {JSON.stringify(result?.weights ?? {}, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
