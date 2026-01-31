import { SimulationResult } from "@/lib/finance/types";

function pct(x: number) {
    return `${(x * 100).toFixed(2)}%`;
}

type Card = { label: string; value: string };

export default function MetricCards({ result }: { result: SimulationResult | null }) {
    const m = result?.metrics;

    const cards: Card[] = [
        { label: "Total Return (%)", value: m ? pct(m.totalReturn) : "—" },
        { label: "Maximum Drawdown (%)", value: m ? pct(m.maxDrawdown) : "—" },
        {
            label: "Time to Recovery (Days)",
            value: m
                ? m.timeToRecoveryDays === null
                    ? "Not recovered"
                    : `${m.timeToRecoveryDays} days`
                : "—",
        },
        { label: "Annualized Volatility (%)", value: m ? pct(m.annVol) : "—" },
        { label: "Sharpe Ratio (Risk-Free = 0%)", value: m ? m.sharpe.toFixed(2) : "—" },
        { label: "Annualized Return (%)", value: m ? pct(m.annReturn) : "—" },
    ];

    return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => (
                <div
                    key={c.label}
                    className="card flex items-center justify-between gap-3 px-4 py-3"
                >
                    <div className="min-w-0">
                        <div className="card-title">{c.label}</div>
                    </div>

                    <div className="shrink-0 rounded-full border border-(--border) bg-white/70 px-3 py-1 text-sm font-extrabold text-(--text)">
                        {c.value}
                    </div>
                </div>
            ))}
        </div>
    );
}
