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
} from "recharts";

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

  if (!result) {
    return (
      <div className="card p-6 text-sm text-neutral-600">
        Run A Stress Test To See The Charts!
      </div>
    );
  }

  const equity = result.equity;
  const drawdown = result.drawdown;

  const yMinEq = Math.min(...equity.map((p) => p.value));
  const yMaxEq = Math.max(...equity.map((p) => p.value));
  const yMinDd = Math.min(...drawdown.map((p) => p.value));

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
              An equity curve is your portfolio value over time, showing how it grew or fell during the crisis window.
            </div>
          </div>

          <div className="hidden sm:block rounded-full border border-(--border) bg-white/70 px-3 py-1 text-xs font-semibold text-(--muted)">
            Range: {money(yMinEq)} → {money(yMaxEq)}
          </div>
        </div>

        <div className="mt-4 w-full overflow-hidden rounded-2xl bg-white/30">
          <div className="relative w-full aspect-4/3 sm:aspect-video">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={equity} margin={equityMargin}>
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
                  width={yAxisWidthEq}
                  domain={[yMinEq * 0.98, yMaxEq * 1.02]}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => money(Number(v))}
                  label={
                    isNarrow
                      ? undefined
                      : {
                        value: "Portfolio value",
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
              Drawdown measures how far the portfolio dropped from its previous peak (0% means “at a new high”).
            </div>
          </div>

          <div className="hidden sm:block rounded-full border border-(--border) bg-white/70 px-3 py-1 text-xs font-semibold text-(--muted)">
            Worst: {pct(yMinDd)}
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
                <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 4" />
                <Tooltip
                  labelFormatter={(lab) => `Date: ${lab}`}
                  formatter={(v) => [`${(Number(v) * 100).toFixed(2)}%`, "Drawdown"]}
                />
                <Line type="monotone" dataKey="value" dot={false} strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
