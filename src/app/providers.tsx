"use client"
import { SessionProvider } from "next-auth/react"
import type { ReactNode } from "react"
import QueryProvider from "@/components/query-provider"
import { WebSocketProvider } from "@/contexts/websocket-context"
import { RealtimeSync } from "@/components/realtime-sync"

interface ProvidersProps {
  children: ReactNode
}

import { AuthGuard } from "@/components/auth-guard"

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <SessionProvider>
        <WebSocketProvider>
          <AuthGuard>
            <RealtimeSync />
            {children}
          </AuthGuard>
        </WebSocketProvider>
      </SessionProvider>
    </QueryProvider>
  )
}