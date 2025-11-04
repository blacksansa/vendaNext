"use client"
import type { ReactNode } from "react"
import QueryProvider from "@/components/query-provider"
import { WebSocketProvider } from "@/contexts/websocket-context"
import { SessionProvider } from "@/contexts/session-context"
import { RealtimeSync } from "@/components/realtime-sync"
import { AuthGuard } from "@/components/auth-guard"

interface ProvidersProps {
  children: ReactNode
}

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