import type { Metadata } from "next"
import DAOPageClient from "@/components/dao-page-client"

export const metadata: Metadata = {
  title: "Ward AI DAO",
  description: "Ward AI Decentralized Governance - Token holders vote on protocol decisions",
}

export default function DAOPage() {
  return <DAOPageClient />
}
