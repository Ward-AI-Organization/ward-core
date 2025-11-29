// Manually verified tokens with custom GitHub links
// These tokens have been verified by the Ward AI team

export interface ManuallyVerifiedToken {
  address: string
  name: string
  symbol: string
  githubUrl?: string // Made optional since memecoins don't need GitHub
  verifiedDate: string
  notes?: string
  category?: string
}

export const MANUALLY_VERIFIED_TOKENS: ManuallyVerifiedToken[] = [
  {
    address: "WARDmUpYMKh6V42Uod2P1MNUcY1TCJ5RXuiUDKs8Wpf",
    name: "Ward AI",
    symbol: "WARD",
    githubUrl: "https://github.com/ward-ai/ward-ai-core",
    verifiedDate: "2024-01-15",
    notes: "Official Ward AI security platform token",
    category: "Utility",
  },
  {
    address: "9ezFthWrDUpSSeMdpLW6SDD9TJigHdc4AuQ5QN5bpump",
    name: "XerisCoin",
    symbol: "XERIS",
    githubUrl: "https://github.com/ZZachWWins/xeriscoin_testnet_localalpha_v1",
    verifiedDate: "2024-01-20",
    notes: "Manually verified by the Ward AI team",
    category: "DeFi",
  },
  {
    address: "8J69rbLTzWWgUJziFY8jeu5tDwEPBwUz4pKBMr5rpump",
    name: "Memecoin",
    symbol: "MEME",
    verifiedDate: "2024-01-20",
    notes: "Verified memecoin project",
    category: "Memecoin",
  },
  {
    address: "C2omVhcvt3DDY77S2KZzawFJQeETZofgZ4eNWWkXpump",
    name: "Memecoin",
    symbol: "MEME",
    verifiedDate: "2024-01-20",
    notes: "Verified memecoin project",
    category: "Memecoin",
  },
]

export function getManuallyVerifiedToken(address: string): ManuallyVerifiedToken | undefined {
  return MANUALLY_VERIFIED_TOKENS.find((token) => token.address.toLowerCase() === address.toLowerCase())
}

export function isManuallyVerified(address: string): boolean {
  return MANUALLY_VERIFIED_TOKENS.some((token) => token.address.toLowerCase() === address.toLowerCase())
}
