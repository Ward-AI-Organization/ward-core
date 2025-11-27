import { type NextRequest, NextResponse } from "next/server"
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js"

function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address)
    return true
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const walletAddress = searchParams.get("address")

  if (!walletAddress) {
    return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
  }

  if (!isValidSolanaAddress(walletAddress)) {
    return NextResponse.json(
      {
        error: "Invalid Solana wallet address. Please check the address and try again.",
      },
      { status: 400 },
    )
  }

  const generateMockHoldings = () => {
    const mockTokens = [
      { symbol: "BONK", name: "Bonk", price: 0.000012, balance: 50000 },
      { symbol: "WIF", name: "dogwifhat", price: 2.34, balance: 10 },
      { symbol: "POPCAT", name: "Popcat", price: 0.87, balance: 25 },
      { symbol: "MEW", name: "cat in a dogs world", price: 0.0045, balance: 500 },
    ]

    return mockTokens.map((token, i) => ({
      address: `mock${i}${walletAddress.slice(-8)}`,
      symbol: token.symbol,
      name: token.name,
      balance: token.balance,
      value: token.balance * token.price,
      price: token.price,
      priceChange24h: (Math.random() - 0.5) * 10,
      riskScore: Math.floor(Math.random() * 30) + 10,
      alerts: [],
      liquidity: Math.random() * 100000 + 50000,
      holders: Math.floor(Math.random() * 10000) + 5000,
      topHolderPercent: Math.random() * 10 + 5,
      devHolding: Math.random() * 5 + 2,
      suspiciousActivity: false,
      decimals: 9,
      hasData: true,
    }))
  }

  const rpcEndpoints = [
    "https://api.mainnet-beta.solana.com",
    "https://solana-api.projectserum.com",
    "https://rpc.ankr.com/solana",
  ]

  let connection: Connection | null = null
  let rpcConnected = false

  for (const endpoint of rpcEndpoints) {
    try {
      connection = new Connection(endpoint, "confirmed")
      await Promise.race([
        connection.getVersion(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Connection timeout")), 2000)),
      ])
      console.log(`[v0] Successfully connected to RPC: ${endpoint}`)
      rpcConnected = true
      break
    } catch (err) {
      console.log(`[v0] RPC endpoint ${endpoint} failed, trying next...`)
      continue
    }
  }

  if (!rpcConnected || !connection) {
    console.log("[v0] All RPCs failed, using mock data")
    const mockHoldings = generateMockHoldings()
    const totalValue = mockHoldings.reduce((sum, h) => sum + h.value, 0)
    return NextResponse.json({
      holdings: mockHoldings,
      totalValue,
      tokensWithValue: mockHoldings.length,
      totalTokens: mockHoldings.length,
      isMockData: true,
    })
  }

  const walletPubkey = new PublicKey(walletAddress)

  const solBalance = await connection.getBalance(walletPubkey)
  const solAmount = solBalance / LAMPORTS_PER_SOL

  let solPrice = 0
  let solPriceChange24h = 0
  try {
    const solPriceResponse = await fetch(
      "https://api.dexscreener.com/latest/dex/tokens/So11111111111111111111111111111111111111112",
      {
        next: { revalidate: 60 },
        headers: { Accept: "application/json" },
      },
    )
    if (solPriceResponse.ok) {
      const solPriceData = await solPriceResponse.json()
      if (solPriceData.pairs && solPriceData.pairs.length > 0) {
        const mainPair = solPriceData.pairs
          .filter((p: any) => p.quoteToken?.symbol === "USDC" || p.quoteToken?.symbol === "USDT")
          .sort((a: any, b: any) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0]

        if (mainPair) {
          solPrice = Number.parseFloat(mainPair.priceUsd || "0")
          solPriceChange24h = Number.parseFloat(mainPair.priceChange?.h24 || "0")
        }
      }
    }
  } catch (error) {
    // Silently use 0 if SOL price fetch fails
  }

  const tokenAccounts = (await Promise.race([
    connection.getParsedTokenAccountsByOwner(walletPubkey, {
      programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
    }),
    new Promise((_, reject) => setTimeout(() => reject(new Error("Token fetch timeout")), 8000)),
  ])) as Awaited<ReturnType<Connection["getParsedTokenAccountsByOwner"]>>

  const tokensWithBalance = tokenAccounts.value
    .map((account) => {
      const parsedInfo = account.account.data.parsed.info
      return {
        mint: parsedInfo.mint,
        balance: parsedInfo.tokenAmount.uiAmount,
        decimals: parsedInfo.tokenAmount.decimals,
      }
    })
    .filter((token) => token.balance && token.balance > 0)
    .slice(0, 30)

  console.log(`[v0] Found ${tokensWithBalance.length} tokens with balance`)

  const holdings = []

  if (solAmount > 0) {
    holdings.push({
      address: "So11111111111111111111111111111111111111112",
      symbol: "SOL",
      name: "Solana",
      balance: solAmount,
      value: solAmount * solPrice,
      price: solPrice,
      priceChange24h: solPriceChange24h,
      riskScore: 0,
      alerts: [],
      liquidity: 0,
      holders: 0,
      topHolderPercent: 0,
      devHolding: 0,
      suspiciousActivity: false,
      decimals: 9,
      hasData: true,
    })
    console.log(`[v0] Added native SOL: ${solAmount.toFixed(4)} SOL ($${(solAmount * solPrice).toFixed(2)})`)
  }

  let successfulPrices = 0

  for (let i = 0; i < tokensWithBalance.length; i++) {
    const token = tokensWithBalance[i]
    let price = 0
    let priceChange24h = 0
    let symbol = "Unknown"
    let name = "Unknown Token"
    let liquidity = 0
    let hasData = false

    try {
      if (i > 0 && i % 5 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      const dexResponse = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${token.mint}`, {
        next: { revalidate: 0 },
        headers: { Accept: "application/json" },
      })

      const contentType = dexResponse.headers.get("content-type")
      if (dexResponse.ok && contentType?.includes("application/json")) {
        const dexData = await dexResponse.json()
        if (dexData.pairs && dexData.pairs.length > 0) {
          const pair = dexData.pairs[0]
          price = Number.parseFloat(pair.priceUsd || "0")
          symbol = pair.baseToken?.symbol || symbol
          name = pair.baseToken?.name || name
          priceChange24h = Number.parseFloat(pair.priceChange?.h24 || "0")
          liquidity = Number.parseFloat(pair.liquidity?.usd || "0")
          hasData = true
          successfulPrices++
        }
      }
    } catch (error) {
      // Silently handle errors for individual tokens
    }

    const value = token.balance * price

    let riskScore = 0
    if (Math.abs(priceChange24h) > 50) riskScore += 30
    if (Math.abs(priceChange24h) > 100) riskScore += 20
    if (!hasData) riskScore += 15
    if (liquidity < 1000 && liquidity > 0) riskScore += 20

    const suspiciousActivity = Math.abs(priceChange24h) > 100

    holdings.push({
      address: token.mint,
      symbol,
      name,
      balance: token.balance,
      value,
      price,
      priceChange24h,
      riskScore: Math.min(riskScore, 100),
      alerts: suspiciousActivity ? ["High volatility detected"] : !hasData ? ["No trading pair found"] : [],
      liquidity,
      holders: 0,
      topHolderPercent: 0,
      devHolding: 0,
      suspiciousActivity,
      decimals: token.decimals,
      hasData,
    })
  }

  holdings.sort((a, b) => b.value - a.value)

  const totalValue = holdings.reduce((sum, holding) => sum + holding.value, 0)
  const tokensWithValue = holdings.filter((h) => h.value > 0).length

  console.log(
    `[v0] Successfully fetched ${holdings.length} holdings, ${tokensWithValue} with value, total: $${totalValue.toFixed(2)}`,
  )

  return NextResponse.json({
    holdings,
    totalValue,
    tokensWithValue,
    totalTokens: holdings.length,
    isMockData: false,
  })
}
