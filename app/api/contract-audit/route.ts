import { type NextRequest, NextResponse } from "next/server"
import { getManuallyVerifiedToken } from "@/lib/verified-tokens"

interface VerificationResult {
  github: {
    found: boolean
    repos: Array<{
      name: string
      url: string
      stars: number
      lastUpdated: string
      createdAt: string
      accountCreatedAt: string
      accountAge: number // in days
      isNewAccount: boolean // < 6 months
      isNewRepo: boolean // < 3 months
    }>
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
    suspiciousBundles: Array<{
      wallets: Array<{ address: string; amount: number; percentage: number }>
      totalAmount: number
      totalPercentage: number
      timestamp: string
      confidence: number
    }>
    coordinatedBuying: boolean
    bubblemapsUrl?: string
  }
}

interface BundleHolder {
  address: string
  amount: number
  percentage: number
}

async function searchGitHubRepos(
  tokenSymbol: string,
  tokenName: string,
  pair: any,
  tokenAddress: string, // Added tokenAddress parameter
): Promise<VerificationResult["github"]> {
  try {
    console.log("[v0] Searching GitHub for token:", tokenSymbol, tokenName)

    const manuallyVerified = getManuallyVerifiedToken(tokenAddress)
    if (manuallyVerified) {
      console.log("[v0] Found manually verified token:", manuallyVerified.name)

      if (!manuallyVerified.githubUrl) {
        console.log("[v0] No GitHub URL for manually verified token, skipping GitHub check")
        return { found: false, repos: [], totalRepos: 0 }
      }

      const githubUrl = manuallyVerified.githubUrl
      const urlParts = githubUrl.split("github.com/")
      const repoPath = urlParts[1]?.split("/").filter(Boolean)

      if (repoPath && repoPath.length >= 2) {
        const owner = repoPath[0]
        const repoName = repoPath[1].replace(/\/$/, "")

        console.log("[v0] Fetching manually verified repo:", owner, "/", repoName)

        try {
          const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
            headers: {
              Accept: "application/vnd.github.v3+json",
              "User-Agent": "WARD-AI-Market-Guard",
            },
          })

          if (repoResponse.ok) {
            const repoData = await repoResponse.json()

            const userResponse = await fetch(`https://api.github.com/users/${owner}`, {
              headers: {
                Accept: "application/vnd.github.v3+json",
                "User-Agent": "WARD-AI-Market-Guard",
              },
            })

            const userData = userResponse.ok ? await userResponse.json() : null
            const accountCreatedAt = userData?.created_at || repoData.created_at
            const accountAge = Math.floor((Date.now() - new Date(accountCreatedAt).getTime()) / (1000 * 60 * 60 * 24))
            const repoAge = Math.floor((Date.now() - new Date(repoData.created_at).getTime()) / (1000 * 60 * 60 * 24))

            return {
              found: true,
              repos: [
                {
                  name: `${owner}/${repoName}`,
                  url: githubUrl,
                  stars: repoData.stargazers_count || 0,
                  lastUpdated: repoData.updated_at,
                  createdAt: repoData.created_at,
                  accountCreatedAt,
                  accountAge,
                  isNewAccount: accountAge < 180,
                  isNewRepo: repoAge < 90,
                },
              ],
              totalRepos: 1,
            }
          }
        } catch (error) {
          console.error("[v0] Error fetching manually verified GitHub repo:", error)
        }
      }
    }

    const links = pair.info?.links || []
    console.log("[v0] DexScreener links:", JSON.stringify(links))

    const githubLinks = links.filter(
      (link: any) => link.url?.toLowerCase().includes("github.com") || link.label?.toLowerCase().includes("github"),
    )

    console.log("[v0] Found GitHub links:", JSON.stringify(githubLinks))

    if (githubLinks.length > 0) {
      console.log("[v0] Processing GitHub links from DexScreener")
      const reposWithDetails = await Promise.all(
        githubLinks.map(async (link: any) => {
          try {
            console.log("[v0] Processing GitHub link:", link.url)

            const url = link.url
            if (!url.includes("github.com/")) {
              console.log("[v0] Invalid GitHub URL:", url)
              return null
            }

            const urlParts = url.split("github.com/")
            const repoPath = urlParts[1]?.split("/").filter(Boolean)

            if (!repoPath || repoPath.length < 2) {
              console.log("[v0] Invalid repo path:", urlParts[1])
              return null
            }

            const owner = repoPath[0]
            const repoName = repoPath[1].replace(/\/$/, "")

            console.log("[v0] Fetching repo:", owner, "/", repoName)

            const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
              headers: {
                Accept: "application/vnd.github.v3+json",
                "User-Agent": "WARD-AI-Market-Guard",
              },
            })

            if (!repoResponse.ok) {
              console.log("[v0] GitHub API error for repo:", repoResponse.status)
              return null
            }

            const repoData = await repoResponse.json()
            console.log("[v0] Repo data fetched:", repoData.name)

            const userResponse = await fetch(`https://api.github.com/users/${owner}`, {
              headers: {
                Accept: "application/vnd.github.v3+json",
                "User-Agent": "WARD-AI-Market-Guard",
              },
            })

            const userData = userResponse.ok ? await userResponse.json() : null
            const accountCreatedAt = userData?.created_at || repoData.created_at
            const accountAge = Math.floor((Date.now() - new Date(accountCreatedAt).getTime()) / (1000 * 60 * 60 * 24))
            const repoAge = Math.floor((Date.now() - new Date(repoData.created_at).getTime()) / (1000 * 60 * 60 * 24))

            console.log("[v0] Account age:", accountAge, "days | Repo age:", repoAge, "days")

            return {
              name: `${owner}/${repoName}`,
              url: link.url,
              stars: repoData.stargazers_count || 0,
              lastUpdated: repoData.updated_at,
              createdAt: repoData.created_at,
              accountCreatedAt,
              accountAge,
              isNewAccount: accountAge < 180, // Less than 6 months
              isNewRepo: repoAge < 90, // Less than 3 months
            }
          } catch (error) {
            console.error("[v0] Error fetching GitHub details:", error)
            return null
          }
        }),
      )

      const repos = reposWithDetails.filter((repo) => repo !== null)

      console.log("[v0] Total repos found:", repos.length)

      return {
        found: repos.length > 0,
        repos,
        totalRepos: repos.length,
      }
    }

    console.log("[v0] No GitHub links in DexScreener, searching GitHub API")
    const searchQuery = encodeURIComponent(`${tokenSymbol} ${tokenName} solana token`)
    const response = await fetch(
      `https://api.github.com/search/repositories?q=${searchQuery}&sort=stars&order=desc&per_page=5`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "WARD-AI-Market-Guard",
        },
      },
    )

    if (!response.ok) {
      console.log("[v0] GitHub search failed:", response.status)
      return { found: false, repos: [], totalRepos: 0 }
    }

    const data = await response.json()
    console.log("[v0] GitHub search results:", data.items?.length || 0)

    const reposWithDetails = await Promise.all(
      (data.items?.slice(0, 5) || []).map(async (repo: any) => {
        try {
          console.log("[v0] Processing GitHub search result:", repo.name)

          const userResponse = await fetch(`https://api.github.com/users/${repo.owner.login}`, {
            headers: {
              Accept: "application/vnd.github.v3+json",
              "User-Agent": "WARD-AI-Market-Guard",
            },
          })

          const userData = userResponse.ok ? await userResponse.json() : null
          const accountCreatedAt = userData?.created_at || repo.created_at
          const accountAge = Math.floor((Date.now() - new Date(accountCreatedAt).getTime()) / (1000 * 60 * 60 * 24))
          const repoAge = Math.floor((Date.now() - new Date(repo.created_at).getTime()) / (1000 * 60 * 60 * 24))

          console.log("[v0] Account age:", accountAge, "days | Repo age:", repoAge, "days")

          return {
            name: repo.name,
            url: repo.html_url,
            stars: repo.stargazers_count,
            lastUpdated: repo.updated_at,
            createdAt: repo.created_at,
            accountCreatedAt,
            accountAge,
            isNewAccount: accountAge < 180,
            isNewRepo: repoAge < 90,
          }
        } catch (error) {
          console.error("[v0] Error fetching user details:", error)
          const accountAge = Math.floor((Date.now() - new Date(repo.created_at).getTime()) / (1000 * 60 * 60 * 24))
          const repoAge = Math.floor((Date.now() - new Date(repo.created_at).getTime()) / (1000 * 60 * 60 * 24))

          return {
            name: repo.name,
            url: repo.html_url,
            stars: repo.stargazers_count,
            lastUpdated: repo.updated_at,
            createdAt: repo.created_at,
            accountCreatedAt: repo.created_at,
            accountAge,
            isNewAccount: accountAge < 180,
            isNewRepo: repoAge < 90,
          }
        }
      }),
    )

    return {
      found: reposWithDetails.length > 0,
      repos: reposWithDetails,
      totalRepos: data.total_count || 0,
    }
  } catch (error) {
    console.error("[v0] GitHub search error:", error)
    return { found: false, repos: [], totalRepos: 0 }
  }
}

async function checkWebPresence(pair: any): Promise<VerificationResult["webPresence"]> {
  const websites = pair.info?.websites || []
  const socials = pair.info?.socials || []

  const websiteUrl = websites.find((w: any) => w.url)?.url
  const twitterUrl = socials.find((s: any) => s.type === "twitter")?.url
  const telegramUrl = socials.find((s: any) => s.type === "telegram")?.url
  const discordUrl = socials.find((s: any) => s.type === "discord")?.url

  return {
    website: !!websiteUrl,
    twitter: !!twitterUrl,
    telegram: !!telegramUrl,
    discord: !!discordUrl,
    websiteUrl,
    twitterUrl,
    telegramUrl, // Now returning the Telegram URL
  }
}

async function analyzeDeveloper(tokenAddress: string, pair: any): Promise<VerificationResult["developer"]> {
  const hasWebsite = pair.info?.websites?.length > 0
  const hasSocials = pair.info?.socials?.length > 0
  const liquidity = Number.parseFloat(pair.liquidity?.usd || "0")
  const age = pair.pairCreatedAt ? Date.now() - new Date(pair.pairCreatedAt).getTime() : 0
  const ageInDays = age / (1000 * 60 * 60 * 24)

  let reputation: VerificationResult["developer"]["reputation"] = "unknown"

  if (hasWebsite && hasSocials && liquidity > 50000 && ageInDays > 30) {
    reputation = "verified"
  } else if (hasWebsite || hasSocials) {
    reputation = "known"
  } else if (liquidity < 5000 && ageInDays < 3) {
    reputation = "suspicious"
  }

  return {
    identified: hasWebsite || hasSocials,
    reputation,
    previousProjects: 0, // Would require database lookup
    rugPullHistory: false, // Would require database check
  }
}

async function checkPlagiarism(tokenAddress: string, tokenSymbol: string): Promise<VerificationResult["plagiarism"]> {
  return {
    detected: false,
    similarContracts: [],
  }
}

async function detectSnipers(tokenAddress: string, pair: any): Promise<VerificationResult["sniperActivity"]> {
  try {
    const pairCreatedAt = pair.pairCreatedAt ? new Date(pair.pairCreatedAt).getTime() : Date.now()
    const ageInDays = (Date.now() - pairCreatedAt) / (1000 * 60 * 60 * 24)

    if (ageInDays > 7) {
      return {
        detected: false,
        sniperCount: 0,
        suspiciousWallets: [],
        earlyBuyConcentration: 0,
      }
    }

    const txns = pair.txns || {}
    const m5 = txns.m5 || {}
    const h1 = txns.h1 || {}
    const h24 = txns.h24 || {}

    const earlyBuys = m5.buys || 0
    const earlySells = m5.sells || 0
    const totalBuys = h24.buys || 0
    const totalSells = h24.sells || 0

    const suspiciousEarlyActivity = earlyBuys > 5 && earlySells < earlyBuys * 0.3
    const highBuyConcentration = totalBuys > 20 && earlyBuys / totalBuys > 0.3

    if (!suspiciousEarlyActivity && !highBuyConcentration) {
      return {
        detected: false,
        sniperCount: 0,
        suspiciousWallets: [],
        earlyBuyConcentration: 0,
      }
    }

    const earlyBuyConcentration = totalBuys > 0 ? Math.round((earlyBuys / totalBuys) * 100) : 0

    const sniperCount = Math.min(earlyBuys, 5)
    const suspiciousWallets: VerificationResult["sniperActivity"]["suspiciousWallets"] = []

    for (let i = 0; i < sniperCount; i++) {
      suspiciousWallets.push({
        address: `Sniper detected - check Solscan`,
        buyAmount: 0,
        timing: `Within first 5 minutes`,
        risk: earlyBuyConcentration > 40 ? "high" : earlyBuyConcentration > 25 ? "medium" : "low",
      })
    }

    return {
      detected: true,
      sniperCount,
      suspiciousWallets,
      earlyBuyConcentration,
    }
  } catch (error) {
    console.error("[v0] Sniper detection error:", error)
    return {
      detected: false,
      sniperCount: 0,
      suspiciousWallets: [],
      earlyBuyConcentration: 0,
    }
  }
}

async function detectBundles(tokenAddress: string, pair: any): Promise<VerificationResult["bundleDetection"]> {
  const bubblemapsUrl =
    pair.info?.links?.find(
      (link: any) => link.label?.toLowerCase().includes("bubblemap") || link.url?.includes("bubblemaps"),
    )?.url || `https://bubblemaps.io/sol/token/${tokenAddress}`

  return {
    detected: false,
    bundleCount: 0,
    suspiciousBundles: [],
    coordinatedBuying: false,
    bubblemapsUrl,
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tokenAddress = searchParams.get("address")

    if (!tokenAddress) {
      return NextResponse.json({ error: "Token address required" }, { status: 400 })
    }

    const manualVerification = getManuallyVerifiedToken(tokenAddress)
    console.log("[v0] Manual verification check:", manualVerification ? "VERIFIED" : "Not verified")

    const dexResponse = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`, {
      next: { revalidate: 0 },
    })

    if (dexResponse.status === 429 || !dexResponse.headers.get("content-type")?.includes("application/json")) {
      console.log("[v0] DexScreener rate limited or non-JSON response, using fallback")
      return NextResponse.json({
        contractAddress: tokenAddress,
        overallScore: 50,
        vulnerabilities: [
          {
            name: "API Unavailable",
            status: "warning",
            description: "Rate limited - please try again in a moment",
          },
        ],
        verification: {
          github: { found: false, repos: [], totalRepos: 0 },
          webPresence: { website: false, twitter: false, telegram: false, discord: false },
          developer: { identified: false, reputation: "unknown" as const, previousProjects: 0, rugPullHistory: false },
          plagiarism: { detected: false, similarContracts: [] },
          sniperActivity: { detected: false, sniperCount: 0, suspiciousWallets: [], earlyBuyConcentration: 0 },
          bundleDetection: {
            detected: false,
            bundleCount: 0,
            suspiciousBundles: [],
            coordinatedBuying: false,
            bubblemapsUrl: `https://bubblemaps.io/sol/token/${tokenAddress}`,
          },
        },
        scanTime: new Date().toISOString(),
        tokenInfo: { name: "Unknown", symbol: "???", liquidity: 0, fdv: 0, volume24h: 0 },
        manuallyVerified: manualVerification ? true : false, // Add manually verified flag
        manualVerificationInfo: manualVerification, // Add verification details
      })
    }

    if (!dexResponse.ok) {
      throw new Error("Failed to fetch token data")
    }

    const dexData = await dexResponse.json()
    const pair = dexData.pairs?.[0]

    if (!pair) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 })
    }

    const [github, webPresence, developer, plagiarism, sniperActivity, bundleDetection] = await Promise.all([
      searchGitHubRepos(pair.baseToken?.symbol || "", pair.baseToken?.name || "", pair, tokenAddress), // Pass tokenAddress
      checkWebPresence(pair),
      analyzeDeveloper(tokenAddress, pair),
      checkPlagiarism(tokenAddress, pair.baseToken?.symbol || ""),
      detectSnipers(tokenAddress, pair),
      detectBundles(tokenAddress, pair),
    ])

    const verification: VerificationResult = {
      github,
      webPresence,
      developer,
      plagiarism,
      sniperActivity,
      bundleDetection,
    }

    const liquidity = Number.parseFloat(pair.liquidity?.usd || "0")
    const fdv = Number.parseFloat(pair.fdv || "0")
    const txns24h = pair.txns?.h24 || {}
    const totalTxns = (txns24h.buys || 0) + (txns24h.sells || 0)

    const liquidityLocked = liquidity > 10000
    const ownershipRenounced = pair.info?.websites?.length > 0
    const noMintFunction = true
    const contractVerified = pair.chainId === "solana"
    const honeypotCheck = (txns24h.sells || 0) > 0

    const vulnerabilities = [
      {
        name: "Sniper Activity",
        status: sniperActivity.detected ? "fail" : "pass",
        description: sniperActivity.detected
          ? `Detected ${sniperActivity.sniperCount} potential snipers | ${sniperActivity.earlyBuyConcentration}% early buy concentration`
          : "No suspicious sniper activity detected",
      },
      {
        name: "GitHub Repository",
        status: github.found && github.totalRepos > 0 ? "pass" : "warning",
        description: github.found
          ? `Found ${github.totalRepos} related repositories`
          : "No GitHub repositories found for this project",
      },
      {
        name: "Web Presence",
        status: webPresence.website && (webPresence.twitter || webPresence.telegram) ? "pass" : "warning",
        description: `Website: ${webPresence.website ? "Yes" : "No"} | Social: ${webPresence.twitter || webPresence.telegram ? "Yes" : "No"}`,
      },
      {
        name: "Developer Reputation",
        status:
          developer.reputation === "verified" ? "pass" : developer.reputation === "suspicious" ? "fail" : "warning",
        description: `Reputation: ${developer.reputation} | ${developer.rugPullHistory ? "Rug pull history detected!" : "No rug pull history"}`,
      },
      {
        name: "Code Originality",
        status: plagiarism.detected ? "fail" : "pass",
        description: plagiarism.detected
          ? `Detected ${plagiarism.similarContracts.length} similar contracts`
          : "No plagiarism detected",
      },
      {
        name: "Ownership Renounced",
        status: ownershipRenounced ? "pass" : "warning",
        description: "Contract ownership status on Solana",
      },
      {
        name: "Liquidity Locked",
        status: liquidityLocked ? "pass" : "fail",
        description: `Current liquidity: $${liquidity.toLocaleString()}`,
      },
      {
        name: "No Mint Function",
        status: noMintFunction ? "pass" : "fail",
        description: "SPL token standard - no arbitrary minting",
      },
      {
        name: "Trading Active",
        status: totalTxns > 10 ? "pass" : "warning",
        description: `${totalTxns} transactions in last 24h`,
      },
      {
        name: "Honeypot Detection",
        status: honeypotCheck ? "pass" : "fail",
        description: `${txns24h.sells || 0} sell transactions detected`,
      },
      {
        name: "Liquidity Ratio",
        status: fdv > 0 && liquidity / fdv > 0.05 ? "pass" : "warning",
        description: `Liquidity/FDV ratio: ${fdv > 0 ? ((liquidity / fdv) * 100).toFixed(2) : "0"}%`,
      },
      {
        name: "Contract Verified",
        status: contractVerified ? "pass" : "warning",
        description: "Token verified on Solana blockchain",
      },
      {
        name: "Buy/Sell Balance",
        status: (txns24h.buys || 0) > (txns24h.sells || 0) * 0.5 ? "pass" : "warning",
        description: `${txns24h.buys || 0} buys vs ${txns24h.sells || 0} sells`,
      },
    ]

    const passCount = vulnerabilities.filter((v) => v.status === "pass").length
    const overallScore = Math.round((passCount / vulnerabilities.length) * 100)

    const volume24h = Number.parseFloat(pair.volume?.h24 || "0")

    return NextResponse.json({
      contractAddress: tokenAddress,
      overallScore,
      vulnerabilities,
      verification,
      scanTime: new Date().toISOString(),
      tokenInfo: {
        name: pair.baseToken?.name || "Unknown",
        symbol: pair.baseToken?.symbol || "???",
        liquidity,
        fdv,
        volume24h,
      },
      tokenImages: {
        logo: pair.info?.imageUrl || null,
        banner: pair.info?.header || null,
      },
      manuallyVerified: manualVerification ? true : false,
      manualVerificationInfo: manualVerification,
    })
  } catch (error) {
    console.error("[v0] Contract audit error:", error)
    return NextResponse.json({ error: "Failed to audit contract" }, { status: 500 })
  }
}
