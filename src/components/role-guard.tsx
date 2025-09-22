"use client"

import type React from "react"

// Componente para proteger conteúdo baseado em roles
import { useAuth } from "@/hooks/use-auth"
import { hasPermission } from "@/lib/permissions"
import type { UserRole } from "@/lib/permissions"

interface RoleGuardProps {
  children: React.ReactNode
  module: string
  action: string
  fallback?: React.ReactNode
  allowedRoles?: UserRole[]
}

export function RoleGuard({ children, module, action, fallback = null, allowedRoles }: RoleGuardProps) {
  const { user } = useAuth()

  if (!user) return fallback

  // Verificar por roles específicos se fornecidos
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return fallback
  }

  // Verificar permissões do módulo
  if (!hasPermission(user.role, module, action)) {
    return fallback
  }

  return <>{children}</>
}
