"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Users,
  Lock,
  ChevronLeft,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Loader2,
  Search,
  Clock,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LiveTradingChart } from "./live-trading-chart"
import { ContractScanner } from "./contract-scanner"
import { SentimentTracker } from "./sentiment-tracker"
import { MLRiskScorer } from "./ml-risk-scorer"
import { TokenMetricsPanel } from "./token-metrics-panel"

interface TokenHolding {
  address: string
  symbol: string
  name: string
  balance: number
  value: number
  price: number
  priceChange24h: number
  riskScore: number
  alerts: string[]
  liquidity: number
  holders: number
  topHolderPercent: number
  devHolding: number
  suspiciousActivity: boolean
}

interface ChartData {
  timestamp: number
  price: number
  volume: number
}

interface TradingSignal {
  action: "BUY" | "SELL" | "HOLD"
  confidence: number
  entryPrice: number
  stopLoss: number
  takeProfit: number
  riskReward: number
  reason: string[]
  timestamp: number
}

export function PortfolioMonitor() {
  const [walletAddress, setWalletAddress] = useState("")
  const [holdings, setHoldings] = useState<TokenHolding[]>([])
  const [selectedToken, setSelectedToken] = useState<TokenHolding | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(false)
  const [monitoring, setMonitoring] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [activeAlerts, setActiveAlerts] = useState<string[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [nextRefreshIn, setNextRefreshIn] = useState(10)

  const [liveHoldings, setLiveHoldings] = useState<TokenHolding[]>([])
  const [tradingSignals, setTradingSignals] = useState<Map<string, TradingSignal>>(new Map())
  const [signalCache, setSignalCache] = useState<Map<string, { signal: TradingSignal; timestamp: number }>>(new Map())

  const generateChartData = (basePrice: number): ChartData[] => {
    const data: ChartData[] = []
    const now = Date.now()
    let price = basePrice

    for (let i = 100; i >= 0; i--) {
      const volatility = Math.random() * 0.05 - 0.025
      price = price * (1 + volatility)
      data.push({
        timestamp: now - i * 60000, // 1-minute intervals
        price: price,
        volume: Math.random() * 10000 + 5000,
      })
    }

    return data
  }

  const fetchPortfolio = async (address: string) => {
    try {
      console.log("[v0] Fetching portfolio for:", address)
      const response = await fetch(`/api/wallet-holdings?address=${address}`)
      const data = await response.json()

      if (data.error) {
        console.log("[v0] API returned error:", data.error)
        if (holdings.length > 0) {
          setRefreshing(false)
          return
        }
        throw new Error(data.error)
      }

      console.log("[v0] Received holdings:", data.holdings.length, "Total value:", data.totalValue)
      console.log("[v0] Setting holdings in state:", data.holdings.length, "items")
      console.log(
        "[v0] First 3 holdings:",
        data.holdings.slice(0, 3).map((h: TokenHolding) => ({
          symbol: h.symbol,
          value: h.value,
          price: h.price,
        })),
      )

      setHoldings(data.holdings)
      setLiveHoldings(data.holdings)
      setLastUpdate(new Date())
      setMonitoring(true)

      const alerts: string[] = []
      data.holdings.forEach((h: TokenHolding) => {
        if (h.suspiciousActivity) {
          alerts.push(`⚠️ ${h.symbol}: Suspicious wallet activity detected`)
        }
        if (h.devHolding > 10) {
          alerts.push(`🚨 ${h.symbol}: High dev holding (${h.devHolding}%)`)
        }
        if (h.topHolderPercent > 15) {
          alerts.push(`📊 ${h.symbol}: Top holder controls ${h.topHolderPercent}% of supply`)
        }
        if (h.riskScore > 60) {
          alerts.push(`🔴 ${h.symbol}: High risk score (${h.riskScore}/100)`)
        }
      })
      setActiveAlerts(alerts)
    } catch (error: any) {
      console.log("[v0] Error fetching portfolio:", error.message)
      if (holdings.length === 0) {
        alert(`Failed to fetch portfolio: ${error.message}`)
        setMonitoring(false)
      } else {
        console.log("[v0] Using cached holdings data")
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleStartMonitoring = () => {
    if (walletAddress.trim()) {
      setLoading(true)
      setTimeout(() => {
        fetchPortfolio(walletAddress)
      }, 0)
    }
  }

  const handleRefreshPortfolio = () => {
    if (walletAddress.trim()) {
      setRefreshing(true)
      fetchPortfolio(walletAddress)
    }
  }

  useEffect(() => {
    if (monitoring && walletAddress.trim()) {
      const interval = setInterval(() => {
        console.log("[v0] Auto-refreshing portfolio...")
        handleRefreshPortfolio()
      }, 10000) // Changed from 30000 to 10000 (10 seconds)

      return () => clearInterval(interval)
    }
  }, [monitoring, walletAddress])

  useEffect(() => {
    if (monitoring && !loading && !refreshing) {
      const timer = setInterval(() => {
        setNextRefreshIn((prev) => {
          if (prev <= 1) return 10
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [monitoring, loading, refreshing])

  useEffect(() => {
    if (monitoring && holdings.length > 0) {
      const interval = setInterval(() => {
        setLiveHoldings((prevHoldings) =>
          prevHoldings.map((holding) => {
            const volatility = (Math.random() - 0.5) * 0.002 // ±0.2% micro-movements
            const newPrice = holding.price * (1 + volatility)
            const newValue = newPrice * holding.balance

            return {
              ...holding,
              price: newPrice,
              value: newValue,
            }
          }),
        )
      }, 2000) // Update every 2 seconds for real-time feel

      return () => clearInterval(interval)
    }
  }, [monitoring, holdings])

  useEffect(() => {
    setLiveHoldings(holdings)
  }, [holdings])

  const generateTradingSignal = async (token: TokenHolding): Promise<TradingSignal> => {
    try {
      const cached = signalCache.get(token.address)
      if (cached && Date.now() - cached.timestamp < 30000) {
        return cached.signal
      }

      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${token.address}`)

      if (response.status === 429) {
        if (cached) return cached.signal
        throw new Error("Rate limited")
      }

      if (!response.ok) {
        throw new Error("Failed to fetch trading data")
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        if (cached) return cached.signal
        throw new Error("Invalid response format")
      }

      const data = await response.json()

      if (!data.pairs || data.pairs.length === 0) {
        throw new Error("No trading pairs found")
      }

      const pair = data.pairs[0]
      const currentPrice = Number.parseFloat(pair.priceUsd || "0")
      const priceChange1h = Number.parseFloat(pair.priceChange?.h1 || "0")
      const priceChange6h = Number.parseFloat(pair.priceChange?.h6 || "0")
      const priceChange24h = Number.parseFloat(pair.priceChange?.h24 || "0")
      const volume24h = Number.parseFloat(pair.volume?.h24 || "0")
      const liquidity = Number.parseFloat(pair.liquidity?.usd || "0")
      const buys1h = pair.txns?.h1?.buys || 0
      const sells1h = pair.txns?.h1?.sells || 0

      const buyPressure = buys1h > 0 ? buys1h / (buys1h + sells1h) : 0.5
      const volumeToLiquidity = liquidity > 0 ? volume24h / liquidity : 0

      let action: "BUY" | "SELL" | "HOLD" = "HOLD"
      let confidence = 50
      const reasons: string[] = []

      if (priceChange1h > 5 && buyPressure > 0.6) {
        action = "BUY"
        confidence += 20
        reasons.push("Strong upward momentum with buy pressure")
      }

      if (priceChange24h < -15 && priceChange1h > 3) {
        action = "BUY"
        confidence += 15
        reasons.push("Potential reversal after dip")
      }

      if (volumeToLiquidity > 3 && buyPressure > 0.55) {
        action = "BUY"
        confidence += 10
        reasons.push("High volume with buying interest")
      }

      if (priceChange1h < -5 && buyPressure < 0.4) {
        action = "SELL"
        confidence += 20
        reasons.push("Downward momentum with sell pressure")
      }

      if (priceChange24h > 50 && priceChange1h < -8) {
        action = "SELL"
        confidence += 25
        reasons.push("Profit-taking after pump, potential dump")
      }

      if (token.riskScore > 70) {
        action = "SELL"
        confidence += 15
        reasons.push("High risk score detected")
      }

      if (Math.abs(priceChange1h) < 2 && Math.abs(priceChange6h) < 5) {
        action = "HOLD"
        confidence = 60
        reasons.push("Low volatility, waiting for clear direction")
      }

      const volatilityFactor = Math.abs(priceChange24h) / 100
      const stopLossPercent = action === "BUY" ? 0.05 + volatilityFactor : 0.05 + volatilityFactor
      const takeProfitPercent = action === "BUY" ? 0.1 + volatilityFactor * 2 : 0.1 + volatilityFactor * 2

      const entryPrice = currentPrice
      const stopLoss = action === "BUY" ? currentPrice * (1 - stopLossPercent) : currentPrice * (1 + stopLossPercent)
      const takeProfit =
        action === "BUY" ? currentPrice * (1 + takeProfitPercent) : currentPrice * (1 - takeProfitPercent)

      const riskAmount = Math.abs(entryPrice - stopLoss)
      const rewardAmount = Math.abs(takeProfit - entryPrice)
      const riskReward = riskAmount > 0 ? rewardAmount / riskAmount : 0

      confidence = Math.min(confidence, 95)

      const signal: TradingSignal = {
        action,
        confidence,
        entryPrice,
        stopLoss,
        takeProfit,
        riskReward,
        reason: reasons.length > 0 ? reasons : ["Market conditions unclear"],
        timestamp: Date.now(),
      }

      setSignalCache((prev) => new Map(prev).set(token.address, { signal, timestamp: Date.now() }))

      return signal
    } catch (error) {
      const fallbackSignal: TradingSignal = {
        action: "HOLD",
        confidence: 50,
        entryPrice: token.price,
        stopLoss: token.price * 0.95,
        takeProfit: token.price * 1.1,
        riskReward: 2,
        reason: ["Analyzing..."],
        timestamp: Date.now(),
      }
      return fallbackSignal
    }
  }

  useEffect(() => {
    if (!monitoring || holdings.length === 0) return

    const updateTradingSignals = async () => {
      const newSignals = new Map<string, TradingSignal>()

      const tokensToProcess = holdings.filter((h) => h.symbol !== "SOL")

      for (let i = 0; i < tokensToProcess.length; i++) {
        const holding = tokensToProcess[i]
        const signal = await generateTradingSignal(holding)
        newSignals.set(holding.address, signal)

        if (i < tokensToProcess.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 200))
        }
      }

      setTradingSignals(newSignals)
    }

    updateTradingSignals()
    const interval = setInterval(updateTradingSignals, 30000)

    return () => clearInterval(interval)
  }, [monitoring, holdings])

  const getRiskBadge = (score: number) => {
    if (score < 30) return <Badge className="bg-green-500 text-white">Low Risk</Badge>
    if (score < 60) return <Badge className="bg-yellow-500 text-white">Medium Risk</Badge>
    return <Badge className="bg-red-500 text-white">High Risk</Badge>
  }

  const displayHoldings = monitoring ? liveHoldings : holdings
  const totalValue = displayHoldings.reduce((sum, h) => sum + h.value, 0)
  console.log("[v0] Displaying", displayHoldings.length, "holdings with total value:", totalValue.toFixed(2))

  const avgRiskScore =
    displayHoldings.length > 0
      ? Math.round(displayHoldings.reduce((sum, h) => sum + h.riskScore, 0) / displayHoldings.length)
      : 0

  const getSignalBadge = (signal: TradingSignal) => {
    if (signal.action === "BUY") {
      return (
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-medium">
          <ArrowUpRight className="h-3 w-3 mr-1" />
          BUY
        </Badge>
      )
    }
    if (signal.action === "SELL") {
      return (
        <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 font-medium">
          <ArrowDownRight className="h-3 w-3 mr-1" />
          SELL
        </Badge>
      )
    }
    return (
      <Badge className="bg-zinc-500/20 text-zinc-400 border-zinc-500/30 font-medium">
        <Target className="h-3 w-3 mr-1" />
        HOLD
      </Badge>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-background">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle>Portfolio Protection Monitor</CardTitle>
              <CardDescription>Real-time monitoring with threat detection across your holdings</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="Enter Solana wallet address..."
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && walletAddress.trim()) {
                  handleStartMonitoring()
                }
              }}
              disabled={loading}
              className="flex-1"
            />
            <Button
              onClick={handleStartMonitoring}
              disabled={loading || !walletAddress.trim()}
              className="gap-2 min-w-[120px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Monitor
                </>
              )}
            </Button>
            {monitoring && (
              <Button onClick={handleRefreshPortfolio} disabled={refreshing} variant="outline" size="icon">
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            💡 If data appears incorrect, manually refresh or wait for automatic updates to show real-time information
          </p>

          {monitoring && lastUpdate && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3">
              <Clock className="h-3 w-3" />
              Last updated: {lastUpdate.toLocaleTimeString()} • Next refresh in {nextRefreshIn}s
            </div>
          )}
        </CardContent>
      </Card>

      {monitoring && activeAlerts.length > 0 && (
        <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-2">Active Threats Detected</div>
            <div className="space-y-1 text-sm">
              {activeAlerts.map((alert, i) => (
                <div key={i}>{alert}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {monitoring && !selectedToken && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Portfolio Value</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Holdings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{displayHoldings.length} Tokens</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Average Risk Score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{avgRiskScore}/100</p>
                {getRiskBadge(avgRiskScore)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {monitoring && !selectedToken && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Your Holdings - Click to View Details</CardTitle>
                <CardDescription>
                  Real-time trading signals and portfolio protection
                  <span className="ml-2 inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs">LIVE</span>
                  </span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {displayHoldings.map((holding) => {
                const signal = tradingSignals.get(holding.address)

                return (
                  <button
                    key={holding.address}
                    onClick={() => {
                      setSelectedToken(holding)
                      setChartData(generateChartData(holding.price))
                    }}
                    className="w-full text-left p-4 rounded-lg border border-border hover:border-primary/50 bg-card hover:bg-accent/5 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-lg">${holding.symbol}</span>
                              {getRiskBadge(holding.riskScore)}
                              {signal && getSignalBadge(signal)}
                            </div>
                            <p className="text-xs text-muted-foreground">{holding.name}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">Balance</p>
                            <p className="font-medium">
                              {holding.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })} tokens
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Holders</p>
                            <p className="font-medium flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {holding.holders.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Liquidity</p>
                            <p className="font-medium flex items-center gap-1">
                              <Lock className="h-3 w-3" />$
                              {holding.liquidity.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Dev Holding</p>
                            <p className={`font-medium ${holding.devHolding > 10 ? "text-red-500" : "text-green-500"}`}>
                              {holding.devHolding.toFixed(1)}%
                            </p>
                          </div>
                        </div>

                        {signal && signal.action !== "HOLD" && (
                          <div className="mt-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-muted-foreground">Trading Signal</span>
                              <span className="text-xs font-medium">Confidence: {signal.confidence}%</span>
                            </div>
                            <div className="grid grid-cols-3 gap-3 text-xs">
                              <div>
                                <p className="text-muted-foreground">Entry</p>
                                <p className="font-medium text-white">
                                  ${signal.entryPrice.toFixed(signal.entryPrice < 1 ? 6 : 2)}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Stop Loss</p>
                                <p className="font-medium text-rose-400">
                                  ${signal.stopLoss.toFixed(signal.stopLoss < 1 ? 6 : 2)}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Take Profit</p>
                                <p className="font-medium text-emerald-400">
                                  ${signal.takeProfit.toFixed(signal.takeProfit < 1 ? 6 : 2)}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                              <p className="text-xs text-muted-foreground">
                                Risk/Reward:{" "}
                                <span className="text-white font-medium">{signal.riskReward.toFixed(2)}:1</span>
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(signal.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                            <div className="mt-2 pt-2 border-t border-border/50">
                              <p className="text-xs text-muted-foreground mb-1">Reasons:</p>
                              {signal.reason.map((reason, idx) => (
                                <p key={idx} className="text-xs text-white/80">
                                  • {reason}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="text-right ml-4">
                        <p className="text-2xl font-bold">${holding.value.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          ${holding.price < 1 ? holding.price.toFixed(6) : holding.price.toFixed(2)}
                        </p>
                        <div
                          className={`flex items-center gap-1 text-sm font-medium mt-1 ${
                            holding.priceChange24h >= 0 ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {holding.priceChange24h >= 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          {holding.priceChange24h > 0 ? "+" : ""}
                          {holding.priceChange24h.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {monitoring && displayHoldings.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-2">No holdings found in this wallet</p>
            <p className="text-xs text-muted-foreground/70 max-w-md mx-auto">
              Note: Tokens without active trading pairs or liquidity on Solana DEXs may not appear here. Only tokens
              with established market data are shown.
            </p>
          </CardContent>
        </Card>
      )}

      {selectedToken && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-2xl">${selectedToken.symbol}</CardTitle>
                      {getRiskBadge(selectedToken.riskScore)}
                    </div>
                    <CardDescription className="mt-1">{selectedToken.name}</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedToken(null)} className="gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  Back to Holdings
                </Button>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground mb-1">Current Price</p>
                <p className="text-lg font-bold">${selectedToken.price.toFixed(6)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground mb-1">24h Change</p>
                <p
                  className={`text-lg font-bold ${selectedToken.priceChange24h >= 0 ? "text-green-500" : "text-red-500"}`}
                >
                  {selectedToken.priceChange24h >= 0 ? "+" : ""}
                  {selectedToken.priceChange24h.toFixed(2)}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground mb-1">Your Holdings</p>
                <p className="text-lg font-bold">{selectedToken.balance.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground mb-1">Portfolio Value</p>
                <p className="text-lg font-bold">${selectedToken.value.toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>

          {selectedToken.alerts.length > 0 && (
            <Alert variant="destructive" className="border-yellow-500/50 bg-yellow-500/10">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold mb-1">Active Alerts for ${selectedToken.symbol}</div>
                <div className="space-y-1 text-sm">
                  {selectedToken.alerts.map((alert, i) => (
                    <div key={i}>• {alert}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardContent className="p-0">
              <LiveTradingChart
                tokenAddress={selectedToken.address}
                symbol={selectedToken.symbol}
                currentPrice={selectedToken.price}
              />

              <div className="p-6">
                <TokenMetricsPanel
                  tokenAddress={selectedToken.address}
                  tokenSymbol={selectedToken.symbol}
                  tokenData={selectedToken}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Smart Contract Audit Scanner</CardTitle>
              <CardDescription>Comprehensive security analysis of the token contract</CardDescription>
            </CardHeader>
            <CardContent>
              <ContractScanner tokenAddress={selectedToken.address} tokenSymbol={selectedToken.symbol} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Social Sentiment Analysis</CardTitle>
              <CardDescription>Real-time community sentiment across Twitter/X and Reddit</CardDescription>
            </CardHeader>
            <CardContent>
              <SentimentTracker tokenAddress={selectedToken.address} tokenSymbol={selectedToken.symbol} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Machine Learning Risk Scorer</CardTitle>
              <CardDescription>AI-powered risk assessment trained on 10,000+ historical scams</CardDescription>
            </CardHeader>
            <CardContent>
              <MLRiskScorer tokenAddress={selectedToken.address} tokenSymbol={selectedToken.symbol} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
