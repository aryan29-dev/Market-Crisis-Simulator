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
      "Housing Bubble + Rising Mortgage Defaults",
      "High Leverage + Complex Structured Products",
      "Credit Markets Froze As Trust Collapsed",
      "Forced Deleveraging and Broad Risk Selloff",
    ],
    keyDates: [
      { date: "2008-09-15", label: "Lehman Brothers Bankruptcy" },
      { date: "2008-10-03", label: "TARP Passed In The U.S." },
      { date: "2009-03-09", label: "Major Equity Market Low" },
    ],
    whatWorked: ["Long Treasuries", "Gold", "Cash / Short Duration"],
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

  "COVID-19 Crash (2020-02 to 2020-04)": {
    title: "COVID-19 Market Crash",
    summary:
      "A sudden global shutdown triggered a fast earnings shock and extreme uncertainty. Liquidity stress hit multiple asset classes until large monetary and fiscal support arrived.",
    drivers: [
      "Lockdowns and Demand Collapse",
      "Supply Chain Disruption",
      "Dash-for-cash Liquidity Stress",
      "Policy Response: Rate Cuts, QE, Stimulus",
    ],
    keyDates: [
      { date: "2020-03-11", label: "WHO Declares Pandemic" },
      { date: "2020-03-23", label: "Major Equity Market Low + Policy Pivot" },
      { date: "2020-04-09", label: "Support Expanded For Credit Markets" },
    ],
    whatWorked: ["Treasuries", "Gold", "High-Quality Growth (Context-Dependent)"],
    news: [
      {
        title: "WHO Declares COVID-19 A Pandemic",
        source: "National Library of Medicine",
        date: "2020-03-11",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7569573/",
      },
      {
        title: "Dow Sinks, Virus Pushes It To Sharpest Quarterly Plunge in Over Three Decades",
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
      "High Inflation Pressures",
      "Aggressive Central Bank Hikes",
      "Rising Real Yields Compress Valuations",
      "Bond Repricing As Yields Moved up",
    ],
    keyDates: [
      { date: "2022-06-15", label: "Fed Hikes 75 bps" },
      { date: "2022-09-21", label: "Higher-for-longer Guidance" },
      { date: "2022-10-12", label: "Rates Volatility Remains Elevated" },
    ],
    whatWorked: ["Cash / T-Bills", "Short Duration", "Energy Tilt (depends on crisis phase)"],
    news: [
      {
        title: "Fed Hikes Rates By 0.75 Percentage Point, Flags Slowing Economy",
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
