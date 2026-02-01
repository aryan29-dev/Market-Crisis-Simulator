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

function titleCase(s: string) {
    return s
        .split(" ")
        .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
        .join(" ");
}

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
        <div className="card p-5">
            <div className="space-y-4">
                <div>
                    <div className="text-sm font-semibold text-(--text)">Crisis Window</div>
                    <select
                        className="mt-1 w-full rounded-xl border border-(--border) bg-white px-3 py-2 text-(--text) outline-none focus:ring-4 focus:ring-(--ring)"
                        value={props.crisisName}
                        onChange={(e) => {
                            const v = e.target.value;
                            if (v in CRISES) props.setCrisisName(v as CrisisKey);
                        }}
                    >
                        {Object.entries(CRISES).map(([key, meta]) => (
                            <option key={key} value={key}>
                                {meta.label}
                            </option>
                        ))}
                    </select>

                    {brief && (
                        <div className="mt-3 rounded-2xl border border-(--border) bg-white p-4 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="text-sm font-extrabold text-(--text)">Crisis Brief</div>
                                    <div className="mt-1 text-xs font-semibold text-(--muted)">
                                        {titleCase(brief.title)}
                                    </div>
                                </div>

                                <div className="shrink-0 rounded-full border border-(--border) bg-white/70 px-3 py-1 text-xs font-semibold text-(--muted)">
                                    {CRISES[props.crisisName].start} → {CRISES[props.crisisName].end}
                                </div>
                            </div>

                            <p className="mt-3 text-sm leading-6 text-(--text)">{brief.summary}</p>

                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                <div>
                                    <div className="text-xs font-semibold text-(--muted)">Main Drivers</div>
                                    <ul className="mt-2 space-y-2">
                                        {brief.drivers.map((d) => (
                                            <li key={d} className="flex items-start gap-2">
                                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-(--accent)" />
                                                <span className="text-sm text-(--text)">{titleCase(d)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <div className="text-xs font-semibold text-(--muted)">Key Dates</div>
                                    <ul className="mt-2 space-y-2">
                                        {brief.keyDates.map((kd) => (
                                            <li key={`${kd.date}-${kd.label}`} className="flex items-start gap-2">
                                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-(--primary)" />
                                                <span className="text-sm text-(--text)">
                                                    <span className="font-semibold">{kd.date}</span>{" "}
                                                    <span className="text-(--muted)">—</span> {titleCase(kd.label)}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-4">
                                <div className="text-xs font-semibold text-(--muted)">Typical Winners / Hedges</div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {brief.whatWorked.map((w) => (
                                        <span
                                            key={w}
                                            className="rounded-full border border-(--border) bg-white px-3 py-1 text-xs font-semibold text-(--primary) shadow-sm"
                                        >
                                            {titleCase(w)}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-5">
                                <div className="text-xs font-semibold uppercase tracking-wide text-(--muted)">
                                    Related News & Videos
                                </div>

                                <ul className="mt-2 space-y-2">
                                    {brief.news.map((n) => (
                                        <li key={n.url}>
                                            <a
                                                href={n.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block rounded-2xl border border-(--border) bg-white p-3 shadow-sm transition hover:-translate-y-px hover:bg-white/70"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <div className="font-semibold text-(--text)">{titleCase(n.title)}</div>
                                                        <div className="mt-1 text-xs text-(--muted)">
                                                            {n.source} · {n.date}
                                                        </div>
                                                    </div>

                                                    <span className="shrink-0 rounded-full border border-(--border) bg-white/70 px-2.5 py-1 text-[11px] font-semibold text-(--muted)">
                                                        Open
                                                    </span>
                                                </div>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    <div className="text-sm font-semibold text-(--text)">Tickers</div>
                    <input
                        className="mt-1 w-full rounded-xl border border-(--border) bg-white px-3 py-2 text-(--text) outline-none focus:ring-4 focus:ring-(--ring)"
                        value={props.tickers}
                        onChange={(e) => props.setTickers(e.target.value)}
                        placeholder={DEFAULT_TICKERS.join(", ")}
                    />

                    <div className="mt-2 flex flex-wrap gap-2">
                        {tickersList.slice(0, 8).map((t) => (
                            <span
                                key={t}
                                className="rounded-full border border-(--border) bg-white px-3 py-1 text-xs font-semibold text-(--muted)"
                            >
                                {t}
                            </span>
                        ))}
                        {tickersList.length > 8 && (
                            <span className="rounded-full border border-(--border) bg-white px-3 py-1 text-xs font-semibold text-(--muted)">
                                +{tickersList.length - 8} More
                            </span>
                        )}
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-(--text)">Weights</div>
                        <button
                            className="rounded-full border border-(--border) bg-white px-3 py-1 text-xs font-semibold text-(--muted) hover:bg-white/70"
                            onClick={fillEqual}
                            type="button"
                        >
                            Equalize
                        </button>
                    </div>

                    <div className="mt-2 space-y-2">
                        {tickersList.map((t) => (
                            <div key={t} className="rounded-2xl border border-(--border) bg-white p-3">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="rounded-full border border-(--border) bg-white px-3 py-1 text-xs font-extrabold text-(--text)">
                                        {t}
                                    </span>
                                    <span className="rounded-full border border-(--border) bg-white px-3 py-1 text-xs font-semibold text-(--muted)">
                                        {(props.weights[t] ?? 1).toFixed(1)}
                                    </span>
                                </div>

                                <input
                                    className="w-full accent-(--primary)"
                                    type="range"
                                    min={0}
                                    max={10}
                                    step={0.5}
                                    value={props.weights[t] ?? 1}
                                    onChange={(e) => setWeight(t, Number(e.target.value))}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="text-sm font-semibold text-(--text)">Rebalance Frequency</div>
                    <select
                        className="mt-1 w-full rounded-xl border border-(--border) bg-white px-3 py-2 text-(--text) outline-none focus:ring-4 focus:ring-(--ring)"
                        value={props.rebalance}
                        onChange={(e) => props.setRebalance(e.target.value as Rebalance)}
                    >
                        <option value="monthly">Monthly</option>
                        <option value="weekly">Weekly</option>
                        <option value="daily">Daily</option>
                    </select>

                    <div className="mt-2 flex gap-2">
                        {(["monthly", "weekly", "daily"] as const).map((r) => {
                            const active = props.rebalance === r;
                            return (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => props.setRebalance(r)}
                                    className={[
                                        "rounded-full border px-3 py-1 text-xs font-semibold transition",
                                        active
                                            ? "border-(--primary) bg-white text-(--primary)"
                                            : "border-(--border) bg-white text-(--muted) hover:bg-white/70",
                                    ].join(" ")}
                                >
                                    {titleCase(r)}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <button
                    onClick={props.onRun}
                    disabled={props.running}
                    className="btn-primary w-full disabled:opacity-50"
                    type="button"
                >
                    {props.running ? "Running..." : "Run Stress Test"}
                </button>
            </div>
        </div>
    );
}
