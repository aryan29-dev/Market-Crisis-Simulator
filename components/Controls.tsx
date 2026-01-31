"use client";

import { CRISES, DEFAULT_TICKERS, type CrisisKey } from "@/lib/crises";
import { Rebalance } from "@/lib/finance/types";
import { crisisBriefs } from "@/lib/finance/crisisBriefs";

type Props = {
  crisisName: CrisisKey;
  setCrisisName: (v: CrisisKey) => void;

  tickers: string;
  setTickers: (v: string) => void;

  weights: Record<string, number>;
  setWeights: (w: Record<string, number>) => void;

  rebalance: Rebalance;
  setRebalance: (r: Rebalance) => void;

  onRun: () => void;
  running: boolean;
};

export default function Controls(props: Props) {
  const tickersList = props.tickers
    .split(",")
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean);

  function setWeight(t: string, v: number) {
    props.setWeights({ ...props.weights, [t]: v });
  }

  function fillEqual() {
    const next: Record<string, number> = {};
    for (const t of tickersList) next[t] = 1;
    props.setWeights(next);
  }

  const brief = crisisBriefs[props.crisisName];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="space-y-3">
        {/* Crisis dropdown */}
        <div>
          <div className="text-sm font-semibold text-slate-900">Crisis window</div>

          <select
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:ring-4 focus:ring-blue-100"
            value={props.crisisName}
            onChange={(e) => props.setCrisisName(e.target.value as CrisisKey)}
          >
            {Object.keys(CRISES).map((k) => {
              const key = k as CrisisKey;
              return (
                <option key={key} value={key}>
                  {CRISES[key].label}
                </option>
              );
            })}
          </select>

          {/* Crisis Brief card */}
          {brief && (
            <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
              <div className="text-sm font-semibold text-blue-900">Crisis Brief</div>
              <div className="mt-0.5 text-xs font-semibold text-blue-700">{brief.title}</div>

              <p className="mt-2 text-sm leading-6 text-slate-800">{brief.summary}</p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs font-semibold text-slate-700">Main drivers</div>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-800">
                    {brief.drivers.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-700">Key dates</div>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-800">
                    {brief.keyDates.map((kd) => (
                      <li key={`${kd.date}-${kd.label}`}>
                        <span className="font-semibold">{kd.date}</span> — {kd.label}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-xs font-semibold text-slate-700">Typical winners / hedges</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {brief.whatWorked.map((w) => (
                    <span
                      key={w}
                      className="rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-blue-700"
                    >
                      {w}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <div className="text-xs font-semibold uppercase tracking-wide text-blue-800">
                  Related News & Videos
                </div>

                <ul className="mt-2 space-y-2">
                  {brief.news.map((n) => (
                    <li key={n.url}>
                      <a
                        href={n.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-lg border border-blue-100 bg-white p-3 text-sm shadow-sm hover:bg-blue-100/60"
                      >
                        <div className="font-semibold text-slate-900">{n.title}</div>
                        <div className="mt-0.5 text-xs text-slate-600">
                          {n.source} · {n.date}
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Tickers */}
        <div>
          <div className="text-sm font-semibold text-slate-900">Tickers</div>
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:ring-4 focus:ring-blue-100"
            value={props.tickers}
            onChange={(e) => props.setTickers(e.target.value)}
            placeholder={DEFAULT_TICKERS.join(",")}
          />
          <div className="mt-1 text-xs text-slate-500">Example: SPY, QQQ, TLT, GLD</div>
        </div>

        {/* Weights */}
        <div>
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-900">Weights</div>
            <button
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              onClick={fillEqual}
              type="button"
            >
              Equalize
            </button>
          </div>

          <div className="mt-2 space-y-2">
            {tickersList.map((t) => (
              <div key={t} className="flex items-center gap-2">
                <div className="w-14 text-sm font-semibold text-slate-900">{t}</div>
                <input
                  className="w-full accent-blue-600"
                  type="range"
                  min={0}
                  max={10}
                  step={0.5}
                  value={props.weights[t] ?? 1}
                  onChange={(e) => setWeight(t, Number(e.target.value))}
                />
                <div className="w-10 text-right text-sm tabular-nums text-slate-700">
                  {(props.weights[t] ?? 1).toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rebalance */}
        <div>
          <div className="text-sm font-semibold text-slate-900">Rebalance</div>
          <select
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:ring-4 focus:ring-blue-100"
            value={props.rebalance}
            onChange={(e) => props.setRebalance(e.target.value as Rebalance)}
          >
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
            <option value="daily">Daily</option>
          </select>
        </div>

        {/* Run button */}
        <button
          onClick={props.onRun}
          disabled={props.running}
          className="w-full rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
          type="button"
        >
          {props.running ? "Running..." : "Run stress test"}
        </button>
      </div>
    </div>
  );
}
