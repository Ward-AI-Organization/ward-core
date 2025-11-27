"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Clock,
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
    telegramUrl?: string // Added telegramUrl to type definition
  }
  developer: {
    identified: boolean
    name?: string
    reputation: "unknown" | "known" | "verified" | "suspicious"
    previousProjects: number
    rugPullHistory: boolean
  }
  plagiarism: {
    detected: boolean
    similarContracts: Array<{
      address: string
      similarity: number
      name?: string
    }>
  }
}

interface ScanResult {
  contractAddress: string
  overallScore: number
  vulnerabilities: VulnerabilityCheck[]
  verification: VerificationData
  scanTime: Date
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
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Audit Results</CardTitle>
              <CardDescription className="font-mono text-xs break-all">{scanResult.contractAddress}</CardDescription>
            </CardHeader>
            <CardContent>
              {isWardAIToken && (
                <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-bold text-lg">Official Ward AI Team Token</p>
                        <Badge className="bg-green-500 text-white">Verified</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        This token is officially owned and managed by the Ward AI team. All contract details have been
                        verified.
                      </p>
                      <a
                        href="https://github.com/Ward-AI-Organization"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-blue-500 hover:underline font-medium"
                      >
                        <Github className="h-4 w-4" />
                        View Ward AI Organization on GitHub
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Security Score</p>
                  <div className="flex items-center gap-3">
                    <p className={`text-4xl font-bold ${getScoreColor(scanResult.overallScore)}`}>
                      {scanResult.overallScore}/100
                    </p>
                    {getScoreBadge(scanResult.overallScore)}
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p>Scanned at</p>
                  <p>{scanResult.scanTime.toLocaleTimeString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
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
                        className="flex items-center justify-between p-2 rounded-lg border hover:border-primary/50 transition-colors"
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
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <p className="text-sm text-green-500 font-medium">✓ Clean History - No Rug Pulls</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
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
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Security Checks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
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

          {/* Manual Verification Notice */}
          <Card className="bg-purple-500/5 border-purple-500/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Manual Verification Available Soon</p>
                  <p className="text-sm text-muted-foreground">
                    If you believe our AI incorrectly identified team information or other details, manual verification
                    by our team will be available soon. This ensures accuracy and gives projects a chance to verify
                    their legitimacy.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-500/5 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Real-Time Monitoring</p>
                  <p className="text-sm text-muted-foreground">
                    This contract will be added to your monitoring list. You'll receive instant alerts if any suspicious
                    changes are detected.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
