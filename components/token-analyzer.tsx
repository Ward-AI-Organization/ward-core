"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { ContractScanner } from "@/components/contract-scanner"

interface TokenAnalysis {
  riskScore: number
  riskLevel: "low" | "medium" | "high" | "critical"
  threats: Array<{
    type: string
    severity: "low" | "medium" | "high" | "critical"
    description: string
    confidence: number
  }>
  metrics: {
    insiderActivity: number
    liquidityHealth: number
    holderConcentration: number
    tradingVolume: number
    priceVolatility: number
  }
  recommendations: string[]
}

interface TokenData {
  name: string
  symbol: string
  address: string
  priceUsd: string
  volume24h: number
  priceChange24h: number
  liquidity: number
  marketCap: number
}

interface TokenAnalyzerProps {
  tokenAddress: string | null
}

export function TokenAnalyzer({ tokenAddress }: TokenAnalyzerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [analysis, setAnalysis] = useState<TokenAnalysis | null>(null)
  const [isRateLimited, setIsRateLimited] = useState(false)

  useEffect(() => {
    if (!tokenAddress) {
      setError("No token address provided")
      setIsLoading(false)
      return
    }

    analyzeToken()
  }, [tokenAddress])

  const analyzeToken = async () => {
    setIsLoading(true)
    setError(null)
    setIsRateLimited(false)

    try {
      const response = await fetch("/api/analyze-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenAddress }),
      })

      const data = await response.json()

      if (response.status === 429 || data.isRateLimited) {
        setIsRateLimited(true)
        setError(
          "Rate limit exceeded. DexScreener API limits requests to prevent abuse. Please wait 60 seconds and try again.",
        )
        return
      }

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed")
      }

      setTokenData(data.token)
      setAnalysis(data.analysis)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze token")
    } finally {
      setIsLoading(false)
    }
  }

  const riskLevelConfig = {
    low: { color: "text-primary", bg: "bg-primary/10", label: "Low Risk" },
    medium: { color: "text-warning", bg: "bg-warning/10", label: "Medium Risk" },
    high: { color: "text-orange-500", bg: "bg-orange-500/10", label: "High Risk" },
    critical: { color: "text-destructive", bg: "bg-destructive/10", label: "Critical Risk" },
  }

  const severityIcon = {
    low: Info,
    medium: AlertTriangle,
    high: AlertTriangle,
    critical: XCircle,
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        {isRateLimited ? (
          <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
        ) : (
          <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        )}
        <h2 className="text-2xl font-bold mb-2">{isRateLimited ? "Rate Limit Reached" : "Analysis Failed"}</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        {isRateLimited ? (
          <Button onClick={analyzeToken} variant="outline" className="mr-2 bg-transparent">
            Try Again
          </Button>
        ) : null}
        <Link href="/">
          <Button variant={isRateLimited ? "default" : "outline"}>Return to Dashboard</Button>
        </Link>
      </Card>
    )
  }

  if (!tokenData || !analysis) {
    return null
  }

  return (
    <>
      {/* Token Overview */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {tokenData.name} ({tokenData.symbol})
            </h1>
            <p className="text-sm text-muted-foreground font-mono">{tokenData.address}</p>
          </div>
          <div className={`px-4 py-2 rounded-lg ${riskLevelConfig[analysis.riskLevel].bg}`}>
            <p className="text-xs text-muted-foreground mb-1">Risk Score</p>
            <p className={`text-3xl font-bold ${riskLevelConfig[analysis.riskLevel].color}`}>{analysis.riskScore}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Price</p>
            <p className="text-lg font-bold">${tokenData.priceUsd}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">24h Volume</p>
            <p className="text-lg font-bold">${tokenData.volume24h?.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">24h Change</p>
            <p className={`text-lg font-bold ${tokenData.priceChange24h >= 0 ? "text-primary" : "text-destructive"}`}>
              {tokenData.priceChange24h >= 0 ? "+" : ""}
              {tokenData.priceChange24h}%
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Liquidity</p>
            <p className="text-lg font-bold">${tokenData.liquidity?.toLocaleString()}</p>
          </div>
        </div>
      </Card>

      {/* Risk Assessment */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Risk Assessment</h2>
        <div className="grid md:grid-cols-5 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Insider Activity</p>
            <p className="text-2xl font-bold">{analysis.metrics.insiderActivity.toFixed(2)}/100</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Liquidity Health</p>
            <p className="text-2xl font-bold">{analysis.metrics.liquidityHealth.toFixed(2)}/100</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Holder Concentration</p>
            <p className="text-2xl font-bold">{analysis.metrics.holderConcentration}%</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Trading Volume</p>
            <p className="text-2xl font-bold">${(analysis.metrics.tradingVolume / 1000).toFixed(0)}K</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Price Volatility</p>
            <p className="text-2xl font-bold">{analysis.metrics.priceVolatility.toFixed(2)}/100</p>
          </div>
        </div>
      </Card>

      {/* Contract Scanner */}
      <ContractScanner tokenAddress={tokenAddress} />

      {/* Detected Threats */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Detected Threats</h2>
        {analysis.threats.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">No significant threats detected</p>
          </div>
        ) : (
          <div className="space-y-4">
            {analysis.threats.map((threat, index) => {
              const Icon = severityIcon[threat.severity]
              const config = riskLevelConfig[threat.severity]

              return (
                <div key={index} className={`p-4 rounded-lg border ${config.bg}`}>
                  <div className="flex items-start gap-3">
                    <Icon className={`h-5 w-5 ${config.color} flex-shrink-0 mt-1`} />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{threat.type}</h3>
                        <Badge variant="outline" className="text-xs">
                          {threat.confidence}% confident
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{threat.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Recommendations */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Security Recommendations</h2>
        <ul className="space-y-3">
          {analysis.recommendations.map((rec, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-sm leading-relaxed">{rec}</span>
            </li>
          ))}
        </ul>
      </Card>
    </>
  )
}
