import { SimulationResult } from "@/lib/finance/types";

function pct(x: number) {
    return `${(x * 100).toFixed(2)}%`;
}

const METRIC_HELP: Record<string, string> = {
    "Total Return (%)":
        "Cumulative portfolio return over the selected crisis window.",
    "Maximum Drawdown (%)":
        "Largest peak-to-trough decline in portfolio value during the crisis.",
    "Time to Recovery (Days)":
        "Number of days required for the portfolio to recover its prior peak. If not reached, shown as 'Not recovered'.",
    "Annualized Volatility (%)":
        "Annualized standard deviation of daily portfolio returns, measuring risk.",
    "Sharpe Ratio (Risk-Free = 0%)":
        "Risk-adjusted return calculated as excess return divided by volatility, assuming a 0% risk-free rate.",
    "Annualized Return (%)":
        "Compounded annual growth rate (CAGR) of the portfolio over the crisis window.",
};

function InfoTooltip({ text }: { text: string }) {
    return (
        <span className="group relative ml-1 inline-flex items-center">
            <span className="cursor-help text-xs font-bold text-slate-400">ⓘ</span>

            <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 rounded-md border border-(--border) bg-white px-3 py-2 text-xs text-(--text) shadow-lg opacity-0 transition-opacity group-hover:opacity-100">
                {text}
            </span>
        </span>
    );
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
                        <div className="card-title flex items-center">
                            {c.label}
                            {METRIC_HELP[c.label] && (
                                <InfoTooltip text={METRIC_HELP[c.label]} />
                            )}
                        </div>
                    </div>

                    <div className="shrink-0 rounded-full border border-(--border) bg-white/70 px-3 py-1 text-sm font-extrabold text-(--text)">
                        {c.value}
                    </div>
                </div>
            ))}
        </div>
    );
}
