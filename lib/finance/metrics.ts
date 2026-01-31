import { mean, stdev } from "./returns";

export function computeDrawdown(equity: number[]): number[] {
  const dd: number[] = [];
  let peak = -Infinity;
  for (const v of equity) {
    peak = Math.max(peak, v);
    dd.push(peak === 0 ? 0 : v / peak - 1);
  }
  return dd;
}

export function maxDrawdown(dd: number[]): number {
  return dd.length ? Math.min(...dd) : 0;
}

export function timeToRecoveryDays(dates: Date[], equity: number[], dd: number[]): number | null {
  if (equity.length === 0) return null;

  let troughIdx = 0;
  for (let i = 1; i < dd.length; i++) if (dd[i] < dd[troughIdx]) troughIdx = i;

  let peakVal = -Infinity;
  let peakIdx = 0;
  for (let i = 0; i <= troughIdx; i++) {
    if (equity[i] >= peakVal) {
      peakVal = equity[i];
      peakIdx = i;
    }
  }

  for (let i = troughIdx; i < equity.length; i++) {
    if (equity[i] >= peakVal) {
      const ms = dates[i].getTime() - dates[peakIdx].getTime();
      return Math.round(ms / (1000 * 60 * 60 * 24));
    }
  }
  return null;
}

export function annualizedVol(dailyReturns: number[], tradingDays = 252): number {
  return stdev(dailyReturns) * Math.sqrt(tradingDays);
}

export function annualizedReturn(dates: Date[], equity: number[]): number {
  if (equity.length < 2) return 0;
  const start = dates[0].getTime();
  const end = dates[dates.length - 1].getTime();
  const years = (end - start) / (1000 * 60 * 60 * 24) / 365.25;
  if (years <= 0) return 0;

  const total = equity[equity.length - 1] / equity[0] - 1;
  return Math.pow(1 + total, 1 / years) - 1;
}

export function sharpe(dailyReturns: number[], rfAnnual = 0, tradingDays = 252): number {
  if (dailyReturns.length < 2) return 0;
  const rfDaily = Math.pow(1 + rfAnnual, 1 / tradingDays) - 1;
  const excess = dailyReturns.map((r) => r - rfDaily);
  const denom = stdev(excess);
  if (denom === 0) return 0;
  return (mean(excess) / denom) * Math.sqrt(tradingDays);
}
