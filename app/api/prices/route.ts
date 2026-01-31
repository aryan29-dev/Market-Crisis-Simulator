export const runtime = "nodejs";

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

// Stooq daily CSV endpoint:
// https://stooq.com/q/d/l/?s=spy.us&i=d
async function fetchStooqDaily(ticker: string) {
  const symbol = `${ticker.toLowerCase()}.us`; // SPY -> spy.us
  const url = `https://stooq.com/q/d/l/?s=${encodeURIComponent(symbol)}&i=d`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Stooq fetch failed for ${ticker} (${res.status})`);

  const text = await res.text();
  const lines = text.trim().split("\n");
  // header: Date,Open,High,Low,Close,Volume
  if (lines.length < 2) return [];

  const out: { date: string; close: number }[] = [];
  for (let i = 1; i < lines.length; i++) {
    const [date, , , , closeStr] = lines[i].split(",");
    const close = Number(closeStr);
    if (!date || !Number.isFinite(close)) continue;
    out.push({ date, close });
  }
  return out;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const tickers: string[] = (body.tickers ?? []).map((t: string) =>
      String(t).toUpperCase().trim()
    );

    const start = String(body.start ?? "");
    const end = String(body.end ?? "");

    if (!tickers.length) {
      return Response.json({ error: "No tickers provided" }, { status: 400 });
    }
    if (!start || !end) {
      return Response.json({ error: "Missing start/end" }, { status: 400 });
    }

    const startD = new Date(start);
    const endD = new Date(end);

    const prices: Record<string, { date: string; close: number }[]> = {};

    for (const t of tickers) {
      try {
        const rows = await fetchStooqDaily(t);
        // Filter date range
        prices[t] = rows.filter((r) => {
          const d = new Date(r.date);
          return d >= startD && d <= endD;
        });
      } catch (e: any) {
        console.error(`Ticker failed ${t}:`, e?.message ?? e);
        prices[t] = [];
      }
    }

    return Response.json({ prices });
  } catch (e: any) {
    console.error(e);
    return Response.json(
      { error: "Server error in /api/prices", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
