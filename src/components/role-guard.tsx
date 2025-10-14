"use client"

import type React from "react"

// Componente para proteger conteúdo baseado em roles
import { useAuth } from "@/hooks/use-auth"
import { hasPermission } from "@/lib/permissions"

interface RoleGuardProps {
  children: React.ReactNode
  requiredRole: string
  fallback?: React.ReactNode
}

export function RoleGuard({ children, requiredRole, fallback = null }: RoleGuardProps) {
  const { roles } = useAuth()

  if (!hasPermission(roles, requiredRole)) {
    return fallback
  }

  return <>{children}</>
}