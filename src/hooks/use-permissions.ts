'use client'

import { useSession } from '@/contexts/session-context'
import { 
  hasPermission, 
  hasAllPermissions, 
  hasAnyPermission, 
  hasRoutePermission 
} from '@/config/permissions'

/**
 * Hook para verificar permissões do usuário
 */
export function usePermissions() {
  const { user } = useSession()
  const userRoles = user?.roles || []

  return {
    /**
     * Verifica se o usuário tem uma permissão específica
     */
    can: (permission: string) => hasPermission(permission, userRoles),
    
    /**
     * Verifica se o usuário tem todas as permissões listadas
     */
    canAll: (permissions: string[]) => hasAllPermissions(permissions, userRoles),
    
    /**
     * Verifica se o usuário tem pelo menos uma das permissões listadas
     */
    canAny: (permissions: string[]) => hasAnyPermission(permissions, userRoles),
    
    /**
     * Verifica se o usuário tem permissão para acessar uma rota
     */
    canAccessRoute: (pathname: string) => hasRoutePermission(pathname, userRoles),
    
    /**
     * Retorna todas as permissões do usuário
     */
    permissions: userRoles,
  }
}
