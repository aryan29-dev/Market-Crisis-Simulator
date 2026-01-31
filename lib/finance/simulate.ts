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
    if (Number.isFinite(num) && num > 0) {
      cleaned[k] = num;
      total += num;
    }
  }

  if (total <= 0) return {};
  for (const k of Object.keys(cleaned)) cleaned[k] = cleaned[k] / total;
  return cleaned;
}

function getISOWeekYearAndWeek(d: Date): { isoYear: number; isoWeek: number } {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);

  const isoYear = date.getUTCFullYear();
  const yearStart = new Date(Date.UTC(isoYear, 0, 1));
  const isoWeek = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

  return { isoYear, isoWeek };
}

function pickRebalanceDates(dates: Date[], mode: Rebalance): Set<string> {
  const toKey = (d: Date) => d.toISOString().slice(0, 10);
  const set = new Set<string>();

  if (mode === "daily") {
    for (const d of dates) set.add(toKey(d));
    return set;
  }

  let lastBucket: string | null = null;

  for (const d of dates) {
    let bucket: string;

    if (mode === "weekly") {
      const { isoYear, isoWeek } = getISOWeekYearAndWeek(d);
      bucket = `${isoYear}-W${String(isoWeek).padStart(2, "0")}`;
    } else {
      bucket = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    }

    if (bucket !== lastBucket) {
      set.add(toKey(d));
      lastBucket = bucket;
    }
  }

  return set;
}

function alignPrices(
  pricesByTicker: PricesByTicker,
  tickers: string[]
): { allDates: string[]; dateToPrices: Record<string, Record<string, number>> } {
  const dateToPrices: Record<string, Record<string, number>> = {};

  for (const t of tickers) {
    const rows = pricesByTicker[t] ?? [];
    for (const row of rows) {
      if (!row?.date) continue;
      const close = Number(row.close);
      if (!Number.isFinite(close)) continue;

      if (!dateToPrices[row.date]) dateToPrices[row.date] = {};
      dateToPrices[row.date][t] = close;
    }
  }

  const allDates = Object.keys(dateToPrices)
    .sort()
    .filter((dt) => tickers.every((t) => typeof dateToPrices[dt]?.[t] === "number"));

  return { allDates, dateToPrices };
}

function padToLength(arr: number[], n: number, padValue = 0): number[] {
  const out = arr.slice();
  while (out.length < n) out.push(out.length ? out[out.length - 1] : padValue);
  if (out.length > n) out.length = n;
  return out;
}

export function simulate(
  pricesByTicker: PricesByTicker,
  rawWeights: Record<string, number>,
  rebalance: Rebalance,
  initialValue = 100
): SimulationResult {
  const weights = normalizeWeights(rawWeights);
  const tickers = Object.keys(weights);

  if (tickers.length === 0) {
    throw new Error("Set at least one weight > 0");
  }

  for (const t of tickers) {
    const rows = pricesByTicker[t] ?? [];
    if (rows.length < 2) {
      throw new Error(`No (or not enough) price data for ${t}. Try a different ticker.`);
    }
  }

  const { allDates, dateToPrices } = alignPrices(pricesByTicker, tickers);

  if (allDates.length < 2) {
    throw new Error("Not enough aligned price points across tickers.");
  }

  const dates = allDates.map((s) => new Date(`${s}T00:00:00Z`));
  const rebDates = pickRebalanceDates(dates, rebalance);

  const firstDate = allDates[0];
  const shares: Record<string, number> = {};
  for (const t of tickers) {
    const px = dateToPrices[firstDate][t];
    shares[t] = (initialValue * weights[t]) / px;
  }

  const equityVals: number[] = [];
  const equityDates: string[] = [];

  for (const dt of allDates) {
    if (rebDates.has(dt)) {
      let curVal = 0;
      for (const t of tickers) curVal += dateToPrices[dt][t] * shares[t];

      for (const t of tickers) {
        shares[t] = (curVal * weights[t]) / dateToPrices[dt][t];
      }
    }

    let val = 0;
    for (const t of tickers) val += dateToPrices[dt][t] * shares[t];

    equityVals.push(val);
    equityDates.push(dt);
  }

  const dailyRets = pctChange(equityVals);
  const ddRaw = computeDrawdown(equityVals);
  const dd = padToLength(ddRaw, equityVals.length, 0);
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
