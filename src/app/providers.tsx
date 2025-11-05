"use client"
import type { ReactNode } from "react"
import QueryProvider from "@/components/query-provider"
import { WebSocketProvider } from "@/contexts/websocket-context"
import { SessionProvider } from "@/contexts/session-context"
import { RealtimeSync } from "@/components/realtime-sync"

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <SessionProvider>
        <WebSocketProvider>
          <RealtimeSync />
          {children}
        </WebSocketProvider>
      </SessionProvider>
    </QueryProvider>
  )
}