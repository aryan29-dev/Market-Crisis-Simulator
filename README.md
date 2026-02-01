# 📉 Market Stress & Crisis Simulator

An interactive portfolio stress-testing web application that allows users to replay historical market crises, analyze drawdowns, and evaluate recovery behavior across mixed U.S. and Canadian portfolios.

Built with **Next.js**, **TypeScript**, and **Recharts**, this project is designed for financial analysis and portfolio risk exploration.

---

## 🚀 Features

- 📆 **Historical Crisis Replay**
  - 2008 Global Financial Crisis  
  - COVID-19 Market Crash  
  - 2022 Rate Shock  

- 📊 **Portfolio Analytics**
  - Equity curve visualization  
  - Drawdown analysis  
  - Total return & annualized return  
  - Volatility and Sharpe ratio  

- 🌎 **Multi-Market Support**
  - Mix **U.S.** (AAPL, SPY, QQQ, etc.)
  - Mix **Canadian TSX** tickers (`.TO`)
  - Handles mixed portfolios seamlessly

- ⚖️ **Custom Portfolio Weights**
  - Adjustable weights per asset
  - Automatic normalization
  - Monthly / weekly / daily rebalancing

- ⏱ **Recovery Window Analysis**
  - Measure time to recovery over:
    - 12 / 18 / 24 / 36 months

- 📱 **Responsive UI**
  - Desktop and mobile friendly
  - iOS-safe chart layout

---

## 🛠 Tech Stack

- **Frontend:** Next.js (App Router), React, TypeScript  
- **Charts:** Recharts  
- **Styling:** Tailwind CSS  
- **Data:** Yahoo! Finance & Stooq
- **Deployment:** Vercel (Node.js runtime)

---

## 📂 Project Structure

```text
market-crisis-simulator/
├── app/
│   ├── api/
│   │   └── prices/
│   │       └── route.ts
│   ├── page.tsx
│   └── layout.tsx
│
├── components/
│   ├── Charts.tsx
│   ├── Controls.tsx
│   └── MetricCards.tsx
│
├── lib/
│   ├── crises.ts
│   └── finance/
│       ├── crisisBriefs.ts
│       ├── metrics.ts
│       ├── returns.ts
│       ├── simulate.ts
│       └── types.ts
│
├── .gitignore
├── next.config.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json
├── LICENSE
└── README.md
```
---

## 📈 How It Works

1. Select a **market crisis**
2. Enter a list of **tickers** (U.S. OR Canadian)
3. Assign **portfolio weights**
4. Choose a **rebalancing frequency**
5. Run the simulation to view:
   - Equity curve
   - Drawdowns
   - Recovery metrics

Tickers with insufficient data during the selected crisis window are automatically excluded.

## Installation & Setup

```text
git clone https://github.com/aryan29-dev/market-crisis-simulator.git
cd market-crisis-simulator
npm install
npm run dev
Open: http://localhost:3000
```

