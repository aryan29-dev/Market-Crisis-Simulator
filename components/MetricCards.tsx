import { SimulationResult } from "@/lib/finance/types";

function pct(x: number) {
  return `${(x * 100).toFixed(2)}%`;
}

export default function MetricCards({ result }: { result: SimulationResult | null }) {
  const m = result?.metrics;
  const cards = [
    { label: "Total Return", value: m ? pct(m.totalReturn) : "—" },
    { label: "Max Drawdown", value: m ? pct(m.maxDrawdown) : "—" },
    {
      label: "Time to Recovery",
      value: m ? (m.timeToRecoveryDays === null ? "Not recovered" : `${m.timeToRecoveryDays} days`) : "—",
    },
    { label: "Ann. Vol", value: m ? pct(m.annVol) : "—" },
    { label: "Sharpe (rf=0%)", value: m ? m.sharpe.toFixed(2) : "—" },
    { label: "Ann. Return", value: m ? pct(m.annReturn) : "—" },
  ];

  return (
    <div className="card">
      {cards.map((c) => (
        <div key={c.label} className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold text-neutral-500">{c.label}</div>
          <div className="mt-1 text-xl font-black">{c.value}</div>
        </div>
      ))}
    </div>
  );
}
