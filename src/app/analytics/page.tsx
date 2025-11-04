"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from "recharts"
import { TrendingUp, TrendingDown, Users, DollarSign, Target, Calendar, Download, Activity, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { getOpportunities } from "@/services/opportunity.service"
import { getTeams } from "@/services/team.service"
import { Opportunity, Team } from "@/lib/types"

interface AnalyticsData {
  totalRevenue: number
  totalOpportunities: number
  conversionRate: number
  avgDealSize: number
  monthlyData: Array<{ month: string; revenue: number; opportunities: number }>
  statusDistribution: Array<{ name: string; value: number; color: string }>
  stageDistribution: Array<{ stage: string; count: number; conversion: number }>
  topPerformers: Array<{ name: string; deals: number; revenue: number; growth: number }>
}

export default function AnalyticsPage() {
  const { user, roles } = useAuth()
  const [loading, setLoading] = useState(true)
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [dateRange, setDateRange] = useState("30days")

  const isAdmin = roles?.includes("admin")
  const isLeader = useMemo(() => {
    if (!user?.email || !teams.length) return false
    return teams.some(team => team.managerId === user.email)
  }, [user?.email, teams])

  const isSeller = useMemo(() => {
    if (!user?.email || !teams.length) return false
    return teams.some(team => 
      team.sellers?.some(seller => seller.userId === user.email)
    )
  }, [user?.email, teams])

  // Filter opportunities based on user role
  const filteredOpportunities = useMemo(() => {
    console.log("[analytics] ============ FILTERING OPPORTUNITIES ============")
    console.log("[analytics] Total opportunities:", opportunities.length)
    console.log("[analytics] isAdmin:", isAdmin)
    console.log("[analytics] isLeader:", isLeader)
    console.log("[analytics] isSeller:", isSeller)
    console.log("[analytics] user email:", user?.email)

    if (!opportunities.length) return []

    // Admin sees all
    if (isAdmin) {
      console.log("[analytics] Admin: showing all", opportunities.length, "opportunities")
      return opportunities
    }

    // Leader sees their team's opportunities
    if (isLeader) {
      const managedTeamIds = teams
        .filter(team => team.managerId === user?.email)
        .map(team => team.id)
      
      console.log("[analytics] Leader managed team IDs:", managedTeamIds)
      
      const filtered = opportunities.filter(opp => {
        const teamId = opp.customer?.team?.id
        const isInManagedTeam = teamId && managedTeamIds.includes(teamId)
        return isInManagedTeam
      })
      
      console.log("[analytics] Leader: showing", filtered.length, "opportunities")
      return filtered
    }

    // Seller sees only their own opportunities
    if (isSeller) {
      const filtered = opportunities.filter(opp => {
        const customerTeam = opp.customer?.team
        if (!customerTeam) return false
        
        const isInTeam = customerTeam.sellers?.some(seller => seller.userId === user?.email)
        return isInTeam
      })
      
      console.log("[analytics] Seller: showing", filtered.length, "opportunities")
      return filtered
    }

    console.log("[analytics] No role matched, showing 0 opportunities")
    return []
  }, [opportunities, teams, user?.email, isAdmin, isLeader, isSeller])

  // Calculate analytics data
  const analyticsData: AnalyticsData = useMemo(() => {
    console.log("[analytics] ============ CALCULATING ANALYTICS ============")
    console.log("[analytics] Filtered opportunities:", filteredOpportunities.length)

    const totalRevenue = filteredOpportunities.reduce((sum, opp) => {
      const oppRevenue = opp.items?.reduce((s, item) => s + (item.quantity || 0) * (item.price || 0), 0) || 0
      return sum + oppRevenue
    }, 0)

    const totalOpportunities = filteredOpportunities.length

    const closedWon = filteredOpportunities.filter(opp => opp.status === "WON").length
    const conversionRate = totalOpportunities > 0 ? (closedWon / totalOpportunities) * 100 : 0

    const avgDealSize = totalOpportunities > 0 ? totalRevenue / totalOpportunities : 0

    // Monthly data (last 6 months)
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (5 - i))
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' })
      
      const monthOpps = filteredOpportunities.filter(opp => {
        if (!opp.contactDate) return false
        const oppDate = new Date(opp.contactDate)
        return oppDate.getMonth() === date.getMonth() && oppDate.getFullYear() === date.getFullYear()
      })

      const revenue = monthOpps.reduce((sum, opp) => {
        const oppRevenue = opp.items?.reduce((s, item) => s + (item.quantity || 0) * (item.price || 0), 0) || 0
        return sum + oppRevenue
      }, 0)

      return {
        month: monthName,
        revenue,
        opportunities: monthOpps.length
      }
    })

    // Status distribution
    const statusMap = {
      OPEN: { name: "Aberto", color: "#3b82f6" },
      CLOSED_WON: { name: "Ganho", color: "#22c55e" },
      CLOSED_LOST: { name: "Perdido", color: "#ef4444" },
    }

    const statusCounts: Record<string, number> = {}
    filteredOpportunities.forEach(opp => {
      const status = opp.status || "OPEN"
      statusCounts[status] = (statusCounts[status] || 0) + 1
    })

    const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      name: statusMap[status as keyof typeof statusMap]?.name || status,
      value: Math.round((count / totalOpportunities) * 100) || 0,
      color: statusMap[status as keyof typeof statusMap]?.color || "#gray",
    }))

    // Stage distribution
    const stageCounts: Record<string, number> = {}
    filteredOpportunities.forEach(opp => {
      const stage = opp.stage?.name || "Sem estágio"
      stageCounts[stage] = (stageCounts[stage] || 0) + 1
    })

    const stageDistribution = Object.entries(stageCounts).map(([stage, count]) => ({
      stage,
      count,
      conversion: Math.round((count / totalOpportunities) * 100) || 0,
    }))

    // Top performers (by team or seller)
    const performanceMap: Record<string, { deals: number; revenue: number }> = {}
    
    filteredOpportunities.forEach(opp => {
      const oppRevenue = opp.items?.reduce((s, item) => s + (item.quantity || 0) * (item.price || 0), 0) || 0
      
      if (opp.customer?.team) {
        const teamKey = `team-${opp.customer.team.id}`
        if (!performanceMap[teamKey]) {
          performanceMap[teamKey] = { deals: 0, revenue: 0 }
        }
        performanceMap[teamKey].deals++
        performanceMap[teamKey].revenue += oppRevenue
      }
    })

    const topPerformers = Object.entries(performanceMap)
      .map(([key, data]) => {
        const team = teams.find(t => `team-${t.id}` === key)
        return {
          name: team?.name || "Desconhecido",
          deals: data.deals,
          revenue: data.revenue,
          growth: 0, // TODO: Calculate actual growth
        }
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    console.log("[analytics] Total Revenue:", totalRevenue)
    console.log("[analytics] Conversion Rate:", conversionRate)
    console.log("[analytics] Avg Deal Size:", avgDealSize)

    return {
      totalRevenue,
      totalOpportunities,
      conversionRate,
      avgDealSize,
      monthlyData,
      statusDistribution,
      stageDistribution,
      topPerformers,
    }
  }, [filteredOpportunities, teams])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        console.log("[analytics] ============ LOADING DATA ============")
        console.log("[analytics] User:", user?.email)
        console.log("[analytics] Roles:", roles)

        const [oppsData, teamsData] = await Promise.all([
          getOpportunities(),
          getTeams(),
        ])

        console.log("[analytics] Loaded", oppsData.length, "opportunities")
        console.log("[analytics] Loaded", teamsData.length, "teams")

        setOpportunities(oppsData)
        setTeams(teamsData as Team[])
      } catch (error) {
        console.error("[analytics] Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user?.email) {
      loadData()
    }
  }, [user?.email]) // Removido 'roles' das dependências

  if (loading) {
    return (
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">Análises e Relatórios</h1>
        </header>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </SidebarInset>
    )
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex items-center justify-between w-full">
          <div>
            <h1 className="text-lg font-semibold">Análises e Relatórios</h1>
            <p className="text-xs text-muted-foreground">
              {isAdmin && "Visualizando todos os dados"}
              {!isAdmin && isLeader && "Visualizando dados da sua equipe"}
              {!isAdmin && !isLeader && isSeller && "Visualizando seus dados"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Últimos 7 dias</SelectItem>
                <SelectItem value="30days">Últimos 30 dias</SelectItem>
                <SelectItem value="90days">Últimos 90 dias</SelectItem>
                <SelectItem value="1year">Último ano</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar Relatório
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="sales">Vendas</TabsTrigger>
            <TabsTrigger value="opportunities">Oportunidades</TabsTrigger>
            <TabsTrigger value="performance">Desempenho</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Receita Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    R$ {analyticsData.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <span className="text-muted-foreground">{analyticsData.totalOpportunities} oportunidades</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total de Oportunidades</CardTitle>
                  <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{analyticsData.totalOpportunities}</div>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <span className="text-muted-foreground">Todas as oportunidades</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Conversão</CardTitle>
                  <Target className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {analyticsData.conversionRate.toFixed(1)}%
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <span className="text-muted-foreground">Oportunidades ganhas</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-200/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Médio</CardTitle>
                  <Activity className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    R$ {analyticsData.avgDealSize.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <span className="text-muted-foreground">Valor médio por negócio</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tendência de Receita</CardTitle>
                  <CardDescription>Receita e oportunidades nos últimos 6 meses</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analyticsData.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-muted-foreground" />
                      <YAxis className="text-muted-foreground" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Status</CardTitle>
                  <CardDescription>Distribuição das oportunidades por status</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData.statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {analyticsData.statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-4">
                    {analyticsData.statusDistribution.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-muted-foreground">
                          {item.name} ({item.value}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sales" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Funil de Vendas</CardTitle>
                <CardDescription>Distribuição das oportunidades por estágio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.stageDistribution.map((stage, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">{stage.stage}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">{stage.count} oportunidades</span>
                          <Badge variant="outline" className="text-xs">
                            {stage.conversion}%
                          </Badge>
                        </div>
                      </div>
                      <Progress value={stage.conversion} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Oportunidades Mensais</CardTitle>
                <CardDescription>Quantidade de oportunidades criadas por mês</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={analyticsData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-muted-foreground" />
                    <YAxis className="text-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="opportunities" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Desempenho por Equipe</CardTitle>
                <CardDescription>Métricas de desempenho das equipes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.topPerformers.length > 0 ? (
                    analyticsData.topPerformers.map((performer, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {performer.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{performer.name}</p>
                            <p className="text-sm text-muted-foreground">{performer.deals} negócios</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-foreground">
                            R$ {performer.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">Nenhum dado de desempenho disponível</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SidebarInset>
  )
}
