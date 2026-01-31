export type CrisisKey = keyof typeof CRISES;

export const CRISES = {
  "2008 GFC (2007-10 to 2009-03)": { start: "2007-10-01", end: "2009-03-31" },
  "COVID Crash (2020-02 to 2020-04)": { start: "2020-02-01", end: "2020-04-30" },
  "Rate Shock (2022-01 to 2022-10)": { start: "2022-01-01", end: "2022-10-31" },
} as const;

export const DEFAULT_TICKERS = ["SPY", "QQQ", "IWM", "EFA", "EEM", "TLT", "IEF", "GLD"];