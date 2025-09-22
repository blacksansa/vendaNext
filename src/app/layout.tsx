import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { Suspense } from "react"
import { Providers } from "./providers"

export const metadata: Metadata = {
  title: "Painel Administrativo CRM",
  description: "Sistema profissional de gerenciamento CRM",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Providers session={null}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <Suspense fallback={<div>Carregando...</div>}>
              <SidebarProvider>
                <AppSidebar />
                <main className="flex-1">{children}</main>
              </SidebarProvider>
            </Suspense>
          </ThemeProvider>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
