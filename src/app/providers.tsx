"use client"
import { SessionProvider } from "next-auth/react"
import type { ReactNode } from "react"
import QueryProvider from "@/components/query-provider"

interface ProvidersProps {
  children: ReactNode
}

import { AuthGuard } from "@/components/auth-guard"

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <SessionProvider>
        <AuthGuard>{children}</AuthGuard>
      </SessionProvider>
    </QueryProvider>
  )
}