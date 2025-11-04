"use client"

import { usePathname } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export function ConditionalSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Lista de rotas onde a sidebar não deve aparecer
  const authRoutes = ['/login', '/forgot-password', '/reset-password']
  const isAuthRoute = authRoutes.includes(pathname)

  if (isAuthRoute) {
    return <>{children}</>
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1">{children}</main>
    </SidebarProvider>
  )
}
