"use client"

import { MarketGuardHeader } from "@/components/market-guard-header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle2, XCircle, AlertCircle, Plus } from "lucide-react"
import { useState, useEffect } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { PublicKey } from "@solana/web3.js"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Replace this with your actual $WARD token mint address from Solana mainnet
// Leave empty string for demo mode (allows voting without token verification)
const WARD_TOKEN_MINT = ""

const isValidPublicKey = (address: string): boolean => {
  if (!address) return false
  try {
    new PublicKey(address)
    return true
  } catch {
    return false
  }
}

interface Proposal {
  id: number
  title: string
  description: string
  category: string
  status: "active" | "passed" | "rejected"
  votesFor: number
  votesAgainst: number
  totalVotes: number
  endsIn: string
  proposer: string
}

const mockProposals: Proposal[] = [
  {
    id: 1,
    title: "Allocate 50% of Token Unlock for DEX Liquidity Boost",
    description:
      "Upon token unlock, allocate 50% of unlocked tokens to provide deep liquidity across major DEX pools (Raydium, Orca) to reduce slippage and improve trading experience for WARD holders.",
    category: "Token Unlock",
    status: "active",
    votesFor: 3847392,
    votesAgainst: 1283920,
    totalVotes: 5131312,
    endsIn: "3 days",
    proposer: "0x7a3d...4f21",
  },
  {
    id: 2,
    title: "Allocate 50% of Token Unlock for Token Burn",
    description:
      "Upon token unlock, permanently burn 50% of unlocked tokens to reduce circulating supply, increase scarcity, and create long-term deflationary pressure for WARD token holders.",
    category: "Token Burn",
    status: "active",
    votesFor: 4529847,
    votesAgainst: 892384,
    totalVotes: 5422231,
    endsIn: "3 days",
    proposer: "0x9f2c...8a91",
  },
  {
    id: 3,
    title: "Implement Staking Rewards Program",
    description:
      "Launch a staking program where WARD holders can lock tokens for 30/60/90 days to earn additional WARD rewards. This incentivizes long-term holding and reduces circulating supply.",
    category: "Protocol Upgrades",
    status: "active",
    votesFor: 2847392,
    votesAgainst: 983920,
    totalVotes: 3831312,
    endsIn: "5 days",
    proposer: "0x3b8f...2c45",
  },
  {
    id: 4,
    title: "Partner with Top Security Auditors",
    description:
      "Allocate 5% of treasury to partner with leading security firms (CertiK, Hacken) for continuous smart contract audits and security monitoring to enhance protocol safety.",
    category: "Marketing Budget",
    status: "active",
    votesFor: 3247192,
    votesAgainst: 748293,
    totalVotes: 3995485,
    endsIn: "6 days",
    proposer: "0x5d2a...9f87",
  },
]

export default function DAOPage() {
  const { publicKey, connected, signMessage } = useWallet()
  const { connection } = useConnection()
  const { toast } = useToast()
  const [userVotingPower, setUserVotingPower] = useState(0)
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)
  const [hasWardTokens, setHasWardTokens] = useState(false)
  const [votedProposals, setVotedProposals] = useState<Record<number, "agree" | "against">>({})
  const [votingInProgress, setVotingInProgress] = useState<number | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [proposalTitle, setProposalTitle] = useState("")
  const [proposalDescription, setProposalDescription] = useState("")
  const [proposalCategory, setProposalCategory] = useState("")
  const [activeProposals, setActiveProposals] = useState<Proposal[]>(mockProposals)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [proposalForm, setProposalForm] = useState({ title: "", category: "", description: "" })
  const [userVotes, setUserVotes] = useState<Record<number, "for" | "against">>({})
  const [votingStatus, setVotingStatus] = useState<Record<number, "confirming" | null>>({})

  useEffect(() => {
    const fetchTokenBalance = async () => {
      if (!publicKey || !connected) {
        setUserVotingPower(0)
        setHasWardTokens(false)
        return
      }

      if (!isValidPublicKey(WARD_TOKEN_MINT)) {
        console.log("[v0] No valid WARD token mint address configured, skipping balance check")
        setUserVotingPower(1000)
        setHasWardTokens(true)
        return
      }

      setIsLoadingBalance(true)
      try {
        // Get token accounts for the connected wallet
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
          mint: new PublicKey(WARD_TOKEN_MINT),
        })

        if (tokenAccounts.value.length > 0) {
          const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount
          setUserVotingPower(balance)
          setHasWardTokens(balance > 0)
          console.log("[v0] WARD token balance:", balance)
        } else {
          setUserVotingPower(0)
          setHasWardTokens(false)
          console.log("[v0] No WARD tokens found")
        }
      } catch (error) {
        console.error("[v0] Error fetching token balance:", error)
        setUserVotingPower(0)
        setHasWardTokens(false)
      } finally {
        setIsLoadingBalance(false)
      }
    }

    fetchTokenBalance()
  }, [publicKey, connected, connection])

  const handleVote = async (proposalId: number, vote: "for" | "against") => {
    if (!connected || !hasWardTokens || !signMessage || !publicKey) {
      toast({
        variant: "destructive",
        title: "Cannot Vote",
        description: "Please connect your wallet and ensure you hold WARD tokens.",
      })
      return
    }

    if (votingStatus[proposalId]) {
      return
    }

    setVotingStatus((prev) => ({ ...prev, [proposalId]: "confirming" }))

    try {
      const proposal = activeProposals.find((p) => p.id === proposalId)
      const message = `Ward AI DAO Vote\n\nProposal ID: ${proposalId}\nProposal: ${proposal?.title}\n\nYour Vote: ${vote.toUpperCase()}\nVoting Power: ${userVotingPower} WARD\nWallet: ${publicKey.toBase58()}\n\nTimestamp: ${new Date().toISOString()}`

      console.log("[v0] Requesting wallet signature for vote...")

      const encodedMessage = new TextEncoder().encode(message)
      const signature = await signMessage(encodedMessage)

      console.log("[v0] Vote signature received:", signature)

      await new Promise((resolve) => setTimeout(resolve, 1000))

      setVotedProposals((prev) => ({ ...prev, [proposalId]: vote }))
      setUserVotes((prev) => ({ ...prev, [proposalId]: vote }))

      toast({
        title: "Vote Confirmed!",
        description: `Your vote "${vote.toUpperCase()}" has been recorded with ${userVotingPower.toLocaleString()} voting power.`,
      })

      console.log("[v0] Vote successfully recorded")
    } catch (error: any) {
      console.error("[v0] Error during vote confirmation:", error)

      if (error.message?.includes("User rejected")) {
        toast({
          variant: "destructive",
          title: "Vote Cancelled",
          description: "You rejected the wallet signature request.",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Vote Failed",
          description: "Failed to confirm your vote. Please try again.",
        })
      }
    } finally {
      setVotingStatus((prev) => ({ ...prev, [proposalId]: null }))
    }
  }

  const handleSubmitProposal = async () => {
    if (!connected || !hasWardTokens || !signMessage || !publicKey) {
      toast({
        variant: "destructive",
        title: "Cannot Submit Proposal",
        description: "Please connect your wallet and ensure you hold WARD tokens.",
      })
      return
    }

    if (!proposalForm.title || !proposalForm.category || !proposalForm.description) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all fields to submit your proposal.",
      })
      return
    }

    // Require minimum voting power to submit proposals
    if (userVotingPower < 1000) {
      toast({
        variant: "destructive",
        title: "Insufficient Voting Power",
        description: "You need at least 1,000 WARD tokens to submit a proposal.",
      })
      return
    }

    try {
      const message = `Ward AI DAO - New Proposal Submission\n\nTitle: ${proposalForm.title}\nCategory: ${proposalForm.category}\nDescription: ${proposalForm.description}\n\nSubmitted by: ${publicKey.toBase58()}\nVoting Power: ${userVotingPower} WARD\nTimestamp: ${new Date().toISOString()}`

      const encodedMessage = new TextEncoder().encode(message)
      await signMessage(encodedMessage)

      toast({
        title: "Proposal Submitted!",
        description: "Your proposal has been submitted for community review. It will be active once approved.",
      })

      // Reset form
      setProposalForm({ title: "", category: "", description: "" })
      setIsDialogOpen(false)
    } catch (error: any) {
      if (error.message?.includes("User rejected")) {
        toast({
          variant: "destructive",
          title: "Submission Cancelled",
          description: "You rejected the wallet signature request.",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Submission Failed",
          description: "Failed to submit your proposal. Please try again.",
        })
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <MarketGuardHeader />

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-muted/30">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm text-muted-foreground">Decentralized Governance</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-balance">Ward AI DAO</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Shape the future of Ward AI security. Token holders vote on protocol upgrades, treasury allocation, and
            ecosystem development.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{activeProposals.length}</div>
              <div className="text-sm text-muted-foreground">Active Proposals</div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {activeProposals.reduce((sum, p) => sum + p.totalVotes, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Votes Cast</div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{userVotingPower > 0 ? userVotingPower.toLocaleString() : "—"}</div>
              <div className="text-sm text-muted-foreground">Your Voting Power</div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {connected && hasWardTokens ? (
                  <span className="text-emerald-500">Connected</span>
                ) : (
                  <WalletMultiButton className="!bg-transparent !p-0 !text-sm !font-bold !h-auto hover:!bg-transparent" />
                )}
              </div>
              <div className="text-sm text-muted-foreground">Wallet Status</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold">Active Proposals</h2>
            <p className="text-sm text-muted-foreground mt-1">Vote on the future of Ward AI</p>
          </div>
          <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
            <DialogTrigger asChild>
              <Button size="lg" disabled={!connected || !hasWardTokens || userVotingPower < 1000} className="gap-2">
                <Plus className="w-4 h-4" />
                Submit Proposal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Submit New Proposal</DialogTitle>
                <DialogDescription>
                  Requires 1,000 WARD tokens minimum. Your wallet will prompt you to sign the proposal submission.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="proposal-title">Proposal Title</Label>
                  <Input
                    id="proposal-title"
                    placeholder="e.g., Implement quarterly token buyback program"
                    value={proposalForm.title}
                    onChange={(e) => setProposalForm({ ...proposalForm, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proposal-category">Category</Label>
                  <Select
                    value={proposalForm.category}
                    onValueChange={(value) => setProposalForm({ ...proposalForm, category: value })}
                  >
                    <SelectTrigger id="proposal-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Token Unlock">Token Unlock</SelectItem>
                      <SelectItem value="Token Burn">Token Burn</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Staking">Staking</SelectItem>
                      <SelectItem value="Security">Security</SelectItem>
                      <SelectItem value="Protocol">Protocol Upgrade</SelectItem>
                      <SelectItem value="Treasury">Treasury</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proposal-description">Description</Label>
                  <Textarea
                    id="proposal-description"
                    placeholder="Provide detailed explanation of your proposal, its benefits, and implementation plan..."
                    rows={6}
                    value={proposalForm.description}
                    onChange={(e) => setProposalForm({ ...proposalForm, description: e.target.value })}
                  />
                </div>
                <Button
                  onClick={handleSubmitProposal}
                  disabled={!proposalForm.title || !proposalForm.category || !proposalForm.description}
                  className="w-full"
                  size="lg"
                >
                  Submit for Community Vote
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {!connected || !hasWardTokens ? (
          <Card className="border-dashed border-2 border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect Wallet to Participate</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Hold WARD tokens to gain voting power and participate in governance decisions.
              </p>
              <WalletMultiButton />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {activeProposals.map((proposal) => (
              <Card key={proposal.id} className="border-border/50 hover:border-border transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="font-medium">
                          {proposal.category}
                        </Badge>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{proposal.endsIn}</span>
                        </div>
                      </div>
                      <CardTitle className="text-xl">{proposal.title}</CardTitle>
                      <CardDescription className="text-base">{proposal.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Vote Results */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Agree</span>
                      <span className="font-medium">
                        {((proposal.votesFor / proposal.totalVotes) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all"
                        style={{ width: `${(proposal.votesFor / proposal.totalVotes) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Against</span>
                      <span className="font-medium">
                        {((proposal.votesAgainst / proposal.totalVotes) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 transition-all"
                        style={{ width: `${(proposal.votesAgainst / proposal.totalVotes) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground pt-2 border-t border-border/50">
                    {proposal.totalVotes.toLocaleString()} votes cast
                  </div>

                  {/* Vote Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => handleVote(proposal.id, "for")}
                      disabled={votingStatus[proposal.id] === "confirming" || userVotes[proposal.id] === "for"}
                      variant={userVotes[proposal.id] === "for" ? "default" : "outline"}
                      className="flex-1"
                    >
                      {votingStatus[proposal.id] === "confirming" && userVotes[proposal.id] !== "against" ? (
                        "Confirming..."
                      ) : userVotes[proposal.id] === "for" ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Voted Agree
                        </>
                      ) : (
                        "Vote Agree"
                      )}
                    </Button>
                    <Button
                      onClick={() => handleVote(proposal.id, "against")}
                      disabled={votingStatus[proposal.id] === "confirming" || userVotes[proposal.id] === "against"}
                      variant={userVotes[proposal.id] === "against" ? "destructive" : "outline"}
                      className="flex-1"
                    >
                      {votingStatus[proposal.id] === "confirming" && userVotes[proposal.id] !== "for" ? (
                        "Confirming..."
                      ) : userVotes[proposal.id] === "against" ? (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Voted Against
                        </>
                      ) : (
                        "Vote Against"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-16 grid md:grid-cols-2 gap-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">How to Participate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <div className="font-medium">Hold WARD Tokens</div>
                  <div className="text-sm text-muted-foreground">Each token equals one vote</div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <div className="font-medium">Connect Wallet</div>
                  <div className="text-sm text-muted-foreground">Use Phantom or Solflare</div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <div className="font-medium">Cast Your Vote</div>
                  <div className="text-sm text-muted-foreground">Sign with wallet to confirm</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Governance Process</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <div className="font-medium">Proposal Submission</div>
                  <div className="text-sm text-muted-foreground">Requires 1,000 WARD minimum</div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <div className="font-medium">Community Discussion</div>
                  <div className="text-sm text-muted-foreground">7-day voting period</div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <div className="font-medium">Implementation</div>
                  <div className="text-sm text-muted-foreground">Executed if majority approves</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer hideBetaBanner />
    </div>
  )
}
