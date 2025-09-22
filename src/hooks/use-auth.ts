"use client"

// Hook para gerenciar autenticação e roles do usuário
import { useState, useEffect } from "react"
import type { UserRole } from "@/lib/permissions"

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  groupId?: string // Para team_leaders
  avatar?: string
}

// Simulação de usuário logado - em produção viria de contexto/API
const mockUser: User = {
  id: "1",
  name: "Usuário Admin",
  email: "admin@empresa.com",
  role: "admin", // Altere aqui para testar diferentes roles: 'admin', 'manager', 'team_leader', 'sales_rep', 'viewer'
  avatar: "/professional-avatar.png",
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simula carregamento do usuário
    setTimeout(() => {
      setUser(mockUser)
      setLoading(false)
    }, 100)
  }, [])

  const updateUserRole = (newRole: UserRole) => {
    if (user) {
      setUser({ ...user, role: newRole })
    }
  }

  return {
    user,
    loading,
    updateUserRole,
    isAuthenticated: !!user,
  }
}
