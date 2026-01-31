export const runtime = "nodejs";

type PriceRow = { date: string; close: number };

function normalizeTicker(raw: string) {
  return String(raw ?? "").trim().toUpperCase();
}

function parseISODate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toISODateUTC(d: Date) {
  return d.toISOString().slice(0, 10);
}

function stripKnownSuffixes(t: string) {
  return t
    .replace(/\.TO$/i, "")
    .replace(/-TO$/i, "")
    .replace(/\.V$/i, "")
    .replace(/-V$/i, "")
    .replace(/\.US$/i, "")
    .replace(/-US$/i, "")
    .replace(/\.CA$/i, "")
    .replace(/-CA$/i, "");
}

function buildTickerCandidates(raw: string) {
  const t = normalizeTicker(raw);
  if (!t) return [];

  const out: string[] = [];
  const push = (x: string) => {
    const u = normalizeTicker(x);
    if (u && !out.includes(u)) out.push(u);
  };

  push(t);

  if (t.endsWith(".TO")) push(t.replace(".TO", "-TO"));
  if (t.endsWith("-TO")) push(t.replace("-TO", ".TO"));

  if (t.endsWith(".V")) push(t.replace(".V", "-V"));
  if (t.endsWith("-V")) push(t.replace("-V", ".V"));

  if (!t.includes(".")) {
    push(`${t}.TO`);
    push(`${t}-TO`);
    push(`${t}.V`);
    push(`${t}-V`);
  }

  return out;
}

async function fetchYahooDaily(ticker: string, startD: Date, endD: Date): Promise<PriceRow[]> {
  const period1 = Math.floor(startD.getTime() / 1000);
  const period2 = Math.floor(endD.getTime() / 1000);

  const url =
    `https://query1.finance.yahoo.com/v8/finance/chart/` +
    `${encodeURIComponent(ticker)}` +
    `?period1=${period1}&period2=${period2}&interval=1d&events=history&includeAdjustedClose=true`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Yahoo fetch failed for ${ticker} (${res.status})`);

  const json: any = await res.json();
  const result = json?.chart?.result?.[0];
  if (!result) return [];

  const timestamps: number[] = result.timestamp ?? [];
  const closes: (number | null)[] =
    result?.indicators?.adjclose?.[0]?.adjclose ??
    result?.indicators?.quote?.[0]?.close ??
    [];

  const out: PriceRow[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    const ts = timestamps[i];
    const close = closes[i];
    if (!Number.isFinite(ts) || close == null || !Number.isFinite(close)) continue;

    const d = new Date(ts * 1000);
    const iso = toISODateUTC(d);
    out.push({ date: iso, close: Number(close) });
  }

  return out;
}

function buildStooqSymbolsFromCandidate(candidate: string) {
  const t = normalizeTicker(candidate);
  const base = stripKnownSuffixes(t);

  const out: string[] = [];
  const push = (x: string) => {
    const u = x.toLowerCase();
    if (u && !out.includes(u)) out.push(u);
  };

  const looksCanada =
    t.endsWith(".TO") ||
    t.endsWith("-TO") ||
    t.endsWith(".V") ||
    t.endsWith("-V") ||
    t.endsWith(".CA") ||
    t.endsWith("-CA");

  const looksUS = t.endsWith(".US") || t.endsWith("-US");

  if (looksCanada) {
    push(`${base}.ca`);
    push(`${base}.us`);
    return out;
  }

  if (looksUS) {
    push(`${base}.us`);
    push(`${base}.ca`);
    return out;
  }

  push(`${base}.us`);
  push(`${base}.ca`);
  return out;
}

async function fetchStooqDailyBySymbol(stooqSymbol: string): Promise<PriceRow[]> {
  const url = `https://stooq.com/q/d/l/?s=${encodeURIComponent(stooqSymbol)}&i=d`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Stooq fetch failed for ${stooqSymbol} (${res.status})`);

  const text = await res.text();
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  const out: PriceRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const [date, , , , closeStr] = lines[i].split(",");
    const close = Number(closeStr);
    if (!date || !Number.isFinite(close)) continue;
    out.push({ date, close });
  }
  return out;
}

function filterRange(rows: PriceRow[], startD: Date, endD: Date) {
  return rows.filter((r) => {
    const d = new Date(r.date);
    return d >= startD && d <= endD;
  });
}

function hasEnoughData(rows: PriceRow[], minPoints: number) {
  return Array.isArray(rows) && rows.length >= minPoints;
}

async function fetchWithFallback(
  rawTicker: string,
  startD: Date,
  endD: Date,
  minPointsInWindow: number
) {
  const candidates = buildTickerCandidates(rawTicker);

  const tried: string[] = [];

  for (const cand of candidates) {
    try {
      tried.push(`yahoo:${cand}`);
      const rows = await fetchYahooDaily(cand, startD, endD);
      const windowRows = filterRange(rows, startD, endD);

      if (hasEnoughData(windowRows, minPointsInWindow)) {
        return { provider: "yahoo", symbolUsed: cand, rows: windowRows };
      }
    } catch {
    }
  }
  
  for (const cand of candidates) {
    const stooqSymbols = buildStooqSymbolsFromCandidate(cand);
    for (const sym of stooqSymbols) {
      try {
        tried.push(`stooq:${sym}`);
        const rows = await fetchStooqDailyBySymbol(sym);
        const windowRows = filterRange(rows, startD, endD);

        if (hasEnoughData(windowRows, minPointsInWindow)) {
          return { provider: "stooq", symbolUsed: sym, rows: windowRows };
        }
      } catch {
      }
    }
  }

  throw new Error(
    `No (or not enough) price data for ${normalizeTicker(rawTicker)}. Tried: ${tried.join(", ")}`
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const tickers: string[] = (body.tickers ?? [])
      .map((t: string) => normalizeTicker(t))
      .filter(Boolean);

    const start = String(body.start ?? "");
    const end = String(body.end ?? "");

    if (!tickers.length) return Response.json({ error: "No tickers provided" }, { status: 400 });
    if (!start || !end) return Response.json({ error: "Missing start/end" }, { status: 400 });

    const startD = parseISODate(start);
    const endD = parseISODate(end);
    if (!startD || !endD) return Response.json({ error: "Invalid start/end date" }, { status: 400 });

    const MIN_POINTS_IN_WINDOW = 20;

    const prices: Record<string, PriceRow[]> = {};
    const meta: Record<string, { provider?: string; symbolUsed?: string; error?: string }> = {};

    for (const t of tickers) {
      try {
        const { provider, symbolUsed, rows } = await fetchWithFallback(
          t,
          startD,
          endD,
          MIN_POINTS_IN_WINDOW
        );
        prices[t] = rows;
        meta[t] = { provider, symbolUsed };
      } catch (e: any) {
        prices[t] = [];
        meta[t] = { error: String(e?.message ?? e) };
      }
    }

    return Response.json({ prices, meta });
  } catch (e: any) {
    return Response.json(
      { error: "Server error in /api/prices", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
