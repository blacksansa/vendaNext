'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
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
  [key: string]: any
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')
  const isRefreshing = useRef(false)

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
      
      console.log('🔐 TOKEN DECODIFICADO:', {
        sub: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        resource_access: decoded.resource_access
      })
      
      // Extrai roles do token
      const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || process.env.KEYCLOAK_ID || 'vendaplus'
      const clientRoles = decoded.resource_access?.[clientId]?.roles || []
      
      console.log('🎭 ROLES EXTRAÍDOS:', {
        clientId,
        clientRoles,
        allResourceAccess: decoded.resource_access
      })
      
      // Determina role de alto nível baseado em permissões Keycloak
      let role: 'admin' | 'manager' | 'seller' = 'seller'
      if (clientRoles.includes('manageUsers')) {
        role = 'admin'
      } else if (clientRoles.includes('manageTeams')) {
        role = 'manager'
      }
      
      console.log('👤 ROLE DETERMINADO:', {
        role,
        basedOnRoles: clientRoles
      })

      const user: User = {
        id: decoded.sub,
        email: decoded.email || decoded.preferred_username || '',
        name: decoded.name || decoded.given_name || decoded.preferred_username || '',
        roles: clientRoles,
        role,
        ...decoded, // Inclui todos os claims do token
      }

      const computedExpiresAt = expiresAt ? parseInt(expiresAt) : (decoded.exp ? decoded.exp * 1000 : Date.now() + 300000)

      const sessionData: Session = {
        user,
        accessToken,
        refreshToken,
        expiresAt: computedExpiresAt,
      }

      setSession(sessionData)
      setStatus('authenticated')
    } catch (error) {
      console.error('Erro ao carregar sessão:', error)
      setStatus('unauthenticated')
      setSession(null)
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        await keycloakLogout(refreshToken)
      }
    } catch (error) {
      console.error('Erro ao fazer logout no Keycloak:', error)
    } finally {
      // Limpa localStorage
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('id_token')
      localStorage.removeItem('expires_at')
      
      setSession(null)
      setStatus('unauthenticated')
      
      // Força redirect com window.location para garantir limpeza
      window.location.href = '/login'
    }
  }, [])

  const refreshSession = useCallback(async () => {
    // Previne múltiplos refreshes simultâneos
    if (isRefreshing.current) {
      return
    }
    
    isRefreshing.current = true
    
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
      await loadSession()
    } catch (error) {
      console.error('Erro ao atualizar sessão:', error)
      await signOut()
    } finally {
      isRefreshing.current = false
    }
  }, [loadSession, signOut])

  // Carrega sessão na inicialização
  useEffect(() => {
    loadSession()
  }, [loadSession])

  // Monitora mudanças no localStorage (para sincronizar entre abas)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token' || e.key === 'refresh_token' || e.key === 'expires_at') {
        loadSession()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [loadSession])

  // Monitor de expiração do token (simplificado)
  useEffect(() => {
    if (!session?.expiresAt) return

    const checkExpiration = () => {
      const timeUntilExpiry = session.expiresAt - Date.now()
      
      // Se faltam menos de 2 minutos, faz refresh
      if (timeUntilExpiry < 120000 && timeUntilExpiry > 0) {
        console.log('🔄 Token expirando em breve, fazendo refresh...')
        refreshSession()
      }
      
      // Se já expirou, faz logout
      if (timeUntilExpiry <= 0) {
        console.log('⏰ Token expirado, fazendo logout...')
        signOut()
      }
    }

    // Checa a cada 30s para evitar expiração precoce em tokens curtos
    const intervalId = setInterval(checkExpiration, 30000)
    
    return () => clearInterval(intervalId)
  }, [session?.expiresAt, refreshSession, signOut])

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
