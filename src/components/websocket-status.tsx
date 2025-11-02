"use client"

import { useWebSocket } from "@/contexts/websocket-context"
import { Wifi, WifiOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function WebSocketStatus() {
  const { isConnected } = useWebSocket()

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={isConnected ? "default" : "destructive"} 
            className="gap-1 cursor-help"
          >
            {isConnected ? (
              <Wifi className="h-3 w-3" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
            <span className="text-xs">
              {isConnected ? "Conectado" : "Desconectado"}
            </span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {isConnected 
              ? "Atualizações em tempo real ativas" 
              : "Reconectando..."}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
