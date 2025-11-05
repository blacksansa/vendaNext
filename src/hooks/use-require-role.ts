import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/contexts/session-context'

/**
 * Hook para proteger páginas por role
 * Redireciona para /acesso-negado se o usuário não tiver a role necessária
 */
export function useRequireRole(requiredRole: string | string[]) {
  const { session, status } = useSession()
  const router = useRouter()
  
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  const hasPermission = session?.user?.roles?.some(role => roles.includes(role)) ?? false
  
  useEffect(() => {
    // Aguardar carregar a sessão
    if (status === 'loading') return
    
    // Se autenticado mas sem permissão, redirecionar
    if (status === 'authenticated' && !hasPermission) {
      console.warn(`[useRequireRole] Acesso negado - requer uma das roles: ${roles.join(', ')}`)
      router.push('/acesso-negado')
    }
  }, [session, status, hasPermission, roles, router])
  
  return {
    hasPermission,
    loading: status === 'loading',
    roles: session?.user?.roles || [],
  }
}
