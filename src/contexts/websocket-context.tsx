"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react'
import { useSession } from '@/contexts/session-context'

type EventCallback = (data: any) => void

interface WebSocketContextType {
  socket: WebSocket | null
  isConnected: boolean
  send: (message: string) => void
  on: (event: string, callback: EventCallback) => void
  off: (event: string, callback?: EventCallback) => void
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
  send: () => {},
  on: () => {},
  off: () => {},
})

interface WebSocketProviderProps {
  children: ReactNode
  url?: string
}

export function WebSocketProvider({ children, url }: WebSocketProviderProps) {
  const { session, status } = useSession()
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const eventListeners = useRef<Map<string, Set<EventCallback>>>(new Map())
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectAttemptsRef = useRef(0)
  const isConnectingRef = useRef(false)
  const maxReconnectAttempts = 10

  const connectWebSocket = () => {
    // Só conectar se estiver autenticado
    if (status !== 'authenticated' || !session?.accessToken) {
      console.log('[WebSocket] Aguardando autenticação...')
      return
    }

    // Evitar múltiplas conexões simultâneas
    if (isConnectingRef.current) {
      console.log('[WebSocket] Já está conectando, ignorando...')
      return
    }

    // Se já existe um socket conectado, não criar outro
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log('[WebSocket] Socket já está conectado, ignorando...')
      return
    }

    isConnectingRef.current = true

    // URL do backend WebSocket
    const baseUrl = url || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
    // Garante que temos /api no path
    const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`
    const wsUrl = apiUrl.replace(/^http/, 'ws') + '/ws'
    
    console.log('[WebSocket] Conectando em:', wsUrl)
    
    try {
      // Criar WebSocket (sem autenticação por token na URL)
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        console.log('[WebSocket] Conectado ao servidor')
        setIsConnected(true)
        reconnectAttemptsRef.current = 0
        isConnectingRef.current = false
      }

      ws.onclose = () => {
        console.log('[WebSocket] Desconectado do servidor')
        setIsConnected(false)
        setSocket(null)
        isConnectingRef.current = false
        
        // NÃO reconectar automaticamente para evitar loop infinito
        console.log('[WebSocket] Conexão fechada')
      }

      ws.onerror = (error) => {
        console.error('[WebSocket] Erro de conexão:', error)
        isConnectingRef.current = false
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          // Ignorar mensagens de sistema (connected, ack)
          if (data.type === 'connected' || data.type === 'ack') {
            console.log('[WebSocket] Mensagem de sistema:', data.type)
            return
          }
          
          // Processar eventos de mudança de entidade
          // Formato: { type: "entity:operation", entity: "customer", operation: "created", id: "123" }
          if (data.type && data.type.includes(':')) {
            const eventName = data.type
            const listeners = eventListeners.current.get(eventName)
            
            if (listeners && listeners.size > 0) {
              console.log(`[WebSocket] Evento recebido: ${eventName}`, data)
              listeners.forEach(callback => callback(data))
            }
          }
        } catch (e) {
          console.error('[WebSocket] Erro ao processar mensagem:', e, event.data)
        }
      }

      setSocket(ws)
    } catch (error) {
      console.error('[WebSocket] Erro ao criar conexão:', error)
      isConnectingRef.current = false
    }
  }

  useEffect(() => {
    // Evitar reconexões desnecessárias
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      console.log('[WebSocket] Socket já está ativo, não reconectando')
      return
    }

    // Evitar se já está tentando conectar
    if (isConnectingRef.current) {
      console.log('[WebSocket] Já está tentando conectar, aguardando...')
      return
    }

    // Só tentar conectar quando estiver autenticado
    if (status === 'authenticated' && session?.accessToken) {
      console.log('[WebSocket] Iniciando conexão...')
      connectWebSocket()
    }

    // Cleanup ao desmontar
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
        console.log('[WebSocket] Fechando conexão no cleanup')
        socket.close()
        isConnectingRef.current = false
      }
    }
  }, [status]) // Removido session?.accessToken e url das dependências

  const send = (message: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(message)
    } else {
      console.warn('[WebSocket] Socket não está conectado')
    }
  }

  const on = (event: string, callback: EventCallback) => {
    const listeners = eventListeners.current.get(event) || new Set()
    listeners.add(callback)
    eventListeners.current.set(event, listeners)
  }

  const off = (event: string, callback?: EventCallback) => {
    if (callback) {
      const listeners = eventListeners.current.get(event)
      if (listeners) {
        listeners.delete(callback)
        if (listeners.size === 0) {
          eventListeners.current.delete(event)
        }
      }
    } else {
      eventListeners.current.delete(event)
    }
  }

  return (
    <WebSocketContext.Provider value={{ socket, isConnected, send, on, off }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket deve ser usado dentro de WebSocketProvider')
  }
  return context
}
