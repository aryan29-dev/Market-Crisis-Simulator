// lib/finance/crisisBriefs.ts

export type NewsItem = {
  title: string;
  source: string;
  date: string;
  url: string;
};

export type KeyDate = {
  date: string;
  label: string;
};

export type CrisisBrief = {
  title: string;
  summary: string;
  drivers: string[];
  keyDates: KeyDate[];
  whatWorked: string[];
  news: NewsItem[];
};

export const crisisBriefs: Record<string, CrisisBrief> = {
  "2008 GFC (2007-10 to 2009-03)": {
    title: "2008 Global Financial Crisis",
    summary:
      "A credit-driven housing boom unwound into a banking crisis. Losses in mortgage-related products spread through the system, freezing credit and driving a global recession.",
    drivers: [
      "Housing bubble + rising mortgage defaults",
      "High leverage + complex structured products",
      "Credit markets froze as trust collapsed",
      "Forced deleveraging and broad risk selloff",
    ],
    keyDates: [
      { date: "2008-09-15", label: "Lehman bankruptcy" },
      { date: "2008-10-03", label: "TARP passed in the U.S." },
      { date: "2009-03-09", label: "Major equity market low (widely cited)" },
    ],
    whatWorked: ["Long Treasuries", "Gold", "Cash / short duration"],
    news: [
      {
        title: "The Day Lehman Brothers Went Under",
        source: "BBC",
        date: "2018-09-14",
        url: "https://www.bbc.com/news/business-45515092",
      },
      {
        title: "The Collapse of Lehman Brothers | The $639 Billion Crash",
        source: "Moconomy",
        date: "2025-06-25",
        url: "https://youtu.be/9Of4pbnNY5U?si=k7UC3HQMx7ND2KJO",
      },
    ],
  },

  "COVID Crash (2020-02 to 2020-04)": {
    title: "COVID-19 Market Crash",
    summary:
      "A sudden global shutdown triggered a fast earnings shock and extreme uncertainty. Liquidity stress hit multiple asset classes until large monetary and fiscal support arrived.",
    drivers: [
      "Lockdowns and demand collapse",
      "Supply chain disruption",
      "Dash-for-cash liquidity stress",
      "Policy response: rate cuts, QE, stimulus",
    ],
    keyDates: [
      { date: "2020-03-11", label: "WHO declares pandemic" },
      { date: "2020-03-23", label: "Major market low + policy pivot" },
      { date: "2020-04-09", label: "Support expanded for credit markets" },
    ],
    whatWorked: ["Treasuries", "Gold", "High-quality growth (context-dependent)"],
    news: [
      {
        title: "WHO declares COVID-19 a pandemic",
        source: "World Health Organization",
        date: "2020-03-11",
        url: "https://www.who.int/director-general/speeches/detail/who-director-general-s-opening-remarks-at-the-media-briefing-on-covid-19---11-march-2020",
      },
      {
        title: "Wall Street tumbles as coronavirus economic damage mounts",
        source: "Reuters",
        date: "2020-03-31",
        url: "https://www.reuters.com/article/business/dow-sinks-virus-pushes-it-to-sharpest-quarterly-plunge-in-over-three-decades-idUSKBN21I1C5/",
      },
    ],
  },

  "Rate Shock (2022-01 to 2022-10)": {
    title: "2022 Rate Shock",
    summary:
      "Inflation surged and central banks tightened quickly. Rising yields hit both bonds and long-duration equities, producing a painful stock–bond drawdown.",
    drivers: [
      "High inflation pressures",
      "Aggressive central bank hikes",
      "Rising real yields compress valuations",
      "Bond repricing as yields moved up",
    ],
    keyDates: [
      { date: "2022-06-15", label: "Fed hikes 75 bps" },
      { date: "2022-09-21", label: "Higher-for-longer guidance" },
      { date: "2022-10-12", label: "Rates volatility remains elevated" },
    ],
    whatWorked: ["Cash / T-bills", "Short duration", "Energy tilt (depends)"],
    news: [
      {
        title: "Fed hikes rates by 0.75 percentage point, flags slowing economy",
        source: "Reuters",
        date: "2022-06-15",
        url: "https://www.reuters.com/markets/us/fed-hikes-rates-by-075-percentage-point-flags-slowing-economy-2022-06-15/",
      },
      {
        title: "Fed Raises Rates by 0.75 Percentage Point, Largest Increase Since 1994",
        source: "Wall Street Journal",
        date: "2022-06-15",
        url: "https://www.wsj.com/livecoverage/federal-reserve-meeting-interest-rates-june-2022/card/mPXvzgV1I7LCysRUFkUi",
      },
    ],
  },
};
