<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black" alt="Next.js 16"/>
  <img src="https://img.shields.io/badge/React-19.2-blue" alt="React 19.2"/>
  <img src="https://img.shields.io/badge/TypeScript-5-blue" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Tailwind-v4-38bdf8" alt="Tailwind CSS v4"/>
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License"/>
</p>

<h1 align="center">🛡️ WARD AI - AI-Powered Token Security</h1>

<p align="center">
  Real-time AI-powered security platform protecting crypto traders from market manipulation, rug pulls, and predatory trading on Solana DEX platforms.
</p>

---
  
## Tech Stack

### Core Framework
- **[Next.js 16](https://nextjs.org)** - React framework with App Router and Server Components
- **[React 19.2](https://react.dev)** - Latest React with Canary features (useEffectEvent, Activity)
- **[TypeScript 5](https://typescriptlang.org)** - Type-safe development
- AI-powered analysis with **GPT-4** and [Anthropic Claude](https://www.anthropic.com/)

### Blockchain & Data
- **[@solana/web3.js](https://solana.com)** - Solana blockchain RPC client
- **[DexScreener API](https://dexscreener.com)** - Real-time DEX trading data aggregation
- **[Bitquery API](https://bitquery.io)** - On-chain data analytics (optional)

### UI & Styling
- **[Tailwind CSS v4](https://tailwindcss.com)** - Utility-first CSS with design tokens
- **[shadcn/ui](https://ui.shadcn.com)** - High-quality React components (Radix UI primitives)
- **[Recharts](https://recharts.org)** - Composable charting library for data visualization
- **[Lucide Icons](https://lucide.dev)** - Beautiful, consistent icon set

### State & Data Fetching
- **[SWR](https://swr.vercel.app)** - React Hooks for data fetching with caching and revalidation
- **React Server Components** - Zero-JS server-rendered components

## Getting Started

### Installation

```bash```

# Clone the repository
```git clone https://github.com/Ward-AI-Organization/ward-ai-foundation.git```

```cd ward-ai-foundation```

### Environment Variables

Create environment variables in your local or cloud server:

```
# Optional: Bitquery API for enhanced analytics
BITQUERY_API_KEY=your_bitquery_key

# Optional: Apify or X API for social scraping 
APIFY_API_TOKEN=your_apify_token
```

### Run Development Server

```npm i```

```npm run dev```
# or

```bun dev```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Features

### 🔍 Token Analysis & Risk Scoring
- **AI-Powered Risk Assessment** - ML algorithms analyze 50+ on-chain metrics
- **Real-Time Data Integration** - Live feeds from DexScreener, Solana RPCs, and DEX aggregators
- **Multi-Factor Risk Scoring** - Combines liquidity, holder distribution, trading patterns, and volatility
- **Contract Security Audit** - Automated smart contract vulnerability detection

### 📊 Portfolio Protection Monitor
- **Multi-Wallet Tracking** - Monitor unlimited Solana wallets in real-time
- **Live Holdings Dashboard** - Track token balances, values, and P&L
- **Risk Aggregation** - Portfolio-wide risk scoring with weighted averages
- **Auto-Refresh** - Continuous monitoring with 30-second update intervals
- **Network Resilience** - Intelligent fallback with cached data during RPC outages

### 🚨 Live Trading Signals
- **Real-Time Alerts** - Instant notifications for whale activity, volume spikes, and price movements
- **Order Book Analysis** - Live buy/sell walls with depth visualization
- **Pattern Recognition** - Detects pump schemes, panic selling, momentum shifts, and breakouts
- **Alert Cooldowns** - Smart deduplication prevents alert spam (60s cooldowns)
- **5-Second Refresh** - Sub-10-second latency for critical trading signals

### 📈 ML Risk Analysis Dashboard
- **Sentiment Tracking** - AI-generated social sentiment based on trading activity
- **Risk Gauge Visualization** - Interactive risk meter with color-coded zones
- **Holder Distribution** - Top holder concentration analysis with percentage breakdowns
- **Liquidity Health** - Real-time liquidity pool monitoring and drain detection
- **Historical Trends** - Risk score evolution and pattern detection

### 🎯 Smart Contract Audit Scanner
- **Automated Security Checks** - Scans for honeypots, hidden mints, and ownership risks
- **Liquidity Analysis** - Validates pool depth and lock status
- **Trading Activity Review** - Flags suspicious buy/sell ratios and volume manipulation
- **Volatility Assessment** - Identifies extreme price swings indicating manipulation
- **Risk Classification** - Low/Medium/High risk levels with actionable insights
- 
## Usage

### 1. Analyze a Token

Navigate to the **Analyze** page and enter any Solana token contract address:

```
Example: 7Y2TPeq3hqw21LRTCi4wBWoivDngCpNNJsN1hzhZpump
```

The system will:
- Fetch real-time trading data from DexScreener
- Analyze 50+ on-chain metrics (liquidity, volume, holder concentration)
- Run ML risk scoring algorithms
- Generate AI-powered threat analysis
- Display comprehensive risk report with actionable insights

### 2. Monitor Your Portfolio

Navigate to **Analytics** > **Portfolio Protection**:

1. Enter your Solana wallet address
2. System fetches all SPL token holdings via Solana RPC
3. Calculates real-time portfolio value with live pricing
4. Aggregates risk scores across all holdings
5. Auto-refreshes every 30 seconds
6. Caches data to handle RPC rate limits gracefully

### 3. Track Live Trading Signals

Navigate to **Analytics** > **ML Risk Analysis**:

- Live trading signals update every 5 seconds
- Order book shows real-time buy/sell walls
- Alerts appear for significant events:
  - 🐋 Whale buys (large transactions)
  - 🚨 Panic selling (rapid sell clusters)
  - ⚡ Volume spikes (unusual activity)
  - 🚀 Breakouts (price momentum)
  - 💧 Liquidity changes (pool movements)

### 4. Run Smart Contract Audits

Navigate to **Analytics** > **Contract Scanner**:

Enter a token address to scan for:
- Honeypot detection (can you sell after buying?)
- Hidden mint functions (unlimited supply risks)
- Liquidity lock status (rug pull prevention)
- Unusual trading patterns (wash trading, sniping)
- Holder concentration (insider dump risks)

## API Routes

### `/api/analyze-token`

Performs comprehensive AI-powered token analysis.

**Query Parameters:**
- `address` (string) - Solana token contract address

**Response:**
```typescript
{
  riskScore: number;        // 0-100 (higher = more risky)
  riskLevel: string;        // "low" | "medium" | "high" | "critical"
  analysis: string;         // AI-generated detailed analysis
  threats: Array<{
    type: string;
    severity: string;
    confidence: number;
    description: string;
  }>;
  metrics: {
    liquidity: number;
    volume24h: number;
    priceChange24h: number;
    holders: number;
    age: number;
  };
}
```

### `/api/wallet-holdings`

Fetches real-time portfolio holdings for a Solana wallet.

**Query Parameters:**
- `address` (string) - Solana wallet address

**Response:**
```typescript
{
  holdings: Array<{
    mint: string;
    symbol: string;
    name: string;
    balance: number;
    decimals: number;
    price: number;
    value: number;
    riskScore: number;
  }>;
  totalValue: number;
  averageRisk: number;
}
```

### `/api/ml-risk-analysis`

Generates ML-based risk analysis with sentiment tracking.

**Query Parameters:**
- `address` (string) - Token contract address

**Response:**
```typescript
{
  overallRisk: number;
  sentiment: {
    score: number;
    label: string;
    posts: Array<{
      platform: string;
      author: string;
      content: string;
      sentiment: string;
      timestamp: string;
    }>;
  };
  holderDistribution: Array<{
    address: string;
    percentage: number;
    balance: number;
  }>;
}
```

### `/api/contract-audit`

Performs automated smart contract security audit.

**Query Parameters:**
- `address` (string) - Token contract address

**Response:**
```typescript
{
  overallRisk: number;
  findings: Array<{
    category: string;
    severity: string;
    title: string;
    description: string;
    recommendation: string;
  }>;
  metrics: {
    liquidityScore: number;
    tradingActivityScore: number;
    volatilityScore: number;
    honeypotRisk: boolean;
  };
}
```

### `/api/live-alerts`

Streams real-time trading alerts for monitored tokens.

**Query Parameters:**
- `address` (string) - Token contract address

**Response:**
\`\`\`typescript
{
  alerts: Array<{
    id: string;
    type: string;
    severity: string;
    message: string;
    timestamp: string;
    data: object;
  }>;
}
```

### `/api/social-sentiment`

Analyzes social sentiment using on-chain trading patterns.

**Query Parameters:**
- `address` (string) - Token contract address

**Response:**
\`\`\`typescript
{
  sentiment: {
    score: number;          // -100 to +100
    label: string;          // "Bullish" | "Neutral" | "Bearish"
    confidence: number;
  };
  activity: Array<{
    platform: string;
    author: string;
    content: string;
    sentiment: string;
    engagement: number;
    timestamp: string;
  }>;
}
```

## Project Structure

```
ward-ai-foundation/
├── app/
│   ├── analytics/          # Portfolio protection, ML risk analysis
│   ├── analyze/            # Token analysis interface
│   ├── advanced-trading/   # Professional trading terminal
│   ├── api/                # Backend API routes
│   │   ├── analyze-token/
│   │   ├── wallet-holdings/
│   │   ├── ml-risk-analysis/
│   │   ├── contract-audit/
│   │   ├── live-alerts/
│   │   └── social-sentiment/
│   └── page.tsx            # Landing page
├── components/
│   ├── portfolio-monitor.tsx
│   ├── ml-risk-scorer.tsx
│   ├── contract-scanner.tsx
│   ├── live-trading-chart.tsx
│   ├── sentiment-tracker.tsx
│   └── ui/                 # shadcn/ui components
├── lib/
│   └── utils.ts            # Utility functions
└── public/                 # Static assets
```

## Key Features Explained

### Real-Time Data Architecture

WARD uses a multi-layered approach to ensure data accuracy and reliability:

1. **Primary Source**: DexScreener API for DEX aggregated data
2. **Blockchain Source**: Solana RPC for on-chain verification
3. **Fallback Strategy**: Multiple RPC endpoints with automatic failover
4. **Caching Layer**: Client-side caching prevents data loss during outages
5. **Rate Limit Handling**: Intelligent backoff and retry mechanisms

### AI-Powered Risk Scoring

The ML risk analysis combines multiple factors:

- **Liquidity Health** (25%): Pool depth, lock status, LP token distribution
- **Trading Patterns** (20%): Buy/sell ratios, volume consistency, price stability
- **Holder Distribution** (20%): Top holder concentration, whale activity
- **Contract Security** (15%): Audit findings, ownership risks, mint functions
- **Market Metrics** (10%): Market cap, age, exchange listings
- **Volatility Analysis** (10%): Price swings, manipulation indicators

### Network Resilience

WARD handles Solana RPC failures gracefully:

1. Tries multiple public RPC endpoints sequentially
2. Implements connection timeouts (3-5 seconds)
3. Caches successful responses for 30 seconds
4. Shows stale data with warning during outages
5. Auto-retries in background without user intervention

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

- **X (Twitter)**: [@wardaicrypto](https://x.com/wardaicrypto)
- **GitHub**: [ward-ai-foundation](https://github.com/Ward-AI-Organization/ward-ai-foundation)
- **Website**: [ward-ai.com](https://www.ward-ai.com/)

---

<p align="center">
  Built with ❤️ by the WARD team 
</p>
