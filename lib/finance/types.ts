export type PricesByTicker = Record<string, { date: string; close: number }[]>;

export type Rebalance = "monthly" | "weekly" | "daily";

export type SimulationResult = {
  equity: { date: string; value: number }[];
  drawdown: { date: string; value: number }[];
  metrics: {
    totalReturn: number;
    maxDrawdown: number;
    timeToRecoveryDays: number | null;
    annVol: number;
    sharpe: number;
    annReturn: number;
  };
  weights: Record<string, number>;
};
