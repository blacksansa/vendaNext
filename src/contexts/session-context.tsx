'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { jwtDecode } from 'jwt-decode'
import { keycloakRefreshToken, keycloakLogout } from '@/lib/keycloak-auth'

interface User {
  id: string
  email: string
  name?: string
  roles?: string[]
  role?: 'admin' | 'manager' | 'seller'
  [key: string]: any
}

interface Session {
  user: User
  accessToken: string
  refreshToken: string
  expiresAt: number
}

interface SessionContextType {
  session: Session | null
  status: 'loading' | 'authenticated' | 'unauthenticated'
  data: Session | null
  user: User | null
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const SessionContext = createContext<SessionContextType>({
  session: null,
  status: 'loading',
  data: null,
  user: null,
  signOut: async () => {},
  refreshSession: async () => {},
})

export function useSession() {
  return useContext(SessionContext)
}

interface DecodedToken {
  sub: string
  email?: string
  name?: string
  preferred_username?: string
  given_name?: string
  family_name?: string
  exp: number
  iat: number
  resource_access?: {
    [key: string]: {
      roles: string[]
    }
  }
  job?: string[]
  [key: string]: any
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')

  const loadSession = useCallback(() => {
    try {
      const accessToken = localStorage.getItem('access_token')
      const refreshToken = localStorage.getItem('refresh_token')
      const expiresAt = localStorage.getItem('expires_at')

      if (!accessToken || !refreshToken) {
        setStatus('unauthenticated')
        setSession(null)
        return
      }

      // Decodifica o token para obter informações do usuário
      const decoded = jwtDecode<DecodedToken>(accessToken)
      
      // Extrai roles do token
      const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || process.env.KEYCLOAK_ID || 'vendaplus'
      const clientRoles = decoded.resource_access?.[clientId]?.roles || []
      
      // Determina role de alto nível
      let role: 'admin' | 'manager' | 'seller' = 'seller'
      const jobGroup = decoded.job?.[0]
      if (jobGroup === 'Administradores') {
        role = 'admin'
      } else if (jobGroup === 'Gerentes') {
        role = 'manager'
      }

      const user: User = {
        id: decoded.sub,
        email: decoded.email || decoded.preferred_username || '',
        name: decoded.name || decoded.given_name || decoded.preferred_username || '',
        roles: clientRoles,
        role,
        ...decoded, // Inclui todos os claims do token
      }

      const sessionData: Session = {
        user,
        accessToken,
        refreshToken,
        expiresAt: expiresAt ? parseInt(expiresAt) : Date.now() + 300000,
      }

      setSession(sessionData)
      setStatus('authenticated')
    } catch (error) {
      console.error('Erro ao carregar sessão:', error)
      setStatus('unauthenticated')
      setSession(null)
    }
  }, [])

  const refreshSession = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) {
        throw new Error('No refresh token')
      }

      const tokens = await keycloakRefreshToken({ refreshToken })
      
      // Atualiza localStorage
      localStorage.setItem('access_token', tokens.access_token)
      localStorage.setItem('refresh_token', tokens.refresh_token)
      localStorage.setItem('id_token', tokens.id_token || '')
      
      const expiresAt = Date.now() + tokens.expires_in * 1000
      localStorage.setItem('expires_at', expiresAt.toString())

      // Recarrega sessão
      loadSession()
    } catch (error) {
      console.error('Erro ao atualizar sessão:', error)
      await signOut()
    }
  }, [loadSession])

  const signOut = useCallback(async () => {
    try {
      console.log('[Logout] Iniciando logout...')
      
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        console.log('[Logout] Fazendo logout no Keycloak...')
        await keycloakLogout(refreshToken)
      } else {
        console.log('[Logout] Nenhum refresh token encontrado')
      }
    } catch (error) {
      console.error('[Logout] Erro ao fazer logout no Keycloak:', error)
    } finally {
      console.log('[Logout] Limpando sessão local...')
      
      // Limpa localStorage
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('id_token')
      localStorage.removeItem('expires_at')
      
      setSession(null)
      setStatus('unauthenticated')
      
      console.log('[Logout] Redirecionando para login...')
      
      // Redireciona para login
      window.location.href = '/login'
    }
  }, [])

  // Carrega sessão na inicialização
  useEffect(() => {
    loadSession()
  }, [loadSession])

  // Monitora mudanças no localStorage (para sincronizar entre abas)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token' || e.key === 'refresh_token') {
        loadSession()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [loadSession])

  // Auto-refresh antes do token expirar
  useEffect(() => {
    if (status !== 'authenticated' || !session) return

    let timeoutId: NodeJS.Timeout
    let isRefreshing = false

    const scheduleRefresh = () => {
      if (isRefreshing) return

      const now = Date.now()
      const timeUntilExpiry = session.expiresAt - now
      
      // Se já expirou ou falta menos de 1 minuto, não agenda
      if (timeUntilExpiry <= 60 * 1000) return

      // Agenda refresh para 5 minutos antes de expirar
      const refreshTime = Math.max(timeUntilExpiry - (5 * 60 * 1000), 60 * 1000)
      
      console.log(`⏰ Refresh agendado para daqui ${Math.round(refreshTime / 1000)}s`)
      
      timeoutId = setTimeout(async () => {
        if (isRefreshing) return
        isRefreshing = true
        console.log('🔄 Fazendo refresh do token...')
        await refreshSession()
        isRefreshing = false
      }, refreshTime)
    }

    scheduleRefresh()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [status, session?.expiresAt, refreshSession])

  const value: SessionContextType = {
    session,
    status,
    data: session,
    user: session?.user || null,
    signOut,
    refreshSession,
  }

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  )
}
