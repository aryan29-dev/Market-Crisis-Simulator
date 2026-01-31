export type PriceRow = { date: string; close: number };

export type PricesByTicker = Record<string, PriceRow[]>;

export type Rebalance = "monthly" | "weekly" | "daily";

export type Point = { date: string; value: number };

export type SimulationResult = {
  equity: Point[];
  drawdown: Point[];
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
