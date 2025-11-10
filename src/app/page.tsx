"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import {
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  MoreHorizontal,
  Phone,
  Mail,
  Calendar,
  BarChart3,
  Crown,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  Brain,
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Settings,
  Trash2,
  Edit,
} from "lucide-react"
import { useState, useEffect } from "react";
import { RoleGuard } from "@/components/role-guard"
import { useAuth } from "@/hooks/use-auth"
import { aiService, AIInsight } from "@/services/ai.service"
import { getTasks, getMyTasks } from "@/services/task-order-approval-invoice.service"
import { getTeams } from "@/services/team.service"
import { fetchData } from "@/lib/api"
import { listInvoices } from "@/services/invoice.service"
import { getOpportunities } from "@/services/opportunity.service"
import { getSellers } from "@/services/seller.service"

export default function CRMDashboard() {
  const { user, roles } = useAuth()
  const [isResumoExpanded, setIsResumoExpanded] = useState(true)
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([])
  const [loadingInsights, setLoadingInsights] = useState(false)
  const [insightsError, setInsightsError] = useState<string | null>(null)
  const [tarefasRapidas, setTarefasRapidas] = useState([
    { id: 1, titulo: "Adicionar Novo Cliente", icone: "Users", url: "/customers", cor: "blue", requiredRole: "manageCustomers" },
    { id: 2, titulo: "Agendar Ligação", icone: "Phone", url: "#", cor: "green", requiredRole: "manageTasks" },
    { id: 3, titulo: "Enviar Email", icone: "Mail", url: "#", cor: "purple", requiredRole: "manageTasks" },
    { id: 4, titulo: "Ver Calendário", icone: "Calendar", url: "#", cor: "orange", requiredRole: "manageTasks" },
    { id: 5, titulo: "Ver Análises", icone: "BarChart3", url: "/analytics", cor: "red", requiredRole: "manageAnalytics" },
  ])
  const [novaTarefa, setNovaTarefa] = useState({ titulo: "", icone: "Users", url: "", cor: "blue", requiredRole: "manageTasks" })
  const [editandoTarefa, setEditandoTarefa] = useState<any>(null)

  // Métricas principais (cards)
  const [metrics, setMetrics] = useState({
    customers: 0,
    customersTrend: 0,
    revenue: 0,
    revenueTrend: 0,
    activeOpportunities: 0,
    activeOppTrend: 0,
    conversionRate: 0,
    conversionTrend: 0,
  })

  // Performance dos grupos
  const [gruposVendedores, setGruposVendedores] = useState<any[]>([])

  // Kanban tasks from backend (filtered by role)
  const [kanban, setKanban] = useState<{ pendentes: any[]; emAndamento: any[]; concluidas: any[] }>({
    pendentes: [],
    emAndamento: [],
    concluidas: [],
  })

  // Clientes recentes (dynamic)
  const [recentCustomers, setRecentCustomers] = useState<any[]>([])

  useEffect(() => {
    loadKanbanTasks()
    loadTopMetrics()
    loadTeamsPerformance()
    loadRecentCustomers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, Array.isArray(roles) ? roles.join("|") : ""]) // reload when user or roles change

  const loadKanbanTasks = async () => {
    try {
      const isAdmin = roles?.includes("admin") || roles?.includes("manageUsers") || roles?.includes("manageSettings")
      let tasks: any[] = []
      if (isAdmin) {
        tasks = await getTasks("", 0, 200)
      } else {
        let leaderTeamIds: number[] = []
        try {
          const teams = await getTeams("", 0, 200)
          leaderTeamIds = (teams || []).filter((t: any) => t?.managerId === user?.id).map((t: any) => t.id)
        } catch (_) {
          leaderTeamIds = []
        }
        if (leaderTeamIds.length > 0) {
          const all = await getTasks("", 0, 200)
          tasks = all.filter((t: any) => (t?.team?.id && leaderTeamIds.includes(t.team.id)) || t?.assigneeId === user?.id)
        } else {
          tasks = await getMyTasks("", 0, 200)
        }
      }

      const toView = (t: any) => ({
        id: t.id,
        titulo: t.title ?? t.titulo,
        descricao: t.description ?? t.descricao,
        responsavel: t?.team?.name ?? (t?.assignee ? [t.assignee?.firstName, t.assignee?.lastName].filter(Boolean).join(" ") : (t?.assigneeId ?? "")),
        prioridade: t?.priority === "HIGH" ? "Alta" : t?.priority === "LOW" ? "Baixa" : "Média",
        prazo: t?.dueDate ?? t?.prazo,
        status: t?.status,
      })

      const pendentes = tasks.filter((t: any) => t?.status === "PENDING").map(toView)
      const emAndamento = tasks.filter((t: any) => t?.status === "IN_PROGRESS").map(toView)
      const concluidas = tasks.filter((t: any) => t?.status === "DONE").map(toView)
      setKanban({ pendentes, emAndamento, concluidas })
    } catch (e) {
      console.error("Erro ao carregar tarefas:", e)
      setKanban({ pendentes: [], emAndamento: [], concluidas: [] })
    }
  }

  const loadTopMetrics = async () => {
    try {
      // Total de clientes
      const customersCountRaw = await fetchData<any>(`/customer/count`, { params: { t: "" } })
      const customers = typeof customersCountRaw === "number" ? customersCountRaw : Number(customersCountRaw) || 0

      // Receita dos últimos 30 dias
      const invoices = await listInvoices(0, 500, "")
      const now = Date.now()
      const windowMs = 30 * 24 * 3600 * 1000
      const recent = (invoices as any[]).filter((i) => {
        const d: any = (i as any).updatedAt ?? (i as any).issuanceDate ?? (i as any).createdAt
        return d ? now - new Date(d).getTime() <= windowMs : false
      })
      const revenue = recent.reduce((sum, i: any) => sum + (i.netAmount ?? i.total ?? 0), 0)

      // Oportunidades (ativas e taxa de conversão)
      const opps = await getOpportunities("", 0, 500)
      const active = (opps as any[]).filter((o: any) => o.status === "OPEN").length
      const won = (opps as any[]).filter((o: any) => o.status === "WON").length
      const totalOpp = (opps as any[]).length
      const conversion = totalOpp > 0 ? (won / totalOpp) * 100 : 0

      setMetrics((m) => ({
        ...m,
        customers,
        revenue,
        activeOpportunities: active,
        conversionRate: conversion,
      }))
    } catch (e) {
      console.error("Erro ao carregar métricas do topo:", e)
    }
  }

  const getIcone = (nomeIcone: string) => {
    const icones: Record<string, any> = {
      Users,
      Phone,
      Mail,
      Calendar,
      BarChart3,
      Settings,
      TrendingUp,
      DollarSign,
      Activity,
    }
    return icones[nomeIcone] || Users
  }

  // Carrega clientes recentes do backend
  const loadRecentCustomers = async () => {
    try {
      // usa listagem de clientes + ordenação local por createdAt/updatedAt quando disponível
      const customers: any[] = await fetchData<any[]>(`/customer`, { params: { page: 0, size: 10, t: "" } })
      const enriched = (customers || [])
        .map((c: any) => ({
          id: c.id,
          name: c.name || c.companyName || `Cliente ${c.id}`,
          email: c.primaryContactEmail || c.email || "",
          status: c.active === false ? "Inativo" : "Ativo",
          value: c.outstandingBalance != null ? `R$ ${Number(c.outstandingBalance).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "",
          avatar: (c.name || "").split(" ").map((s: string) => s[0]).slice(0, 2).join("") || "CL",
          createdAt: c.createdAt ?? 0,
        }))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, 8)

      setRecentCustomers(enriched)
    } catch (e) {
      console.error("Erro ao carregar clientes recentes:", e)
      setRecentCustomers([])
    }
  }

  // Carrega performance dos grupos com base nas invoices do mês e quota do time
  const loadTeamsPerformance = async () => {
    try {
      const isAdmin = roles?.includes("admin") || roles?.includes("manageUsers") || roles?.includes("manageSettings") || roles?.includes("manageTeams")
      const teams: any[] = await getTeams("", 0, 200)

      let filteredTeams: any[] = teams
      if (!isAdmin) {
        const leaderTeams = (teams || []).filter((t: any) => t?.managerId === user?.id)
        if (leaderTeams.length > 0) {
          filteredTeams = leaderTeams
        } else {
          // vendedor comum: mostrar somente times em que participa
          let sellerId: any = null
          try {
            const sellers: any[] = await getSellers("", 0, 500)
            const me = sellers.find((s: any) => s?.user?.id === user?.id || s?.userId === user?.id)
            sellerId = me?.id ?? null
          } catch (_) {
            sellerId = null
          }
          filteredTeams = sellerId == null ? [] : (teams || []).filter((t: any) => {
            const sellerIds: any[] = Array.isArray(t?.sellers) ? t.sellers.map((s: any) => (typeof s === "object" ? s?.id : s)).filter(Boolean) : []
            return sellerIds.includes(sellerId as any)
          })
        }
      }

      const invoices: any[] = await listInvoices(0, 1000, "")
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()

      // Buscar sellers uma vez para mapear managerId -> nome
      let sellersCache: any[] = []
      try { sellersCache = await getSellers("", 0, 500) } catch (_) { sellersCache = [] }
      const resolveLeader = (uid: any) => {
        const s = sellersCache.find((x: any) => x?.user?.id === uid || x?.userId === uid)
        if (s) {
          const full = [s.user?.firstName, s.user?.lastName].filter(Boolean).join(" ")
          return full || s.name || s.nickname || s.user?.email || uid
        }
        // Se uid parecer UUID, retorna '-' para evitar mostrar ID cru
        if (typeof uid === 'string' && /[0-9a-fA-F-]{30,}/.test(uid)) return '-'
        return uid || '-'
      }

      const perf = filteredTeams.map((t: any) => {
        const sellerIds: any[] = Array.isArray(t?.sellers) ? t.sellers.map((s: any) => (typeof s === "object" ? s?.id : s)).filter(Boolean) : []
        const sold = invoices.filter((i: any) => {
          const when = i.updatedAt ?? i.issuanceDate ?? i.createdAt
          const ts = when ? new Date(when).getTime() : 0
          return ts >= monthStart && (sellerIds.length === 0 || sellerIds.includes(i.sellerId))
        }).reduce((sum: number, i: any) => sum + (i.netAmount ?? i.total ?? 0), 0)
        const quota = Number(t.quota ?? 0)
        const performance = quota > 0 ? (sold / quota) * 100 : 0

        return {
          id: t.id,
          nome: t.name ?? t.nome ?? t.code,
          administrador: resolveLeader(t.managerId),
          membros: sellerIds.length,
          metaMensal: quota,
          vendidoMes: sold,
          performance: Number.isFinite(performance) ? Number(performance.toFixed(1)) : 0,
          status: t.active ? "Ativo" : "Inativo",
        }
      })

      setGruposVendedores(perf)
    } catch (e) {
      console.error("Erro ao carregar performance dos grupos:", e)
      setGruposVendedores([])
    }
  }

  const adicionarTarefaRapida = () => {
    if (novaTarefa.titulo.trim()) {
      const novaId = Math.max(...tarefasRapidas.map((t) => t.id)) + 1
      setTarefasRapidas([...tarefasRapidas, { ...novaTarefa, id: novaId }])
      setNovaTarefa({ titulo: "", icone: "Users", url: "", cor: "blue", requiredRole: "manageTasks" })
    }
  }

  const removerTarefaRapida = (id: number) => {
    setTarefasRapidas(tarefasRapidas.filter((t) => t.id !== id))
  }

  const editarTarefaRapida = (tarefa: any) => {
    setEditandoTarefa(tarefa)
    setNovaTarefa({ titulo: tarefa.titulo, icone: tarefa.icone, url: tarefa.url, cor: tarefa.cor, requiredRole: tarefa.requiredRole || "manageTasks" })
  }

  const salvarEdicao = () => {
    if (novaTarefa.titulo.trim() && editandoTarefa) {
      setTarefasRapidas(
        tarefasRapidas.map((t) => (t.id === editandoTarefa.id ? { ...editandoTarefa, ...novaTarefa } : t)),
      )
      setEditandoTarefa(null)
      setNovaTarefa({ titulo: "", icone: "Users", url: "", cor: "blue", requiredRole: "manageTasks" })
    }
  }

  // Carregar insights de IA
  useEffect(() => {
    loadAIInsights()
  }, [])

  const loadAIInsights = async () => {
    setLoadingInsights(true)
    setInsightsError(null)
    try {
      const response = await aiService.getDashboardInsights()
      setAiInsights(response.insights)
    } catch (error) {
      console.error("Erro ao carregar insights:", error)
      setInsightsError("Não foi possível carregar os insights de IA")
      // Fallback para dados mockados
      setAiInsights([
        {
          type: "info",
          title: "📊 Sistema Iniciando",
          message: "Continue registrando vendas e oportunidades para gerar insights personalizados baseados em seus dados reais."
        }
      ])
    } finally {
      setLoadingInsights(false)
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-green-600 dark:text-green-400"
      case "warning":
        return "text-orange-600 dark:text-orange-400"
      case "error":
        return "text-red-600 dark:text-red-400"
      default:
        return "text-blue-600 dark:text-blue-400"
    }
  }

  // gruposVendedores agora vem do backend via loadTeamsPerformance()

  // Removido Kanban hardcoded: agora usamos estado 'kanban' carregado dinamicamente do backend

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <RoleGuard requiredRole="manageAnalytics">
          <Collapsible open={isResumoExpanded} onOpenChange={setIsResumoExpanded}>
            <Card className="mb-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-200/20">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-background/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-500" />
                      <div>
                        <CardTitle className="text-foreground flex items-center gap-2">
                          Resumo Diário IA
                          <Sparkles className="h-4 w-4 text-purple-500" />
                        </CardTitle>
                        <CardDescription>
                          Insights gerados automaticamente - {new Date().toLocaleDateString("pt-BR")}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation()
                          loadAIInsights()
                        }}
                        disabled={loadingInsights}
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loadingInsights ? 'animate-spin' : ''}`} />
                        Atualizar
                      </Button>
                      {isResumoExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  {loadingInsights ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
                      <span className="ml-3 text-muted-foreground">Analisando dados...</span>
                    </div>
                  ) : insightsError ? (
                    <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                      <h4 className="font-medium text-sm mb-2 text-red-600">❌ Erro ao Carregar</h4>
                      <p className="text-sm text-muted-foreground">{insightsError}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {aiInsights.map((insight, index) => (
                        <div key={index} className="p-4 bg-background/50 rounded-lg border border-border/50">
                          <h4 className={`font-medium text-sm mb-2 ${getInsightColor(insight.type)}`}>
                            {insight.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {insight.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </RoleGuard>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total de Clientes */}
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{metrics.customers}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">{metrics.customersTrend >= 0 ? `+${metrics.customersTrend}%` : `${metrics.customersTrend}%`}</span> do mês passado
              </p>
            </CardContent>
          </Card>

          {/* Receita */}
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Receita</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">R$ {metrics.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">{metrics.revenueTrend >= 0 ? `+${metrics.revenueTrend}%` : `${metrics.revenueTrend}%`}</span> do mês passado
              </p>
            </CardContent>
          </Card>

          {/* Negócios Ativos */}
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-200/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Negócios Ativos</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{metrics.activeOpportunities}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">{metrics.activeOppTrend >= 0 ? `+${metrics.activeOppTrend}%` : `${metrics.activeOppTrend}%`}</span> do mês passado
              </p>
            </CardContent>
          </Card>

          {/* Taxa de Conversão */}
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Conversão</CardTitle>
              <Activity className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{metrics.conversionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">{metrics.conversionTrend >= 0 ? `+${metrics.conversionTrend}%` : `${metrics.conversionTrend}%`}</span> do mês passado
              </p>
            </CardContent>
          </Card>
        </div>

        <RoleGuard requiredRole="manageTeams">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">Performance dos Grupos</CardTitle>
                  <CardDescription>Acompanhamento das equipes de vendas</CardDescription>
                </div>
                <RoleGuard requiredRole="manageSellers">
                  <Link href="/vendedores">
                    <Button variant="outline" size="sm">
                      Gerenciar Grupos
                    </Button>
                  </Link>
                </RoleGuard>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {gruposVendedores
                  .map((grupo) => (
                    <Card key={grupo.id} className="border-border">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium">{grupo.nome}</CardTitle>
                          <Badge
                            variant={
                              grupo.performance >= 100
                                ? "default"
                                : grupo.performance >= 80
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {grupo.performance}%
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Crown className="h-3 w-3" />
                          {grupo.administrador}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Membros:</span>
                            <span className="font-medium">{grupo.membros}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Meta:</span>
                            <span className="font-medium">R$ {grupo.metaMensal.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Vendido:</span>
                            <span className="font-medium">R$ {grupo.vendidoMes.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 mt-2">
                            <div
                              className={`h-2 rounded-full ${grupo.performance >= 100 ? "bg-green-500" : grupo.performance >= 80 ? "bg-yellow-500" : "bg-red-500"}`}
                              style={{ width: `${Math.min(grupo.performance, 100)}%` }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </RoleGuard>

        <RoleGuard requiredRole="manageTasks">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">Kanban de Tarefas</CardTitle>
                  <CardDescription>Resumo das tarefas em andamento</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Link href="/tarefas">
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                  </Link>
                  <RoleGuard requiredRole="manageTasks">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Nova Tarefa
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Criar Nova Tarefa</DialogTitle>
                          <DialogDescription>Atribua uma tarefa para um vendedor ou grupo específico</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="titulo">Título</Label>
                            <Input id="titulo" placeholder="Digite o título da tarefa" />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="descricao">Descrição</Label>
                            <Textarea id="descricao" placeholder="Descreva a tarefa" />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="responsavel">Responsável</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o responsável" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="equipe-norte">Equipe Norte</SelectItem>
                                <SelectItem value="equipe-sul">Equipe Sul</SelectItem>
                                <SelectItem value="equipe-digital">Equipe Digital</SelectItem>
                                <SelectItem value="joao-silva">João Silva</SelectItem>
                                <SelectItem value="ana-costa">Ana Costa</SelectItem>
                                <SelectItem value="pedro-santos">Pedro Santos</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="prioridade">Prioridade</Label>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Prioridade" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="baixa">Baixa</SelectItem>
                                  <SelectItem value="media">Média</SelectItem>
                                  <SelectItem value="alta">Alta</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="prazo">Prazo</Label>
                              <Input id="prazo" type="date" />
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit">Criar Tarefa</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </RoleGuard>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <h3 className="font-medium">Pendentes ({kanban.pendentes.length})</h3>
                  </div>
                  <div className="space-y-3">
                    {kanban.pendentes.map((tarefa) => (
                      <Card key={tarefa.id} className="border-l-4 border-l-orange-500">
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium text-sm">{tarefa.titulo}</h4>
                              <Badge
                                variant={
                                  tarefa.prioridade === "Alta"
                                    ? "destructive"
                                    : tarefa.prioridade === "Média"
                                      ? "secondary"
                                      : "outline"
                                }
                                className="text-xs"
                              >
                                {tarefa.prioridade}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{tarefa.descricao}</p>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">{tarefa.responsavel}</span>
                              <span className="text-muted-foreground">
                                {new Date(tarefa.prazo).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-500" />
                    <h3 className="font-medium">Em Andamento ({kanban.emAndamento.length})</h3>
                  </div>
                  <div className="space-y-3">
                    {kanban.emAndamento.map((tarefa) => (
                      <Card key={tarefa.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium text-sm">{tarefa.titulo}</h4>
                              <Badge
                                variant={
                                  tarefa.prioridade === "Alta"
                                    ? "destructive"
                                    : tarefa.prioridade === "Média"
                                      ? "secondary"
                                      : "outline"
                                }
                                className="text-xs"
                              >
                                {tarefa.prioridade}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{tarefa.descricao}</p>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">{tarefa.responsavel}</span>
                              <span className="text-muted-foreground">
                                {new Date(tarefa.prazo).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <h3 className="font-medium">Concluídas ({kanban.concluidas.length})</h3>
                  </div>
                  <div className="space-y-3">
                    {kanban.concluidas.map((tarefa) => (
                      <Card key={tarefa.id} className="border-l-4 border-l-green-500 opacity-75">
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium text-sm line-through">{tarefa.titulo}</h4>
                              <Badge variant="outline" className="text-xs">
                                {tarefa.prioridade}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{tarefa.descricao}</p>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">{tarefa.responsavel}</span>
                              <span className="text-muted-foreground">
                                {new Date(tarefa.prazo).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </RoleGuard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RoleGuard requiredRole="manageCustomers">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground">Clientes Recentes</CardTitle>
                    <CardDescription>Últimos clientes adicionados ou atualizados</CardDescription>
                  </div>
                  <Link href="/customers">
                    <Button variant="outline" size="sm">
                      Ver Todos
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {customer.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">{customer.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            customer.status === "Ativo"
                              ? "default"
                              : customer.status === "Lead"
                                ? "secondary"
                                : "outline"
                          }
                          className="text-xs"
                        >
                          {customer.status}
                        </Badge>
                        <span className="font-medium text-foreground">{customer.value}</span>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </RoleGuard>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">Ações Rápidas</CardTitle>
                  <CardDescription>Tarefas comuns e atalhos personalizados</CardDescription>
                </div>
                <RoleGuard requiredRole="manageSettings">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Personalizar
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Personalizar Ações Rápidas</DialogTitle>
                        <DialogDescription>Adicione, edite ou remova ações rápidas personalizadas</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div className="grid gap-4 p-4 border rounded-lg">
                          <h4 className="font-medium">{editandoTarefa ? "Editar Ação" : "Nova Ação Rápida"}</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="titulo-tarefa">Título</Label>
                              <Input
                                id="titulo-tarefa"
                                value={novaTarefa.titulo}
                                onChange={(e) => setNovaTarefa({ ...novaTarefa, titulo: e.target.value })}
                                placeholder="Nome da ação"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="url-tarefa">URL/Link</Label>
                              <Input
                                id="url-tarefa"
                                value={novaTarefa.url}
                                onChange={(e) => setNovaTarefa({ ...novaTarefa, url: e.target.value })}
                                placeholder="/pagina ou #"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="icone-tarefa">Ícone</Label>
                              <Select
                                value={novaTarefa.icone}
                                onValueChange={(value) => setNovaTarefa({ ...novaTarefa, icone: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Users">Usuários</SelectItem>
                                  <SelectItem value="Phone">Telefone</SelectItem>
                                  <SelectItem value="Mail">Email</SelectItem>
                                  <SelectItem value="Calendar">Calendário</SelectItem>
                                  <SelectItem value="BarChart3">Gráfico</SelectItem>
                                  <SelectItem value="Settings">Configurações</SelectItem>
                                  <SelectItem value="TrendingUp">Tendência</SelectItem>
                                  <SelectItem value="DollarSign">Dinheiro</SelectItem>
                                  <SelectItem value="Activity">Atividade</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="cor-tarefa">Cor</Label>
                              <Select
                                value={novaTarefa.cor}
                                onValueChange={(value) => setNovaTarefa({ ...novaTarefa, cor: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="blue">Azul</SelectItem>
                                  <SelectItem value="green">Verde</SelectItem>
                                  <SelectItem value="purple">Roxo</SelectItem>
                                  <SelectItem value="orange">Laranja</SelectItem>
                                  <SelectItem value="red">Vermelho</SelectItem>
                                  <SelectItem value="gray">Cinza</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {editandoTarefa ? (
                              <>
                                <Button onClick={salvarEdicao} size="sm">
                                  Salvar Alterações
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditandoTarefa(null)
                                    setNovaTarefa({ titulo: "", icone: "Users", url: "", cor: "blue", requiredRole: "manageTasks" })
                                  }}
                                >
                                  Cancelar
                                </Button>
                              </>
                            ) : (
                              <Button onClick={adicionarTarefaRapida} size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Adicionar Ação
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium">Ações Atuais</h4>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {tarefasRapidas.map((tarefa) => {
                              const IconeComponent = getIcone(tarefa.icone)
                              return (
                                <div
                                  key={tarefa.id}
                                  className="flex items-center justify-between p-3 border rounded-lg"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg bg-${tarefa.cor}-100 text-${tarefa.cor}-600`}>
                                      <IconeComponent className="h-4 w-4" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-sm">{tarefa.titulo}</p>
                                      <p className="text-xs text-muted-foreground">{tarefa.url || "#"}</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button variant="ghost" size="sm" onClick={() => editarTarefaRapida(tarefa)}>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => removerTarefaRapida(tarefa.id)}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </RoleGuard>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {tarefasRapidas
                .filter(tarefa => roles?.includes(tarefa.requiredRole))
                .map((tarefa) => {
                  const IconeComponent = getIcone(tarefa.icone)
                  const TarefaButton = ({ children, ...props }: any) => (
                    <Button className="w-full justify-start bg-transparent" variant="outline" {...props}>
                      {children}
                    </Button>
                  )

                  return tarefa.url && tarefa.url !== "#" ? (
                    <Link key={tarefa.id} href={tarefa.url}>
                      <TarefaButton>
                        <IconeComponent className="h-4 w-4 mr-2" />
                        {tarefa.titulo}
                      </TarefaButton>
                    </Link>
                  ) : (
                    <TarefaButton key={tarefa.id}>
                      <IconeComponent className="h-4 w-4 mr-2" />
                      {tarefa.titulo}
                    </TarefaButton>
                  )
                })}
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarInset>
  )
}
