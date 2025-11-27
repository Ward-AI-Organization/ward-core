"use client"

import { useState } from "react"
import { MarketGuardHeader } from "@/components/market-guard-header"
import { Footer } from "@/components/footer"
import { Shield, ScanSearch, TrendingUp, Brain, AlertTriangle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ContractScanner } from "@/components/contract-scanner"
import { SentimentTracker } from "@/components/sentiment-tracker"
import { MLRiskScorer } from "@/components/ml-risk-scorer"
import { PortfolioMonitor } from "@/components/portfolio-monitor"
import { Badge } from "@/components/ui/badge"

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-background">
      <MarketGuardHeader />

      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 mb-6">
            <span className="text-sm font-medium text-emerald-400">Phase 2 - Beta Live</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Advanced Analytics & AI
          </h1>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Next-generation trading intelligence powered by artificial intelligence and machine learning
          </p>
        </div>

        {activeTab === "portfolio" && (
          <div className="max-w-4xl mx-auto mb-8 border border-yellow-500/30 rounded-xl p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">Portfolio Protection - Under Maintenance</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We are currently experiencing connectivity issues with Solana RPC endpoints. The Portfolio Protection
                  feature may display mock data or limited information during this maintenance period. We're working to
                  restore full real-time functionality as quickly as possible.
                </p>
              </div>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 mb-8">
            <TabsTrigger value="overview" className="text-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="text-sm">
              <Shield className="h-4 w-4 mr-2" />
              Portfolio Protection
            </TabsTrigger>
            <TabsTrigger value="contract" className="text-sm">
              <ScanSearch className="h-4 w-4 mr-2" />
              Contract Scanner
            </TabsTrigger>
            <TabsTrigger value="sentiment" className="text-sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              Sentiment Analysis
            </TabsTrigger>
            <TabsTrigger value="ml" className="text-sm">
              <Brain className="h-4 w-4 mr-2" />
              ML Risk Scorer
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              <button
                onClick={() => setActiveTab("portfolio")}
                className="border border-border rounded-xl p-8 bg-card/50 backdrop-blur-sm hover:border-emerald-500/50 transition-all text-left hover:scale-[1.02]"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <Shield className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">Portfolio Protection Mode</h3>
                      <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Automatic monitoring of your entire wallet holdings
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground/80 leading-relaxed">
                  Real-time surveillance of all tokens in your portfolio with instant alerts for suspicious activity,
                  rug pull warnings, and manipulation attempts across your holdings.
                </p>
              </button>

              <button
                onClick={() => setActiveTab("contract")}
                className="border border-border rounded-xl p-8 bg-card/50 backdrop-blur-sm hover:border-blue-500/50 transition-all text-left hover:scale-[1.02]"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <ScanSearch className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">Smart Contract Audit Scanner</h3>
                      <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Automated smart contract vulnerability detection
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground/80 leading-relaxed">
                  Deep analysis of smart contract code to identify security vulnerabilities, hidden backdoors, and
                  malicious functions before you invest.
                </p>
              </button>

              <button
                onClick={() => setActiveTab("sentiment")}
                className="border border-border rounded-xl p-8 bg-card/50 backdrop-blur-sm hover:border-purple-500/50 transition-all text-left hover:scale-[1.02]"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <TrendingUp className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">Social Sentiment Analysis</h3>
                      <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/20">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">Twitter/X sentiment tracking for tokens</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground/80 leading-relaxed">
                  AI-powered sentiment analysis from Twitter/X to gauge community perception, detect coordinated pump
                  schemes, and identify emerging trends using blockchain data and social signals.
                </p>
              </button>

              <button
                onClick={() => setActiveTab("ml")}
                className="border border-border rounded-xl p-8 bg-card/50 backdrop-blur-sm hover:border-cyan-500/50 transition-all text-left hover:scale-[1.02]"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                    <Brain className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">Machine Learning Models</h3>
                      <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Custom ML models trained on historical manipulation patterns
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground/80 leading-relaxed">
                  Proprietary machine learning algorithms trained on thousands of past scams and rug pulls to predict
                  and prevent future threats with increasing accuracy.
                </p>
              </button>
            </div>

            <div className="max-w-3xl mx-auto border border-emerald-500/30 rounded-xl p-8 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 backdrop-blur-sm text-center">
              <h2 className="text-2xl font-bold mb-4 text-emerald-400">Phase 2 is Now Live!</h2>
              <p className="text-muted-foreground mb-2">
                All Advanced Analytics & AI features are now fully operational and ready to protect your investments
              </p>
              <p className="text-sm text-muted-foreground/70">
                Click on any feature card above or use the tabs to access the tools. Each tool provides real-time
                analysis using live blockchain data and AI-powered insights.
              </p>
            </div>
          </TabsContent>

          {/* Portfolio Protection Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            <div className="max-w-6xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Portfolio Protection Mode</h2>
                <p className="text-muted-foreground">
                  Monitor all tokens in your wallet with real-time threat detection and comprehensive security analysis
                  for each holding.
                </p>
              </div>
              <PortfolioMonitor />
            </div>
          </TabsContent>

          {/* Contract Scanner Tab */}
          <TabsContent value="contract" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Smart Contract Audit Scanner</h2>
                <p className="text-muted-foreground">
                  Comprehensive security analysis of Solana smart contracts including liquidity checks, ownership
                  verification, and honeypot detection.
                </p>
              </div>
              <ContractScanner />
            </div>
          </TabsContent>

          {/* Sentiment Analysis Tab */}
          <TabsContent value="sentiment" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Social Sentiment Analysis</h2>
                <p className="text-muted-foreground">
                  Track community sentiment on social metrics with AI-powered analysis to detect pump schemes and gauge
                  market mood.
                </p>
              </div>
              <SentimentTracker />
            </div>
          </TabsContent>

          {/* ML Risk Scorer Tab */}
          <TabsContent value="ml" className="space-y-6">
            <div>
              <div className="mb-6 max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-2">Machine Learning Risk Scorer</h2>
                <p className="text-muted-foreground">
                  Advanced AI models trained on 10,000+ historical scams provide predictive risk scores and pattern
                  matching against known manipulation tactics.
                </p>
              </div>
              <MLRiskScorer />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  )
}
