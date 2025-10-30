"use client"

import type React from "react"

import { useAuth } from "@/hooks/use-auth"
import { isComponentVisible } from "@/lib/role-config"

interface ConditionalRenderProps {
  componentId: string
  page?: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ConditionalRender({
  componentId,
  page = "dashboard",
  children,
  fallback = null,
}: ConditionalRenderProps) {
  const { user } = useAuth()

  if (!user) return fallback

  const isVisible = isComponentVisible(user.role ?? "", componentId, page)

  return isVisible ? <>{children}</> : <>{fallback}</>
}

// Hook para verificar visibilidade de componentes
export function useComponentVisibility(componentId: string, page = "dashboard") {
  const { user } = useAuth()

  if (!user) return false

  return isComponentVisible(user.role ?? "", componentId, page)
}
