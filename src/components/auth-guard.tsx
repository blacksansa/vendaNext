'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from '@/contexts/session-context'

// Páginas públicas que não precisam de autenticação
const PUBLIC_ROUTES = ['/login', '/forgot-password', '/reset-password']

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { status } = useSession()
  
  // Se estiver em uma rota pública, não faz verificação de autenticação
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

  // Redireciona para login se não autenticado (usando useEffect para evitar warning)
  useEffect(() => {
    if (!isPublicRoute && status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, isPublicRoute, router, pathname])

  // Em rotas públicas, sempre renderiza
  if (isPublicRoute) {
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

  if (status === 'unauthenticated') {
    // Retorna loading enquanto redireciona (useEffect acima faz o redirect)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecionando para login...</p>
        </div>
      </div>
    )
  }

  // Renderiza o conteúdo se autenticado
  return <>{children}</>
}
