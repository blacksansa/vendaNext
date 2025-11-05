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
  const hasConnectedRef = useRef(false) // Evita múltiplas conexões

  const connectWebSocket = () => {
    // Só conectar se estiver autenticado
    if (status !== 'authenticated' || !session?.accessToken) {
      return
    }

    // Se já conectou uma vez, não reconectar
    if (hasConnectedRef.current) {
      return
    }

    // Se já existe um socket conectado, não criar outro
    if (socket && socket.readyState === WebSocket.OPEN) {
      return
    }

    hasConnectedRef.current = true

    // URL do backend WebSocket
    const baseUrl = url || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
    const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`
    const wsUrl = apiUrl.replace(/^http/, 'ws') + '/ws'
    
    try {
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        setIsConnected(true)
      }

      ws.onclose = () => {
        setIsConnected(false)
        setSocket(null)
        // NÃO reconectar automaticamente
      }

      ws.onerror = () => {
        // Silenciar erros para reduzir spam no console
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          // Ignorar mensagens de sistema
          if (data.type === 'connected' || data.type === 'ack') {
            return
          }
          
          // Processar eventos de mudança de entidade
          if (data.type && data.type.includes(':')) {
            const eventName = data.type
            const listeners = eventListeners.current.get(eventName)
            
            if (listeners && listeners.size > 0) {
              listeners.forEach(callback => callback(data))
            }
          }
        } catch (e) {
          // Silenciar erros de parsing
        }
      }

      setSocket(ws)
    } catch (error) {
      hasConnectedRef.current = false
    }
  }

  useEffect(() => {
    // Só conectar se estiver autenticado e ainda não conectou
    if (status === 'authenticated' && session?.accessToken && !hasConnectedRef.current) {
      // Delay para garantir que não vai ter múltiplas chamadas
      const timeoutId = setTimeout(() => {
        connectWebSocket()
      }, 1000)

      return () => clearTimeout(timeoutId)
    }

    // Limpar socket se desautenticou
    if (status === 'unauthenticated' && socket) {
      socket.close()
      setSocket(null)
      setIsConnected(false)
      hasConnectedRef.current = false
    }
  }, [status, session?.accessToken]) // Apenas quando status ou token mudar


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
