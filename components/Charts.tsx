"use client";

import { useEffect, useMemo, useState } from "react";
import { SimulationResult } from "@/lib/finance/types";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ReferenceArea,
  ReferenceDot,
} from "recharts";

type Point = { date: string; value: number };

function pct(v: number) {
  return `${(v * 100).toFixed(2)}%`;
}

function money(v: number) {
  return Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function fmtMonthYear(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  const m = d.toLocaleString(undefined, { month: "short" });
  const yy = String(d.getUTCFullYear()).slice(-2);
  return `${m} '${yy}`;
}

export default function Charts({ result }: { result: SimulationResult | null }) {
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const update = () => setIsNarrow(window.innerWidth < 640);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const kick = () => window.dispatchEvent(new Event("resize"));
    kick();
    const t = setTimeout(kick, 120);
    return () => clearTimeout(t);
  }, [result]);

  const equity = (result?.equity ?? []) as Point[];
  const drawdown = (result?.drawdown ?? []) as Point[];

  const yMinEq = equity.length ? Math.min(...equity.map((p) => p.value)) : 0;
  const yMaxEq = equity.length ? Math.max(...equity.map((p) => p.value)) : 1;
  const yMinDd = drawdown.length ? Math.min(...drawdown.map((p) => p.value)) : 0;

  const insight = useMemo(() => {
    if (!equity.length || !drawdown.length) return null;

    let troughIdx = 0;
    for (let i = 1; i < drawdown.length; i++) {
      if (drawdown[i].value < drawdown[troughIdx].value) troughIdx = i;
    }

    const trough = equity[Math.min(troughIdx, equity.length - 1)];

    let peakIdx = 0;
    for (let i = 1; i <= troughIdx && i < equity.length; i++) {
      if (equity[i].value > equity[peakIdx].value) peakIdx = i;
    }
    const peak = equity[peakIdx];

    let recoveryIdx: number | null = null;
    for (let i = troughIdx + 1; i < equity.length; i++) {
      if (equity[i].value >= peak.value) {
        recoveryIdx = i;
        break;
      }
    }
    const recovery = recoveryIdx !== null ? equity[recoveryIdx] : null;

    const shadeEnd = recovery ? recovery.date : equity[equity.length - 1].date;

    return {
      peak,
      trough,
      recovery,
      shade: { x1: peak.date, x2: shadeEnd },
      worstDrawdown: drawdown[troughIdx],
    };
  }, [equity, drawdown]);

  if (!result) {
    return (
      <div className="card p-6 text-sm text-neutral-600">
        Run a stress test to see the charts!
      </div>
    );
  }

  if (!equity.length || !drawdown.length) {
    return (
      <div className="card p-6 text-sm text-neutral-600">
        No chart data available for this selection.
      </div>
    );
  }

  const equityMargin = isNarrow
    ? { top: 12, right: 12, left: 22, bottom: 18 }
    : { top: 16, right: 18, left: 88, bottom: 28 };

  const ddMargin = isNarrow
    ? { top: 22, right: 12, left: 28, bottom: 18 }
    : { top: 40, right: 18, left: 120, bottom: 28 };

  const yAxisWidthEq = isNarrow ? 44 : 78;
  const yAxisWidthDd = isNarrow ? 48 : 95;

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <div className="text-base font-extrabold text-(--text)">Equity Curve</div>
            <div className="mt-1 text-sm text-(--muted)">
              Portfolio value over time during the selected crisis window (normalized to 100 at start). Markers show the peak,
              trough, and recovery (if it happens).
            </div>
          </div>

          <div className="hidden sm:block shrink-0 whitespace-nowrap rounded-full border border-(--border) bg-white/70 px-3 py-1 text-xs font-semibold text-(--muted)">
            {insight ? (
              <>
                Peak: {money(insight.peak.value)} • Trough: {money(insight.trough.value)} •{" "}
                {insight.recovery
                  ? `Recovered: ${fmtMonthYear(insight.recovery.date)}`
                  : "Not recovered"}
              </>
            ) : (
              <>
                Range: {money(yMinEq)} → {money(yMaxEq)}
              </>
            )}
          </div>
        </div>

        <div className="mt-4 w-full overflow-hidden rounded-2xl bg-white/30">
          <div className="relative w-full aspect-4/3 sm:aspect-video">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={equity} margin={equityMargin}>
                <CartesianGrid strokeDasharray="3 3" />

                {insight && (
                  <ReferenceArea
                    x1={insight.shade.x1}
                    x2={insight.shade.x2}
                    fillOpacity={0.12}
                  />
                )}

                <XAxis
                  dataKey="date"
                  tickFormatter={fmtMonthYear}
                  minTickGap={isNarrow ? 18 : 26}
                  tick={{ fontSize: 12 }}
                  label={
                    isNarrow
                      ? undefined
                      : { value: "Date", position: "insideBottom", offset: -12 }
                  }
                />

                <YAxis
                  width={yAxisWidthEq}
                  domain={[yMinEq * 0.98, yMaxEq * 1.02]}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => money(Number(v))}
                  label={
                    isNarrow
                      ? undefined
                      : {
                        value: "Portfolio Value",
                        angle: -90,
                        position: "insideLeft",
                        offset: 10,
                      }
                  }
                />

                <Tooltip
                  labelFormatter={(lab) => `Date: ${lab}`}
                  formatter={(v) => [money(Number(v)), "Value"]}
                />

                {insight && (
                  <>
                    <ReferenceDot
                      x={insight.peak.date}
                      y={insight.peak.value}
                      r={4}
                      label={{
                        value: "Peak",
                        position: "insideTop",
                        fontSize: 11,
                        dx: -24,
                        dy: -6,
                        fill: "#475569",
                      }}
                    />
                    <ReferenceDot
                      x={insight.trough.date}
                      y={insight.trough.value}
                      r={4}
                      label={{
                        value: "Trough",
                        position: "insideBottom",
                        fontSize: 11,
                        dx: -26,
                        dy: 6,
                        fill: "#475569",
                      }}
                    />
                    {insight.recovery && (
                      <ReferenceDot
                        x={insight.recovery.date}
                        y={insight.recovery.value}
                        r={4}
                        label={{
                          value: "Recovered",
                          position: "insideTop",
                          fontSize: 11,
                          dx: -32,
                          dy: -6,
                          fill: "#475569",
                        }}
                      />
                    )}
                  </>
                )}

                <Line type="monotone" dataKey="value" dot={false} strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <div className="text-base font-extrabold text-(--text)">Drawdown</div>
            <div className="mt-1 text-sm text-(--muted)">
              Percent drop from the portfolio’s previous peak (0% means “at a new high”).
            </div>
          </div>

          <div className="hidden sm:block shrink-0 whitespace-nowrap rounded-full border border-(--border) bg-white/70 px-3 py-1 text-xs font-semibold text-(--muted)">
            {insight ? (
              <>
                Worst: {pct(insight.worstDrawdown.value)} (on {fmtMonthYear(insight.worstDrawdown.date)})
              </>
            ) : (
              <>Worst: {pct(yMinDd)}</>
            )}
          </div>
        </div>

        <div className="mt-4 w-full overflow-hidden rounded-2xl bg-white/30">
          <div className="relative w-full aspect-4/3 sm:aspect-video">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={drawdown} margin={ddMargin}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="date"
                  tickFormatter={fmtMonthYear}
                  minTickGap={isNarrow ? 18 : 26}
                  tick={{ fontSize: 12 }}
                  label={
                    isNarrow
                      ? undefined
                      : { value: "Date", position: "insideBottom", offset: -12 }
                  }
                />

                <YAxis
                  width={yAxisWidthDd}
                  domain={[yMinDd, 0]}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => `${(Number(v) * 100).toFixed(0)}%`}
                  label={
                    isNarrow
                      ? undefined
                      : {
                        value: "Drawdown (% from peak)",
                        angle: -90,
                        position: "insideLeft",
                        dy: 40,
                      }
                  }
                />

                <ReferenceLine y={0} strokeDasharray="4 4" />

                <Tooltip
                  labelFormatter={(lab) => `Date: ${lab}`}
                  formatter={(v) => [`${(Number(v) * 100).toFixed(2)}%`, "Drawdown"]}
                />

                {insight && (
                  <ReferenceDot
                    x={insight.worstDrawdown.date}
                    y={insight.worstDrawdown.value}
                    r={4}
                    label={{
                      value: "Max DD",
                      position: "insideBottom",
                      fontSize: 11,
                      dx: -26,
                      dy: 4,
                      fill: "#475569",
                    }}
                  />
                )}
                <Line type="monotone" dataKey="value" dot={false} strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
