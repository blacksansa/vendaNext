"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useSession } from "next-auth/react"
import { getVisibleNavigation } from "@/lib/permissions"
import * as Icons from "lucide-react"

export function AppSidebar() {
  const { data: session } = useSession()
  const user = session?.user as any

  // Normaliza roles/role (pode vir como string ou array, ou campo `role`)
  const rolesList: string[] = (() => {
    if (Array.isArray(user?.roles)) return user.roles
    if (typeof user?.roles === "string" && user.roles !== "") return [user.roles]
    if (typeof user?.role === "string" && user.role !== "") return [user.role]
    return []
  })()

  const visibleItems = getVisibleNavigation(rolesList)

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => {
                const Icon = (Icons as any)[item.icon as keyof typeof Icons]
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        {Icon ? <Icon /> : null}
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}