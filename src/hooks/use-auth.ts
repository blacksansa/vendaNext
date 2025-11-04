"use client"

import { useSession } from "@/contexts/session-context"

export function useAuth() {
  const { user, status, signOut } = useSession()

  const loading = status === "loading"
  const isAuthenticated = status === "authenticated"

  return {
    user,
    roles: user?.roles,
    role: user?.role,
    loading,
    isAuthenticated,
    signOut,
  }
}