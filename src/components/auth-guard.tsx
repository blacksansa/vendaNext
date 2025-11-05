'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from '@/contexts/session-context'
import { hasRoutePermission } from '@/config/permissions'

// Páginas públicas que não precisam de autenticação
const PUBLIC_ROUTES = ['/login', '/forgot-password', '/reset-password']

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { status, user } = useSession()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const hasCheckedPermission = useRef(false)
  
  // Se estiver em uma rota pública, não faz verificação de autenticação
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

  // Gerencia redirecionamentos
  useEffect(() => {
    // Aguarda status ser definido
    if (status === 'loading') return

    // Evita redirecionamentos múltiplos
    if (isRedirecting) return

    // Redireciona para login se não autenticado em rota protegida
    if (!isPublicRoute && status === 'unauthenticated') {
      setIsRedirecting(true)
      window.location.href = '/login'
      return
    }

    // Redireciona para home se autenticado em rota pública
    if (isPublicRoute && status === 'authenticated') {
      setIsRedirecting(true)
      router.push('/')
      return
    }

    // Verifica permissões para rotas protegidas (apenas uma vez)
    if (!isPublicRoute && status === 'authenticated' && user && !hasCheckedPermission.current) {
      hasCheckedPermission.current = true
      const userRoles = user.roles || []
      const hasPermission = hasRoutePermission(pathname, userRoles)
      
      if (!hasPermission) {
        setPermissionDenied(true)
        setIsRedirecting(true)
        // Usa replace ao invés de push para evitar loop
        setTimeout(() => {
          router.replace('/')
        }, 50)
        return
      }
    }
  }, [status, isPublicRoute, router, pathname, user, isRedirecting])

  // Reset do check quando muda a rota
  useEffect(() => {
    hasCheckedPermission.current = false
    setPermissionDenied(false)
    setIsRedirecting(false)
  }, [pathname])

  // Em rotas públicas, sempre renderiza
  if (isPublicRoute) {
    // Se está autenticado e vai redirecionar, mostra loading
    if (status === 'authenticated' && isRedirecting) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Redirecionando...</p>
          </div>
        </div>
      )
    }
    return <>{children}</>
  }

  // Em rotas protegidas, verifica status
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated' || (isRedirecting && !permissionDenied)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecionando para login...</p>
        </div>
      </div>
    )
  }

  // Se não tem permissão, mostra mensagem antes de redirecionar
  if (permissionDenied) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Acesso negado. Redirecionando...</p>
        </div>
      </div>
    )
  }

  // Renderiza o conteúdo se autenticado e com permissão
  return <>{children}</>
}
