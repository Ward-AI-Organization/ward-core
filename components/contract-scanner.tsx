"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  FileCode,
  Github,
  Globe,
  User,
  Copy,
  ExternalLink,
  CheckCircle2,
  Activity,
  TrendingUp,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface VulnerabilityCheck {
  name: string
  status: "pass" | "warning" | "fail"
  description: string
}

interface GitHubRepo {
  name: string
  url: string
  stars: number
  lastUpdated: string
  createdAt: string
  accountCreatedAt: string
  accountAge: number
  isNewAccount: boolean
  isNewRepo: boolean
}

interface Wallet {
  address: string
  amount: number
  percentage?: number
}

interface SuspiciousBundle {
  wallets: Wallet[]
  totalAmount: number
  timestamp: string
  confidence: number
  totalPercentage?: number
}

interface VerificationData {
  github: {
    found: boolean
    repos: GitHubRepo[]
    totalRepos: number
  }
  webPresence: {
    website: boolean
    twitter: boolean
    telegram: boolean
    discord: boolean
    websiteUrl?: string
    twitterUrl?: string
    telegramUrl?: string
  }
  developer: {
    identified: boolean
    name?: string
    reputation: "unknown" | "known" | "verified" | "suspicious"
    previousProjects: number
    rugPullHistory: boolean
    creatorPlatform?: string // Add platform
    creatorAddress?: string // Add creator address
  }
  plagiarism: {
    detected: boolean
    similarContracts: Array<{
      address: string
      similarity: number
      name?: string
    }>
  }
  sniperActivity: {
    detected: boolean
    sniperCount: number
    suspiciousWallets: Array<{
      address: string
      buyAmount: number
      timing: string
      risk: "low" | "medium" | "high"
    }>
    earlyBuyConcentration: number
  }
  bundleDetection: {
    detected: boolean
    bundleCount: number
    suspiciousBundles: SuspiciousBundle[]
    coordinatedBuying: boolean
    bubblemapsUrl?: string // Added bubblemapsUrl field
  }
}

interface ScanResult {
  contractAddress: string
  overallScore: number
  vulnerabilities: VulnerabilityCheck[]
  verification: VerificationData
  scanTime: Date
  tokenImages?: {
    logo: string | null
    banner: string | null
  }
  manuallyVerified?: boolean
  manualVerificationInfo?: {
    address: string
    name: string
    symbol: string
    githubUrl?: string
    verifiedDate: string
    notes?: string
    category?: string
  }
}

interface ContractScannerProps {
  tokenAddress?: string
  tokenSymbol?: string
}

export function ContractScanner({
  tokenAddress: propTokenAddress,
  tokenSymbol: propTokenSymbol,
}: ContractScannerProps = {}) {
  const [contractAddress, setContractAddress] = useState(propTokenAddress || "")
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [scanProgress, setScanProgress] = useState(0)

  const isWardAIToken = (propTokenAddress || contractAddress) === "HHe76F2iWTj8h9RzrEmMZc3YrW1mXmAkwZ3iMszTpump"

  useEffect(() => {
    if (propTokenAddress) {
      setContractAddress(propTokenAddress)
      performScan(propTokenAddress)
    }
  }, [propTokenAddress])

  const performScan = async (address?: string) => {
    const scanAddress = address || contractAddress
    if (!scanAddress) return

    setScanning(true)
    setScanProgress(0)
    setScanResult(null)

    try {
      const response = await fetch(`/api/contract-audit?address=${scanAddress}`)

      if (!response.ok) {
        throw new Error("Failed to audit contract")
      }

      // Simulate progress for UX
      const progressInterval = setInterval(() => {
        setScanProgress((prev) => Math.min(prev + 15, 95))
      }, 200)

      const data = await response.json()

      clearInterval(progressInterval)
      setScanProgress(100)

      setScanResult({
        contractAddress: data.contractAddress,
        overallScore: data.overallScore,
        vulnerabilities: data.vulnerabilities,
        verification: data.verification,
        scanTime: new Date(data.scanTime),
        manuallyVerified: data.manuallyVerified,
        manualVerificationInfo: data.manualVerificationInfo,
        tokenImages: data.tokenImages,
      })
    } catch (error) {
      console.error("[v0] Scan error:", error)
      alert("Failed to scan contract. Please try again.")
    } finally {
      setScanning(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "fail":
        return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-500 text-white">Safe</Badge>
    if (score >= 60) return <Badge className="bg-yellow-500 text-white">Caution</Badge>
    return <Badge className="bg-red-500 text-white">High Risk</Badge>
  }

  const getReputationColor = (reputation: string) => {
    switch (reputation) {
      case "verified":
        return "text-green-500"
      case "known":
        return "text-blue-500"
      case "suspicious":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      {!propTokenAddress && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <FileCode className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <CardTitle>Smart Contract Audit Scanner</CardTitle>
                <CardDescription>
                  Automated vulnerability detection with GitHub, web presence, and developer verification
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter contract address..."
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                disabled={scanning}
                className="flex-1"
              />
              <Button onClick={() => performScan()} disabled={!contractAddress || scanning}>
                <Search className="h-4 w-4 mr-2" />
                {scanning ? "Scanning..." : "Scan Contract"}
              </Button>
            </div>

            {scanning && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Analyzing smart contract...</span>
                  <span className="font-medium">{Math.round(scanProgress)}%</span>
                </div>
                <Progress value={scanProgress} />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {propTokenAddress && scanning && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Analyzing smart contract for ${propTokenSymbol}...</span>
            <span className="font-medium">{Math.round(scanProgress)}%</span>
          </div>
          <Progress value={scanProgress} />
        </div>
      )}

      {scanResult && (
        <>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-500/5 border border-purple-500/20 text-sm">
            <AlertTriangle className="h-4 w-4 text-purple-500 flex-shrink-0" />
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Note:</span> Manual verification will be available soon if
              our AI incorrectly identified team information.
            </p>
          </div>

          {scanResult.tokenImages?.banner && (
            <div className="relative w-full aspect-[3/1] rounded-lg overflow-hidden bg-muted">
              <img
                src={scanResult.tokenImages.banner || "/placeholder.svg"}
                alt="Token Banner"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-start gap-4">
                {scanResult.tokenImages?.logo && (
                  <img
                    src={scanResult.tokenImages.logo || "/placeholder.svg"}
                    alt="Token Logo"
                    className="w-16 h-16 rounded-full"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">{isWardAIToken ? "Ward AI (WARD)" : "Token Analysis"}</CardTitle>
                      <CardDescription className="mt-1 font-mono text-xs">{scanResult.contractAddress}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Risk Score</div>
                      <div className="text-4xl font-bold">{scanResult.overallScore}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 gap-6">
            {/* GitHub Verification */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Github className="h-5 w-5" />
                  <CardTitle className="text-base">GitHub Repositories</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {isWardAIToken ? (
                  <div className="space-y-3">
                    <p className="text-sm text-green-500 font-medium flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Official Ward AI Team Repository
                    </p>
                    <a
                      href="https://github.com/Ward-AI-Organization"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg border border-blue-500/30 bg-blue-500/5 hover:border-blue-500/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">Ward AI Organization</p>
                        <p className="text-xs text-muted-foreground">Official GitHub Organization</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-blue-500" />
                    </a>
                  </div>
                ) : scanResult.verification.github.found ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Found {scanResult.verification.github.totalRepos} related repositories
                    </p>
                    {scanResult.verification.github.repos.map((repo, idx) => (
                      <a
                        key={idx}
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-lg border hover:border-primary/40 transition-colors gap-2"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{repo.name}</p>
                          <p className="text-xs text-muted-foreground">{repo.stars} stars</p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No GitHub repositories found</p>
                )}
              </CardContent>
            </Card>

            {/* Web Presence */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  <CardTitle className="text-base">Web Presence</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Website</span>
                    <div className="flex items-center gap-2">
                      {scanResult.verification.webPresence.website ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {scanResult.verification.webPresence.websiteUrl && (
                            <a
                              href={scanResult.verification.webPresence.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-500 hover:underline"
                            >
                              Visit
                            </a>
                          )}
                        </>
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Twitter</span>
                    <div className="flex items-center gap-2">
                      {scanResult.verification.webPresence.twitter ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {scanResult.verification.webPresence.twitterUrl && (
                            <a
                              href={scanResult.verification.webPresence.twitterUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-500 hover:underline"
                            >
                              Visit
                            </a>
                          )}
                        </>
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Telegram</span>
                    <div className="flex items-center gap-2">
                      {scanResult.verification.webPresence.telegram ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {scanResult.verification.webPresence.telegramUrl && (
                            <a
                              href={scanResult.verification.webPresence.telegramUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-500 hover:underline"
                            >
                              Visit
                            </a>
                          )}
                        </>
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Discord</span>
                    {scanResult.verification.webPresence.discord ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Developer Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <CardTitle className="text-base">Developer Info</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {isWardAIToken ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Developer</p>
                      <p className="font-medium text-green-500 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Ward AI Team
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Reputation</p>
                      <p className="font-medium text-green-500 capitalize">Verified Official Team</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Status</p>
                      <p className="text-sm">Fully Identified & Verified</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                      <p className="text-sm text-green-500 font-medium">✓ Clean History - No Rug Pulls</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {scanResult.verification.developer.creatorPlatform &&
                      scanResult.verification.developer.creatorPlatform !== "Unknown" && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Created On</p>
                          <a
                            href={
                              scanResult.verification.developer.creatorPlatform === "pump.fun"
                                ? `https://pump.fun/coin/${contractAddress}`
                                : scanResult.verification.developer.creatorPlatform === "Raydium"
                                  ? "https://raydium.io/"
                                  : scanResult.verification.developer.creatorPlatform === "Meteora"
                                    ? "https://meteora.ag/"
                                    : "#"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-sm text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-2"
                          >
                            {scanResult.verification.developer.creatorPlatform}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Reputation</p>
                      <p
                        className={`font-medium capitalize ${getReputationColor(scanResult.verification.developer.reputation)}`}
                      >
                        {scanResult.verification.developer.reputation}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Status</p>
                      <p className="text-sm">
                        {scanResult.verification.developer.identified ? "Identified" : "Anonymous"}
                      </p>
                    </div>
                    {scanResult.verification.developer.rugPullHistory && (
                      <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="text-sm text-red-500 font-medium">Rug Pull History Detected</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Plagiarism Check */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Copy className="h-5 w-5" />
                  <CardTitle className="text-base">Code Originality</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {scanResult.verification.plagiarism.detected ? (
                  <div className="space-y-2">
                    <p className="text-sm text-red-500 font-medium">
                      Plagiarism detected - {scanResult.verification.plagiarism.similarContracts.length} similar
                      contracts found
                    </p>
                    {scanResult.verification.plagiarism.similarContracts.map((contract, idx) => (
                      <div key={idx} className="p-2 rounded-lg border border-red-500/20 bg-red-500/5">
                        <p className="text-xs font-mono">{contract.address}</p>
                        <p className="text-xs text-muted-foreground">{contract.similarity}% similar</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <p className="text-sm">No plagiarism detected - Original code</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sniper Activity Detection */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  <CardTitle className="text-base">Sniper Activity</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {scanResult.verification.sniperActivity.detected ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="text-sm text-red-500 font-medium">⚠️ Sniper Activity Detected</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {scanResult.verification.sniperActivity.sniperCount} potential sniper
                        {scanResult.verification.sniperActivity.sniperCount > 1 ? "s" : ""} identified based on trading
                        patterns
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Early Buy Concentration</p>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={scanResult.verification.sniperActivity.earlyBuyConcentration}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium">
                          {scanResult.verification.sniperActivity.earlyBuyConcentration}%
                        </span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg border border-orange-500/20 bg-orange-500/5">
                      <p className="text-sm font-medium mb-2">Pattern-Based Detection</p>
                      <p className="text-xs text-muted-foreground mb-3">
                        High concentration of buys detected within the first 5 minutes after launch. This pattern is
                        typical of sniper bot activity.
                      </p>
                      <a
                        href={`https://solscan.io/token/${scanResult.contractAddress}#holders`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-blue-500 hover:underline font-medium"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Manually verify early holders on Solscan
                      </a>
                    </div>
                    <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
                      <p className="font-medium mb-1">💡 How to verify:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Check token holders tab on Solscan</li>
                        <li>Look for wallets with large early positions</li>
                        <li>Review transaction history for suspicious patterns</li>
                        <li>Check if early buyers have already sold</li>
                      </ol>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle className="h-5 w-5" />
                    <p className="text-sm">No sniper activity detected</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bundle Detection */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  <CardTitle className="text-base">Bundle Detection</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      className={`p-3 rounded-lg border ${
                        scanResult.verification.bundleDetection.detected
                          ? "bg-red-500/10 border-red-500/30"
                          : "bg-green-500/10 border-green-500/30"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {scanResult.verification.bundleDetection.detected ? (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                        <p className="text-xs text-muted-foreground">Total Bundles</p>
                      </div>
                      <p
                        className={`text-2xl font-bold ${
                          scanResult.verification.bundleDetection.detected ? "text-red-500" : "text-green-500"
                        }`}
                      >
                        {scanResult.verification.bundleDetection.bundleCount}
                      </p>
                    </div>
                    <div
                      className={`p-3 rounded-lg border ${
                        scanResult.verification.bundleDetection.detected
                          ? "bg-orange-500/10 border-orange-500/30"
                          : "bg-green-500/10 border-green-500/30"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {scanResult.verification.bundleDetection.detected ? (
                          <TrendingUp className="h-4 w-4 text-orange-500" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                        <p className="text-xs text-muted-foreground">Status</p>
                      </div>
                      <p
                        className={`text-2xl font-bold ${
                          scanResult.verification.bundleDetection.detected
                            ? scanResult.verification.bundleDetection.coordinatedBuying
                              ? "text-orange-500"
                              : "text-yellow-500"
                            : "text-green-500"
                        }`}
                      >
                        {scanResult.verification.bundleDetection.detected
                          ? scanResult.verification.bundleDetection.coordinatedBuying
                            ? "High"
                            : "Medium"
                          : "Clean"}
                      </p>
                    </div>
                  </div>

                  {scanResult.verification.bundleDetection.detected &&
                    scanResult.verification.bundleDetection.suspiciousBundles.length > 0 && (
                      <div className="space-y-4">
                        {/* Bundle Activity Visualization */}
                        <div className="p-4 rounded-lg border border-border/50 bg-gradient-to-br from-red-500/5 to-orange-500/5">
                          <p className="text-sm font-medium mb-3">Bundle Activity Distribution</p>
                          <div className="space-y-2">
                            {scanResult.verification.bundleDetection.suspiciousBundles.map((bundle, idx) => {
                              const maxWallets = Math.max(
                                ...scanResult.verification.bundleDetection.suspiciousBundles.map(
                                  (b) => b.wallets.length,
                                ),
                              )
                              const widthPercent = (bundle.wallets.length / maxWallets) * 100

                              return (
                                <div key={idx} className="space-y-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Bundle {idx + 1}</span>
                                    <span className="font-medium">{bundle.wallets.length} wallets</span>
                                  </div>
                                  <div className="h-8 rounded-md bg-muted/30 overflow-hidden relative">
                                    <div
                                      className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-md transition-all duration-500 flex items-center justify-end px-2"
                                      style={{ width: `${widthPercent}%` }}
                                    >
                                      <span className="text-xs font-bold text-white">{bundle.confidence}%</span>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Timeline Visualization */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">Bundle Timeline</p>
                            <Badge variant="outline" className="text-xs">
                              Last {scanResult.verification.bundleDetection.suspiciousBundles.length} transactions
                            </Badge>
                          </div>

                          <div className="relative space-y-3">
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-500 via-orange-500 to-transparent" />

                            {scanResult.verification.bundleDetection.suspiciousBundles.map((bundle, idx) => (
                              <div key={idx} className="relative pl-10">
                                <div className="absolute left-2.5 top-3 w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-500/20 animate-pulse" />
                                <div className="p-4 rounded-lg border border-border/50 bg-card/50 hover:border-red-500/30 transition-colors">
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                      <p className="text-xs text-muted-foreground mb-1">
                                        {new Date(bundle.timestamp).toLocaleString()}
                                      </p>
                                      <div className="flex items-center gap-2">
                                        <Badge className="text-xs bg-red-500/10 text-red-500 border-red-500/30">
                                          Jito Bundle
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                          {bundle.confidence}% confidence
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <User className="h-3 w-3" />
                                      <span>
                                        {bundle.wallets.length} wallet{bundle.wallets.length !== 1 ? "s" : ""}{" "}
                                        participating
                                      </span>
                                    </div>

                                    {/* Wallet Participation Visual */}
                                    <div className="flex items-center gap-1 flex-wrap">
                                      {bundle.wallets.slice(0, 15).map((wallet, walletIdx) => (
                                        <div
                                          key={walletIdx}
                                          className="h-2 w-2 rounded-full bg-red-500 hover:scale-150 transition-transform cursor-pointer"
                                          title={`${wallet.address.slice(0, 8)}...${wallet.address.slice(-8)}`}
                                        />
                                      ))}
                                      {bundle.wallets.length > 15 && (
                                        <span className="text-xs text-muted-foreground ml-1">
                                          +{bundle.wallets.length - 15} more
                                        </span>
                                      )}
                                    </div>

                                    {/* Show sample wallet addresses */}
                                    {bundle.wallets.slice(0, 3).map((wallet, walletIdx) => (
                                      <a
                                        key={walletIdx}
                                        href={`https://solscan.io/account/${wallet.address}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 p-2 rounded bg-muted/50 hover:bg-muted transition-colors text-xs font-mono group"
                                      >
                                        <span className="truncate flex-1">{wallet.address}</span>
                                        <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                                      </a>
                                    ))}

                                    {bundle.wallets.length > 3 && (
                                      <p className="text-xs text-muted-foreground text-center">
                                        +{bundle.wallets.length - 3} more wallets
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {scanResult.verification.bundleDetection.coordinatedBuying && (
                            <div className="flex items-start gap-3 p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
                              <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm text-orange-500 font-medium mb-1">
                                  Coordinated Buying Pattern Detected
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Multiple Jito bundles suggest organized wallet activity. This may indicate market
                                  manipulation or coordinated buying behavior.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  {scanResult.verification.bundleDetection.bubblemapsUrl && (
                    <a
                      href={scanResult.verification.bundleDetection.bubblemapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 rounded-lg border border-purple-500/30 bg-purple-500/5 hover:border-purple-500/50 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 text-purple-500" />
                      <span className="text-sm text-purple-500 font-medium">View Holder Map on Bubblemaps</span>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Security Checks */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Security Checks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                  {scanResult.vulnerabilities.map((check, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/40 transition-colors"
                    >
                      <div className="mt-0.5">{getStatusIcon(check.status)}</div>
                      <div className="flex-1">
                        <p className="font-medium mb-1">{check.name}</p>
                        <p className="text-sm text-muted-foreground">{check.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
