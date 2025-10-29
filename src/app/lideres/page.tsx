"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Crown,
  Users,
  Target,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  MessageSquare,
  Calendar,
  Activity,
  Loader2,
} from "lucide-react"
import { AlertCircle } from "lucide-react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getTeams, TeamDTO } from "@/services/team.service"
import { getOpportunities } from "@/services/opportunity.service"
import { Opportunity } from "@/lib/types"

interface TeamWithMetrics extends TeamDTO {
  totalVendas: number
  totalOportunidades: number
  oportunidadesAbertas: number
  oportunidadesGanhas: number
  oportunidadesPerdidas: number
  ticketMedio: number
  taxaConversao: number
}

export default function DashboardLideresPage() {
  const { user, roles, loading: authLoading } = useAuth()
  const [periodoSelecionado, setPeriodoSelecionado] = useState("mes")
  const [grupoSelecionado, setGrupoSelecionado] = useState("todos")
  const [teams, setTeams] = useState<TeamWithMetrics[]>([])
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)

  const isAdmin = roles?.includes("admin")
  const isLeader = roles?.includes("leader") || roles?.includes("lider")

  // Get the Keycloak UUID from the user session
  const userKeycloakId = (user as any)?.id // This is the UUID from Keycloak (sub claim)
  
  console.log("[lideres] ============ USER IDENTIFICATION ============")
  console.log("[lideres] user object:", user)
  console.log("[lideres] userKeycloakId (UUID):", userKeycloakId)
  console.log("[lideres] user.email:", user?.email)
  console.log("[lideres] isAdmin:", isAdmin)
  console.log("[lideres] isLeader:", isLeader)

  // Filter teams based on user role
  // Admin sees all teams
  // Leaders see only teams where they are the manager OR in the sellers list
  const gruposPermitidos = isAdmin 
    ? teams 
    : teams.filter((team) => {
        if (!userKeycloakId) return false
        
        // Check if user is the manager - compare Keycloak UUID or email as fallback
        const isManager = team.managerId === userKeycloakId || team.managerId === user?.email
        
        // Check if user is in the sellers list
        const isSeller = team.sellers?.some((seller: any) => {
          if (typeof seller === 'object') {
            // Check seller's userId (which is Keycloak UUID) or email
            return seller.userId === userKeycloakId || 
                   seller.email === user?.email ||
                   seller.id === userKeycloakId
          }
          return seller === userKeycloakId || seller === user?.email
        })
        
        console.log(`[lideres] Team ${team.name}: isManager=${isManager}, isSeller=${isSeller}, managerId=${team.managerId}, userKeycloakId=${userKeycloakId}`)
        
        return isManager || isSeller
      })

  console.log("[lideres] ============ GRUPOS PERMITIDOS ============")
  console.log("[lideres] isAdmin:", isAdmin)
  console.log("[lideres] user email:", user?.email)
  console.log("[lideres] userKeycloakId:", userKeycloakId)
  console.log("[lideres] total teams:", teams.length)
  console.log("[lideres] gruposPermitidos:", gruposPermitidos.length)
  console.log("[lideres] gruposPermitidos data:", gruposPermitidos)

  useEffect(() => {
    async function loadData() {
      if (authLoading || !userKeycloakId) return
      
      try {
        setLoading(true)
        console.log("[lideres] ============ LOADING DATA ============")
        console.log("[lideres] User:", user?.email)
        console.log("[lideres] User Keycloak UUID:", userKeycloakId)
        console.log("[lideres] Roles:", roles)
        console.log("[lideres] Is Admin:", isAdmin)
        console.log("[lideres] Is Leader:", isLeader)
        
        // Load all teams
        const allTeams = await getTeams("", 0, 100)
        console.log("[lideres] ============ TEAMS LOADED ============")
        console.log("[lideres] Total teams:", allTeams.length)
        console.log("[lideres] Teams:", allTeams)
        
        // Log detailed team info
        allTeams.forEach((team, idx) => {
          console.log(`[lideres] Team ${idx}:`, {
            id: team.id,
            name: team.name,
            managerId: team.managerId,
            sellers: team.sellers,
            sellersLength: team.sellers?.length
          })
        })
        
        // Load all opportunities
        const allOpportunities = await getOpportunities("", 0, 1000)
        console.log("[lideres] ============ OPPORTUNITIES LOADED ============")
        console.log("[lideres] Total opportunities:", allOpportunities.length)
        
        setOpportunities(allOpportunities)
        
        // For now, we'll distribute opportunities evenly across teams
        // In a real scenario, you'd want to add a team_id or seller_id field to opportunities
        const teamsWithMetrics: TeamWithMetrics[] = allTeams.map((team, index) => {
          // Simple distribution: assign opportunities based on team index
          // This is a placeholder - in production you should have proper relationships
          const startIdx = Math.floor((index / allTeams.length) * allOpportunities.length)
          const endIdx = Math.floor(((index + 1) / allTeams.length) * allOpportunities.length)
          const teamOpportunities = allOpportunities.slice(startIdx, endIdx)
          
          const oportunidadesAbertas = teamOpportunities.filter(o => o.status === "OPEN").length
          const oportunidadesGanhas = teamOpportunities.filter(o => o.status === "WON").length
          const oportunidadesPerdidas = teamOpportunities.filter(o => o.status === "LOST").length
          
          // Calculate total sales from won opportunities
          const totalVendas = teamOpportunities
            .filter(o => o.status === "WON")
            .reduce((sum, o) => sum + (o.value || 0), 0)
          
          const ticketMedio = oportunidadesGanhas > 0 ? totalVendas / oportunidadesGanhas : 0
          
          const totalClosed = oportunidadesGanhas + oportunidadesPerdidas
          const taxaConversao = totalClosed > 0 ? (oportunidadesGanhas / totalClosed) * 100 : 0
          
          return {
            ...team,
            totalVendas,
            totalOportunidades: teamOpportunities.length,
            oportunidadesAbertas,
            oportunidadesGanhas,
            oportunidadesPerdidas,
            ticketMedio,
            taxaConversao,
          }
        })
        
        console.log("[lideres] ============ TEAMS WITH METRICS ============")
        console.log("[lideres] Teams with metrics:", teamsWithMetrics)
        
        setTeams(teamsWithMetrics)
        
        console.log("[lideres] ============ FILTERED TEAMS ============")
        console.log("[lideres] All teams count:", teamsWithMetrics.length)
        console.log("[lideres] userKeycloakId for filtering:", userKeycloakId)
        
        // Check filter logic - same as gruposPermitidos
        const filtered = isAdmin 
          ? teamsWithMetrics 
          : teamsWithMetrics.filter((team) => {
              const isManager = team.managerId === userKeycloakId || team.managerId === user?.email
              const isSeller = team.sellers?.some((seller: any) => {
                if (typeof seller === 'object') {
                  return seller.userId === userKeycloakId ||
                         seller.email === user?.email ||
                         seller.id === userKeycloakId
                }
                return seller === userKeycloakId || seller === user?.email
              })
              console.log(`[lideres] Filter check - Team ${team.name}: manager=${team.managerId}, isManager=${isManager}, isSeller=${isSeller}`)
              return isManager || isSeller
            })
        
        console.log("[lideres] Filtered teams count:", filtered.length)
        console.log("[lideres] Filtered teams:", filtered)
        
      } catch (error) {
        console.error("[lideres] Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [userKeycloakId, authLoading, isAdmin, user])

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor)
  }

  const calcularPercentualMeta = (vendas: number, meta: number) => {
    return meta > 0 ? Math.round((vendas / meta) * 100) : 0
  }

  const obterCorStatus = (taxaConversao: number) => {
    if (taxaConversao >= 80) return "text-green-600"
    if (taxaConversao >= 60) return "text-blue-600"
    if (taxaConversao >= 40) return "text-yellow-600"
    return "text-red-600"
  }

  const obterIconeStatus = (taxaConversao: number) => {
    if (taxaConversao >= 80) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (taxaConversao >= 60) return <TrendingUp className="h-4 w-4 text-blue-600" />
    if (taxaConversao >= 40) return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    return <TrendingDown className="h-4 w-4 text-red-600" />
  }

  const getStatusLabel = (taxaConversao: number) => {
    if (taxaConversao >= 80) return "excelente"
    if (taxaConversao >= 60) return "bom"
    if (taxaConversao >= 40) return "atenção"
    return "crítico"
  }

  const totalVendas = gruposPermitidos.reduce((acc, grupo) => acc + grupo.totalVendas, 0)
  const totalMetas = gruposPermitidos.reduce((acc, grupo) => acc + (grupo.quota || 0), 0)
  const totalVendedores = gruposPermitidos.reduce((acc, grupo) => acc + (grupo.sellers?.length || 0), 0)
  const mediaPerformance = totalMetas > 0 ? calcularPercentualMeta(totalVendas, totalMetas) : 0
  const totalOportunidades = gruposPermitidos.reduce((acc, grupo) => acc + grupo.totalOportunidades, 0)

  // Calculate distribution of performance
  const calcularDistribuicaoStatus = () => {
    if (gruposPermitidos.length === 0) {
      return [
        { name: "Excelente", value: 0, color: "#22c55e" },
        { name: "Bom", value: 0, color: "#3b82f6" },
        { name: "Atenção", value: 0, color: "#f59e0b" },
        { name: "Crítico", value: 0, color: "#ef4444" },
      ]
    }

    const total = gruposPermitidos.length
    const excelente = gruposPermitidos.filter(g => g.taxaConversao >= 80).length
    const bom = gruposPermitidos.filter(g => g.taxaConversao >= 60 && g.taxaConversao < 80).length
    const atencao = gruposPermitidos.filter(g => g.taxaConversao >= 40 && g.taxaConversao < 60).length
    const critico = gruposPermitidos.filter(g => g.taxaConversao < 40).length

    return [
      { name: "Excelente", value: Math.round((excelente / total) * 100), color: "#22c55e" },
      { name: "Bom", value: Math.round((bom / total) * 100), color: "#3b82f6" },
      { name: "Atenção", value: Math.round((atencao / total) * 100), color: "#f59e0b" },
      { name: "Crítico", value: Math.round((critico / total) * 100), color: "#ef4444" },
    ]
  }

  const distribuicaoStatus = calcularDistribuicaoStatus()

  if (authLoading || loading) {
    return (
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard Líderes</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
        </div>
      </SidebarInset>
    )
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard Líderes</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Crown className="h-8 w-8 text-yellow-500" />
              {isAdmin ? "Dashboard de Líderes" : "Meu Dashboard de Liderança"}
            </h1>
            <p className="text-muted-foreground">
              {isAdmin
                ? "Visão executiva para líderes de grupos de vendas"
                : `Gerencie seu grupo${gruposPermitidos.length > 0 ? `: ${gruposPermitidos[0]?.name || ""}` : ""}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={periodoSelecionado} onValueChange={setPeriodoSelecionado}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semana">Semana</SelectItem>
                <SelectItem value="mes">Mês</SelectItem>
                <SelectItem value="trimestre">Trimestre</SelectItem>
                <SelectItem value="ano">Ano</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        {isLeader && !isAdmin && gruposPermitidos.length === 0 && (
          <Card>
            <CardHeader className="text-center">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
              <CardTitle>Nenhum Grupo Atribuído</CardTitle>
              <CardDescription>
                Você ainda não foi designado como líder de nenhum grupo. Entre em contato com o administrador.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {gruposPermitidos.length > 0 && (
          <>
            {/* KPIs Principais */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Performance Geral</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mediaPerformance}%</div>
                  <p className="text-xs text-muted-foreground">
                    {formatarMoeda(totalVendas)} de {formatarMoeda(totalMetas)}
                  </p>
                  <Progress value={Math.min(mediaPerformance, 100)} className="mt-2" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {isAdmin ? "Vendedores Liderados" : "Meus Vendedores"}
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalVendedores}</div>
                  <p className="text-xs text-muted-foreground">
                    {gruposPermitidos.filter(g => g.active).length} grupos ativos
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {isAdmin ? "Grupos Gerenciados" : "Meu Grupo"}
                  </CardTitle>
                  <Crown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{gruposPermitidos.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {totalOportunidades} oportunidades no total
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatarMoeda(
                      gruposPermitidos.length > 0 
                        ? gruposPermitidos.reduce((acc, g) => acc + g.ticketMedio, 0) / gruposPermitidos.length
                        : 0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isAdmin ? "Média dos grupos" : "Do seu grupo"}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Performance dos Grupos */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {isAdmin ? "Performance dos Grupos" : "Performance do Meu Grupo"}
                  </CardTitle>
                  <CardDescription>
                    {isAdmin
                      ? "Acompanhe o desempenho de cada equipe"
                      : "Acompanhe o desempenho da sua equipe"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {gruposPermitidos.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum grupo encontrado
                    </p>
                  ) : (
                    gruposPermitidos.map((grupo) => {
                      const percentualMeta = calcularPercentualMeta(grupo.totalVendas, grupo.quota || 0)
                      return (
                        <div key={grupo.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-blue-500" />
                              <span className="font-medium">{grupo.name || grupo.code}</span>
                              <Badge variant="outline">{grupo.sellers?.length || 0} vendedores</Badge>
                              {!isAdmin && (
                                <Badge variant="secondary" className="text-xs">
                                  <Crown className="h-3 w-3 mr-1" />
                                  Seu Grupo
                                </Badge>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{percentualMeta}%</div>
                              <div className="text-xs text-muted-foreground">{formatarMoeda(grupo.totalVendas)}</div>
                            </div>
                          </div>
                          <Progress value={Math.min(percentualMeta, 100)} />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Meta: {formatarMoeda(grupo.quota || 0)}</span>
                            <span className={grupo.taxaConversao >= 60 ? "text-green-600" : "text-yellow-600"}>
                              Taxa Conversão: {grupo.taxaConversao.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </CardContent>
              </Card>

              {/* Distribuição de Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Performance</CardTitle>
                  <CardDescription>Status dos vendedores por categoria</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={distribuicaoStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {distribuicaoStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {distribuicaoStatus.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm">
                          {item.name}: {item.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="performance" className="w-full">
              <TabsList>
                <TabsTrigger value="performance">Performance Individual</TabsTrigger>
                <TabsTrigger value="tendencias">Tendências</TabsTrigger>
                <TabsTrigger value="atividades">Atividades</TabsTrigger>
                <TabsTrigger value="acoes">Próximas Ações</TabsTrigger>
                <TabsTrigger value="gerenciamento">Gerenciamento</TabsTrigger>
              </TabsList>

              <TabsContent value="performance">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance dos Grupos</CardTitle>
                    <CardDescription>Acompanhe o desempenho detalhado de cada grupo</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {gruposPermitidos.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Nenhum grupo encontrado
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Grupo</TableHead>
                            <TableHead>Vendedores</TableHead>
                            <TableHead>Vendas</TableHead>
                            <TableHead>Meta</TableHead>
                            <TableHead>Conversão</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Ação</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {gruposPermitidos.map((grupo) => {
                            const percentualMeta = calcularPercentualMeta(grupo.totalVendas, grupo.quota || 0)
                            
                            return (
                              <TableRow key={grupo.id}>
                                <TableCell className="font-medium">{grupo.name || grupo.code}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{grupo.sellers?.length || 0}</Badge>
                                </TableCell>
                                <TableCell>{formatarMoeda(grupo.totalVendas)}</TableCell>
                                <TableCell>{formatarMoeda(grupo.quota || 0)}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 bg-muted rounded-full h-2">
                                      <div
                                        className="bg-primary h-2 rounded-full"
                                        style={{ width: `${Math.min(grupo.taxaConversao, 100)}%` }}
                                      />
                                    </div>
                                    <span className="text-sm">{grupo.taxaConversao.toFixed(0)}%</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {obterIconeStatus(grupo.taxaConversao)}
                                    <span className={`text-sm ${obterCorStatus(grupo.taxaConversao)}`}>
                                      {getStatusLabel(grupo.taxaConversao)}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Button variant="outline" size="sm" onClick={() => window.location.href = `/grupos?id=${grupo.id}`}>
                                    <Users className="mr-2 h-4 w-4" />
                                    Ver
                                  </Button>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tendencias">
                <Card>
                  <CardHeader>
                    <CardTitle>Visão Geral das Oportunidades</CardTitle>
                    <CardDescription>Status das oportunidades nos seus grupos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-blue-600">Abertas</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {gruposPermitidos.reduce((sum, g) => sum + g.oportunidadesAbertas, 0)}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Em negociação
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-green-600">Ganhas</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {gruposPermitidos.reduce((sum, g) => sum + g.oportunidadesGanhas, 0)}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatarMoeda(totalVendas)} em vendas
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-red-600">Perdidas</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {gruposPermitidos.reduce((sum, g) => sum + g.oportunidadesPerdidas, 0)}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Oportunidades não convertidas
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="text-sm font-medium mb-4">Performance por Grupo</h4>
                      <div className="space-y-4">
                        {gruposPermitidos.map((grupo) => (
                          <div key={grupo.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium">{grupo.name || grupo.code}</h5>
                              <Badge variant="outline">{grupo.taxaConversao.toFixed(1)}% conversão</Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Abertas</span>
                                <div className="font-medium text-blue-600">{grupo.oportunidadesAbertas}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Ganhas</span>
                                <div className="font-medium text-green-600">{grupo.oportunidadesGanhas}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Perdidas</span>
                                <div className="font-medium text-red-600">{grupo.oportunidadesPerdidas}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="atividades">
                <Card>
                  <CardHeader>
                    <CardTitle>Resumo de Atividades</CardTitle>
                    <CardDescription>Visão geral das atividades dos seus grupos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {gruposPermitidos.map((grupo) => (
                        <div key={grupo.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Crown className="h-5 w-5 text-yellow-500" />
                              <h4 className="font-semibold">{grupo.name || grupo.code}</h4>
                              {!isAdmin && (
                                <Badge variant="secondary" className="text-xs">Seu Grupo</Badge>
                              )}
                            </div>
                            <Badge variant="outline">{grupo.sellers?.length || 0} vendedores</Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 bg-muted/50 rounded">
                              <div className="text-2xl font-bold text-blue-600">{grupo.oportunidadesAbertas}</div>
                              <div className="text-xs text-muted-foreground mt-1">Abertas</div>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded">
                              <div className="text-2xl font-bold text-green-600">{grupo.oportunidadesGanhas}</div>
                              <div className="text-xs text-muted-foreground mt-1">Ganhas</div>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded">
                              <div className="text-2xl font-bold">{formatarMoeda(grupo.totalVendas)}</div>
                              <div className="text-xs text-muted-foreground mt-1">Total Vendas</div>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded">
                              <div className="text-2xl font-bold">{grupo.taxaConversao.toFixed(0)}%</div>
                              <div className="text-xs text-muted-foreground mt-1">Conversão</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="acoes">
                <Card>
                  <CardHeader>
                    <CardTitle>Ações de Gestão</CardTitle>
                    <CardDescription>Identifique pontos de atenção e ações recomendadas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {gruposPermitidos.map((grupo) => {
                        const needsAttention = grupo.taxaConversao < 50
                        const needsQuota = !grupo.quota || grupo.quota === 0
                        const hasNoSellers = !grupo.sellers || grupo.sellers.length === 0
                        
                        const actions = []
                        
                        if (hasNoSellers) {
                          actions.push({
                            titulo: `Adicionar vendedores ao grupo ${grupo.name}`,
                            prioridade: "alta",
                            descricao: "Grupo sem vendedores atribuídos"
                          })
                        }
                        
                        if (needsQuota) {
                          actions.push({
                            titulo: `Definir meta para ${grupo.name}`,
                            prioridade: "media",
                            descricao: "Grupo sem meta definida"
                          })
                        }
                        
                        if (needsAttention && !hasNoSellers) {
                          actions.push({
                            titulo: `Revisar performance de ${grupo.name}`,
                            prioridade: "alta",
                            descricao: `Taxa de conversão baixa: ${grupo.taxaConversao.toFixed(1)}%`
                          })
                        }
                        
                        if (grupo.oportunidadesAbertas > 10) {
                          actions.push({
                            titulo: `Acompanhar oportunidades abertas em ${grupo.name}`,
                            prioridade: "media",
                            descricao: `${grupo.oportunidadesAbertas} oportunidades aguardando fechamento`
                          })
                        }
                        
                        return actions.map((acao, idx) => (
                          <div key={`${grupo.id}-${idx}`} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  acao.prioridade === "alta"
                                    ? "bg-red-500"
                                    : acao.prioridade === "media"
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                                }`}
                              />
                              <div>
                                <span className="font-medium">{acao.titulo}</span>
                                <div className="flex items-center gap-2 mt-1">
                                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">{acao.descricao}</span>
                                </div>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Resolver
                            </Button>
                          </div>
                        ))
                      })}
                      
                      {gruposPermitidos.every(g => 
                        g.sellers && g.sellers.length > 0 && g.quota && g.taxaConversao >= 50
                      ) && (
                        <div className="text-center py-8 text-muted-foreground">
                          <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                          <p>Todos os grupos estão funcionando bem!</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="gerenciamento">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Gerenciar Grupos</CardTitle>
                      <CardDescription>Administre seus grupos de vendas</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {gruposPermitidos.map((grupo) => {
                        const percentualMeta = calcularPercentualMeta(grupo.totalVendas, grupo.quota || 0)
                        return (
                          <div key={grupo.id} className="p-4 border rounded-lg space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-blue-500" />
                                <h3 className="font-semibold">{grupo.name || grupo.code}</h3>
                                <Badge variant="outline">{grupo.sellers?.length || 0} membros</Badge>
                                {!isAdmin && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Crown className="h-3 w-3 mr-1" />
                                    Seu Grupo
                                  </Badge>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => window.location.href = `/grupos?id=${grupo.id}`}>
                                  <Users className="mr-2 h-4 w-4" />
                                  Gerenciar
                                </Button>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Vendas</span>
                                <div className="font-medium">{formatarMoeda(grupo.totalVendas)}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Meta</span>
                                <div className="font-medium">{formatarMoeda(grupo.quota || 0)}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Performance</span>
                                <div
                                  className={`font-medium ${percentualMeta >= 100 ? "text-green-600" : percentualMeta >= 80 ? "text-blue-600" : "text-yellow-600"}`}
                                >
                                  {percentualMeta}%
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" className="text-blue-600">
                                <Target className="mr-2 h-4 w-4" />
                                Ajustar Meta
                              </Button>
                              <Button variant="ghost" size="sm" className="text-green-600">
                                <Award className="mr-2 h-4 w-4" />
                                Reconhecimento
                              </Button>
                              {grupo.oportunidadesAbertas > 5 && (
                                <Button variant="ghost" size="sm" className="text-orange-600">
                                  <AlertTriangle className="mr-2 h-4 w-4" />
                                  Revisar Pipeline
                                </Button>
                              )}
                            </div>
                          </div>
                        )
                      })}

                      {isAdmin && (
                        <Button className="w-full bg-transparent" variant="outline" onClick={() => window.location.href = '/grupos'}>
                          <Users className="mr-2 h-4 w-4" />
                          Gerenciar Todos os Grupos
                        </Button>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Ações Rápidas</CardTitle>
                      <CardDescription>Ferramentas de gestão para líderes</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button 
                        className="w-full justify-start bg-transparent" 
                        variant="outline"
                        onClick={() => window.location.href = '/grupos'}
                      >
                        <Target className="mr-2 h-4 w-4" />
                        Definir Metas de Grupos
                      </Button>
                      <Button 
                        className="w-full justify-start bg-transparent" 
                        variant="outline"
                        onClick={() => window.location.href = '/pipeline'}
                      >
                        <Activity className="mr-2 h-4 w-4" />
                        Ver Pipeline Completo
                      </Button>
                      <Button 
                        className="w-full justify-start bg-transparent" 
                        variant="outline"
                        onClick={() => window.location.href = '/tarefas'}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Gerenciar Tarefas
                      </Button>
                      <Button 
                        className="w-full justify-start bg-transparent" 
                        variant="outline"
                        onClick={() => window.location.href = '/relatorios'}
                      >
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Relatórios Detalhados
                      </Button>
                      {isAdmin && (
                        <Button 
                          className="w-full justify-start bg-transparent" 
                          variant="outline"
                          onClick={() => window.location.href = '/vendedores'}
                        >
                          <Users className="mr-2 h-4 w-4" />
                          Gerenciar Vendedores
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Resumo Executivo</CardTitle>
                    <CardDescription>Visão consolidada da performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-3xl font-bold text-blue-600">
                          {gruposPermitidos.reduce((sum, g) => sum + g.totalOportunidades, 0)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">Total Oportunidades</div>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-3xl font-bold text-green-600">
                          {gruposPermitidos.reduce((sum, g) => sum + g.oportunidadesGanhas, 0)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">Oportunidades Ganhas</div>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-3xl font-bold">
                          {formatarMoeda(totalVendas)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">Vendas Totais</div>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-3xl font-bold">
                          {gruposPermitidos.length > 0 
                            ? (gruposPermitidos.reduce((sum, g) => sum + g.taxaConversao, 0) / gruposPermitidos.length).toFixed(0)
                            : 0}%
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">Taxa Conversão Média</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </SidebarInset>
  )
}
