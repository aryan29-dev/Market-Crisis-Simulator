import { PricesByTicker, Rebalance, SimulationResult } from "./types";
import { pctChange } from "./returns";
import {
  annualizedReturn,
  annualizedVol,
  computeDrawdown,
  maxDrawdown,
  sharpe,
  timeToRecoveryDays,
} from "./metrics";

function normalizeWeights(raw: Record<string, number>): Record<string, number> {
  const cleaned: Record<string, number> = {};
  let total = 0;
  for (const [k, v] of Object.entries(raw)) {
    const num = Number(v);
    if (num > 0) {
      cleaned[k] = num;
      total += num;
    }
  }
  if (total <= 0) return {};
  for (const k of Object.keys(cleaned)) cleaned[k] = cleaned[k] / total;
  return cleaned;
}

function getISOWeek(d: Date): number {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function pickRebalanceDates(dates: Date[], mode: Rebalance): Set<string> {
  const key = (d: Date) => d.toISOString().slice(0, 10);
  const set = new Set<string>();

  if (mode === "daily") {
    for (const d of dates) set.add(key(d));
    return set;
  }

  let last: string | null = null;
  for (const d of dates) {
    const k =
      mode === "weekly"
        ? `${d.getUTCFullYear()}-W${getISOWeek(d)}`
        : `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;

    if (k !== last) {
      set.add(key(d));
      last = k;
    }
  }
  return set;
}

export function simulate(
  pricesByTicker: PricesByTicker,
  rawWeights: Record<string, number>,
  rebalance: Rebalance,
  initialValue = 100
): SimulationResult {
  const weights = normalizeWeights(rawWeights);
  const tickers = Object.keys(weights);
  if (tickers.length === 0) throw new Error("Set at least one weight > 0");

  // Align by intersection of dates
  const dateToPrices: Record<string, Record<string, number>> = {};
  for (const t of tickers) {
    for (const row of pricesByTicker[t] ?? []) {
      if (!dateToPrices[row.date]) dateToPrices[row.date] = {};
      dateToPrices[row.date][t] = row.close;
    }
  }

  const allDates = Object.keys(dateToPrices)
    .sort()
    .filter((dt) => tickers.every((t) => typeof dateToPrices[dt][t] === "number"));

  if (allDates.length < 2) throw new Error("Not enough aligned price points across tickers.");

  const dates = allDates.map((s) => new Date(s + "T00:00:00Z"));
  const rebDates = pickRebalanceDates(dates, rebalance);

  // init shares on first date
  const firstDate = allDates[0];
  const shares: Record<string, number> = {};
  for (const t of tickers) {
    shares[t] = (initialValue * weights[t]) / dateToPrices[firstDate][t];
  }

  const equityVals: number[] = [];
  const equityDates: string[] = [];

  for (const dt of allDates) {
    if (rebDates.has(dt)) {
      let curVal = 0;
      for (const t of tickers) curVal += dateToPrices[dt][t] * shares[t];
      for (const t of tickers) shares[t] = (curVal * weights[t]) / dateToPrices[dt][t];
    }

    let val = 0;
    for (const t of tickers) val += dateToPrices[dt][t] * shares[t];
    equityVals.push(val);
    equityDates.push(dt);
  }

  const dailyRets = pctChange(equityVals);
  const dd = computeDrawdown(equityVals);
  const mdd = maxDrawdown(dd);

  return {
    equity: equityDates.map((d, i) => ({ date: d, value: equityVals[i] })),
    drawdown: equityDates.map((d, i) => ({ date: d, value: dd[i] })),
    metrics: {
      totalReturn: equityVals[equityVals.length - 1] / equityVals[0] - 1,
      maxDrawdown: mdd,
      timeToRecoveryDays: timeToRecoveryDays(dates, equityVals, dd),
      annVol: annualizedVol(dailyRets),
      sharpe: sharpe(dailyRets, 0),
      annReturn: annualizedReturn(dates, equityVals),
    },
    weights,
  };
}
