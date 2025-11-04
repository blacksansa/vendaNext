"use client"

import { useState } from "react"
import type * as React from "react"
import {
  BarChart3,
  Users,
  Home,
  Settings,
  Search,
  Plus,
  TrendingUp,
  LogOut,
  UserPlus,
  Kanban,
  FileText,
  Shield,
  Crown,
  CheckSquare,
  FolderOpen,
  ListTodo,
  ShoppingCart,
  GitBranch,
  Loader2,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { getVisibleNavigation, hasPermission } from "@/lib/permissions"

const iconMap = {
  Home,
  Users,
  UserPlus,
  Crown,
  GitBranch,
  BarChart3,
  Kanban,
  FileText,
  Shield,
  Settings,
  CheckSquare,
  FolderOpen,
  ListTodo,
  ShoppingCart,
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { toggleSidebar, state } = useSidebar()
  const { user, roles: authRoles, loading, signOut } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Normaliza possíveis formatos de role(s):
  // - authRoles pode ser array ou string
  // - user.role pode existir como string
  // - user.roles pode existir como array
  const rolesList: string[] = (() => {
    if (Array.isArray(authRoles)) return authRoles
    if (typeof authRoles === "string" && authRoles !== "") return [authRoles]
    if (Array.isArray((user as any)?.roles)) return (user as any).roles
    if (typeof (user as any)?.role === "string" && (user as any).role !== "") return [(user as any).role]
    return []
  })()

  const visibleNavigation = getVisibleNavigation(rolesList)
  const canAddCustomer = hasPermission(rolesList, "manageCustomers")

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      setIsLoggingOut(false)
    }
  }

  if (loading) {
    return null // ou um skeleton loader
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
              onClick={toggleSidebar}
              title={state === "collapsed" ? "Expandir sidebar" : "Recolher sidebar"}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <TrendingUp className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Admin CRM</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleNavigation.map((item) => {
                const IconComponent = iconMap[item.icon as keyof typeof iconMap]
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <IconComponent />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {canAddCustomer && (
          <SidebarGroup>
            <SidebarGroupLabel>Ações Rápidas</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/customers">
                      <Plus />
                      <span>Adicionar Cliente</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Search />
                    <span>Pesquisar</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {hasPermission(rolesList, "manageSettings") && (
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild size="sm">
                    <Link href="/settings">
                      <Settings />
                      <span>Configurações</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} disabled={isLoggingOut}>
              <Avatar className="h-6 w-6">
                <AvatarImage src={user?.image || "/placeholder.svg"} />
                <AvatarFallback>
                  {user?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{user?.name}</span>
              {isLoggingOut ? (
                <Loader2 className="ml-auto h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="ml-auto h-4 w-4" />
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <div className="flex justify-center p-2">
              <ThemeToggle />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}