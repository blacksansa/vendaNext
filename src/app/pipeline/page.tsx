"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Plus,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  Edit,
  Eye,
  ArrowRight,
  Target,
  Clock,
  Mail,
  Building,
  Phone,
  AlertCircle,
  Send,
  FileText,
  CheckCircle,
  MessageSquare,
  Bell,
  Search,
  MoreVertical,
  UserPlus,
  Star,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { ConditionalRender } from "@/components/conditional-render"
import { getOpportunities, updateOpportunity, createOpportunity } from "@/services/opportunity.service"
import { getTeams } from "@/services/team.service"
import { getSellers } from "@/services/seller.service"
import { listCustomers, createCustomer } from "@/services/customer.service"
import { getPipelines } from "@/services/pipeline.service"
import { getStagesByPipeline } from "@/services/stage.service"
import { Customer, Stage } from "@/lib/types"
import { toast } from 'sonner'
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, closestCorners, PointerSensor, useSensor, useSensors, DragOverlay, useDroppable } from "@dnd-kit/core"
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

function colorFromStage(color?: any) {
  if (typeof color === 'number') {
    const hex = '#' + (color >>> 0).toString(16).padStart(6, '0').slice(-6)
    return hex
  }
  if (typeof color === 'string') return color
  return '#666'
}

// Componente de Coluna Droppable
function DroppableColumn({ stage, children }: any) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id.toString(),
  })

  return (
    <div 
      ref={setNodeRef} 
      className="space-y-2 min-h-[500px]"
      style={{ 
        backgroundColor: isOver ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
        transition: 'background-color 0.2s'
      }}
    >
      {children}
    </div>
  )
}

// Componente de Card arrastável
function DraggableCard({ deal, stage, children, onClick }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: deal.id.toString(),
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        className="cursor-move hover:shadow-md transition-shadow border-l-4"
        style={{
          borderLeftColor:
            deal.priority === "alta" ? "#ef4444" : deal.priority === "media" ? "#f59e0b" : "#10b981",
        }}
        onClick={onClick}
      >
        {children}
      </Card>
    </div>
  )
}

export default function PipelinePage() {
  const { user: authUser, loading: authLoading } = useAuth()
  
  const [selectedDeal, setSelectedDeal] = useState<any>(null)
  const [isNewDealOpen, setIsNewDealOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editStageId, setEditStageId] = useState<number | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStage, setFilterStage] = useState<string>("all")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [customers, setCustomers] = useState<any[]>([])
  const [creatingOpportunity, setCreatingOpportunity] = useState(false)
  
  // Pipelines por grupos (times)
  const [pipelines, setPipelines] = useState<any[]>([])
  const [selectedPipelineId, setSelectedPipelineId] = useState<number | null>(null)
  const [stages, setStages] = useState<any[]>([])
  
  // Form states
  const [newOppData, setNewOppData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    companyName: "",
    value: 0,
    notes: "",
    priority: "media",
    origem: "",
  })
  
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))
  
  // Obter user de várias fontes
  const [user, setUser] = useState<any>(null)
  
  useEffect(() => {
    if (authUser) {
      setUser(authUser)
      return
    }
    
    try {
      const storedUser = localStorage.getItem('user') || localStorage.getItem('currentUser')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    } catch (e) {
      console.warn("[pipeline] erro ao ler user", e)
    }
  }, [authUser])
  
  const userId = user?.id || user?.sub || user?.userId || user?.email || null
  
  // Carregar pipelines e etapas do backend (por grupo)
  useEffect(() => {
    (async () => {
      try {
        const pls = await getPipelines("", 0, 100)
        setPipelines(pls)
        let selectedId: number | null = pls[0]?.id ?? null
        try {
          const params = new URLSearchParams(window.location.search)
          const qpPipelineId = params.get('pipelineId')
          const qpTeamId = params.get('teamId')
          if (qpPipelineId) {
            const pid = Number(qpPipelineId)
            if (pls.some(p => p.id === pid)) selectedId = pid
          } else if (qpTeamId) {
            const tid = Number(qpTeamId)
            const found = pls.find(p => Number(p.team?.id) === Number(tid))
            if (found) selectedId = found.id
          }
        } catch {}
        setSelectedPipelineId(selectedId)
        if (selectedId) {
          const st = await getStagesByPipeline(selectedId)
          setStages(st)
        } else {
          setStages([])
        }
      } catch (e) {
        console.error('[pipeline] erro ao carregar pipelines/etapas', e)
        setPipelines([])
        setStages([])
      }
    })()
  }, [])
  
  useEffect(() => {
    if (!selectedPipelineId) return
    ;(async () => {
      try {
        const st = await getStagesByPipeline(selectedPipelineId)
        setStages(st)
      } catch (e) {
        console.error('[pipeline] erro ao carregar etapas do pipeline', e)
        setStages([])
      }
    })()
  }, [selectedPipelineId])
  
  // Carregar oportunidades do backend
  useEffect(() => {
    if (authLoading) return
    if (!userId) {
      setLoading(false)
      return
    }
    
    loadOpportunities()
    loadCustomers()
  }, [userId, authLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadCustomers() {
    try {
      const allCustomers = await listCustomers(0, 100, "")
      setCustomers(allCustomers)
    } catch (error) {
      console.error("[pipeline] erro ao carregar customers", error)
    }
  }

  async function loadOpportunities() {
    if (!userId) {
      setLoading(false)
      return
    }
    
    setLoading(true)
    try {
      console.log("[pipeline] carregando todas as oportunidades")
      
      // Buscar todas as oportunidades (sem filtro)
      const allOpps = await getOpportunities("", 0, 100)
      
      console.log("[pipeline] total de oportunidades:", allOpps.length)
      
      setOpportunities(allOpps)
    } catch (error: any) {
      console.error("[pipeline] erro ao carregar", error)
      toast.error(error?.message ?? "Não foi possível carregar as oportunidades", { description: "Erro ao carregar pipeline" })
      setOpportunities([])
    } finally {
      setLoading(false)
    }
  }
  
  // Mapear oportunidades para formato de deals
  const deals = opportunities.map((opp) => ({
    id: opp.id,
    client: opp.customer?.name || "Cliente não informado",
    company: opp.customer?.tradingName || opp.customer?.name || "",
    value: opp.items?.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0) || 0,
    stage: opp.stage?.id || 1,
    status: opp.status === "WON" ? "ativo" : opp.status === "LOST" ? "perdido" : "novo",
    priority: "media", // Pode ser derivado de outras propriedades
    lastContact: opp.contactDate ? new Date(opp.contactDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    daysSinceContact: opp.contactDate ? Math.floor((Date.now() - opp.contactDate) / (1000 * 60 * 60 * 24)) : 0,
    nextAction: "Enviar proposta",
    probability: opp.status === "WON" ? 100 : opp.status === "LOST" ? 0 : 50,
    email: opp.customer?.email || "",
    phone: opp.customer?.phone || "",
    notes: opp.description || "",
    interactions: [], // Array vazio por padrão - pode ser populado com dados reais no futuro
    raw: opp, // Manter referência ao objeto original para updates
  }))
  
  // Atualizar métricas com dados reais
  const realStages = stages.map((stage: any) => ({
    ...stage,
    deals: deals.filter(d => d.stage === stage.id).length,
    value: deals.filter(d => d.stage === stage.id).reduce((sum, d) => sum + d.value, 0),
  }))

  const totalValue = realStages.reduce((sum: number, stage: any) => sum + (stage.value || 0), 0)
  const totalDeals = deals.length
  const leadsNeedingAttention = deals.filter((d) => d.daysSinceContact > 3).length

  const getDealsByStage = (stageId: number) => {
    return deals.filter((deal) => {
      const matchesStage = deal.stage === stageId
      const matchesSearch =
        deal.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.company.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesPriority = filterPriority === "all" || deal.priority === filterPriority
      return matchesStage && matchesSearch && matchesPriority
    })
  }

  const getFilteredDeals = () => {
    return deals.filter((deal) => {
      const matchesStage = filterStage === "all" || deal.stage.toString() === filterStage
      const matchesSearch =
        deal.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.company.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesPriority = filterPriority === "all" || deal.priority === filterPriority
      return matchesStage && matchesSearch && matchesPriority
    })
  }

  const getPriorityColor = (priority: string) => {
    if (priority === "alta") return "text-red-600 bg-red-50"
    if (priority === "media") return "text-yellow-600 bg-yellow-50"
    return "text-green-600 bg-green-50"
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
      novo: { label: "Novo", variant: "default" },
      em_nutricao: { label: "Em Nutrição", variant: "secondary" },
      proposta_enviada: { label: "Proposta Enviada", variant: "outline" },
      ativo: { label: "Ativo", variant: "default" },
    }
    const config = statusMap[status] || { label: status, variant: "secondary" }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const handleQuickAction = (dealId: number, action: string) => {
    console.log(`[v0] Ação rápida: ${action} para deal ${dealId}`)
    // Aqui você implementaria a lógica real
  }

  function handleDragStart(event: DragStartEvent) {
    console.log("[DND] Drag started:", event.active.id)
    setActiveId(event.active.id.toString())
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)

    console.log("[DND] Drag ended - active:", active.id, "over:", over?.id)

    if (!over) {
      console.log("[DND] No drop target")
      return
    }

    const dealId = parseInt(active.id.toString())
    const newStageId = parseInt(over.id.toString())

    console.log("[DND] Moving deal", dealId, "to stage", newStageId)

    // Atualizar localmente
    setOpportunities((prev) =>
      prev.map((opp) => (opp.id === dealId ? { ...opp, stage: { ...opp.stage, id: newStageId } } : opp))
    )

    // Atualizar no backend
    try {
      const opportunity = opportunities.find((o) => o.id === dealId)
      if (opportunity) {
        await updateOpportunity(dealId, { ...opportunity, stage: { id: newStageId } })
        toast.success("Oportunidade movida", { description: "Sucesso" })
      }
    } catch (error: any) {
      toast.error(error?.message, { description: "Erro" })
      loadOpportunities() // Recarregar em caso de erro
    }
  }

  async function handleCreateOpportunity() {
    if (!newOppData.customerName) {
      toast.error("Nome do cliente é obrigatório", { description: "Erro" })
      return
    }
    if (!selectedPipelineId) {
      toast.error("Selecione uma pipeline antes de criar", { description: "Erro" })
      return
    }
    if (!newOppData.value || Number(newOppData.value) <= 0) {
      toast.error("Informe um valor maior que zero", { description: "Valor obrigatório" })
      return
    }

    setCreatingOpportunity(true)
    try {
      // Buscar ou criar customer
      let customer = customers.find((c) => 
        c.name?.toLowerCase() === newOppData.customerName.toLowerCase()
      )

      if (!customer) {
        // Criar customer novo
        const customerData: any = {
          code: `CUST-${Date.now()}`,
          name: newOppData.customerName,
          companyName: newOppData.companyName || newOppData.customerName,
        }

        // Adicionar contatos se fornecidos
        if (newOppData.customerEmail || newOppData.customerPhone) {
          customerData.contacts = []
          if (newOppData.customerEmail) {
            customerData.contacts.push({
              type: { id: 1 },
              value: newOppData.customerEmail,
            })
          }
          if (newOppData.customerPhone) {
            customerData.contacts.push({
              type: { id: 2 },
              value: newOppData.customerPhone,
            })
          }
        }

        customer = await createCustomer(customerData)
      }

      if (!stages.length) {
        toast.error("Nenhuma etapa configurada para o pipeline selecionado.", { description: "Defina as etapas do pipeline" })
        setCreatingOpportunity(false)
        return
      }

      // Criar oportunidade com primeira etapa do pipeline selecionado
      const pipeline = pipelines.find(p => Number(p.id) === Number(selectedPipelineId))
      const teamId = pipeline?.team?.id || pipeline?.team_id || null
      // Tentar múltiplos payloads para compatibilidade com o backend
      const base = {
        customer: { id: customer.id } as Customer,
        stage: { id: stages[0].id } as Stage,
        contactDate: Date.now(),
      } as any
      const priceNum = Number(newOppData.value || 0)
      const item = { product: { id: 1 } as any, quantity: 1, price: priceNum, discount: 0 } as any
      const payloads: any[] = [
        { ...base, status: 0, pipelineId: pipeline ? Number(pipeline.id) : undefined, items: [item] },
      ]
      let newOpp: any = null
      let lastErr: any = null
      for (const [idx, p] of payloads.entries()) {
        try {
          console.log('[pipeline] createOpportunity attempt', idx + 1, p)
          newOpp = await createOpportunity(p)
          break
        } catch (e: any) {
          lastErr = e
          console.error('[pipeline] createOpportunity attempt failed', idx + 1, e?.response?.data || e?.message)
        }
      }
      if (!newOpp) throw lastErr

      toast.success("Oportunidade criada com sucesso", { description: "Sucesso!" })
      
      // Limpar formulário
      setNewOppData({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        companyName: "",
        value: 0,
        notes: "",
        priority: "media",
        origem: "",
      })
      
      setIsNewDealOpen(false)
      loadOpportunities() // Recarregar lista
    } catch (error: any) {
      toast.error(error?.message || "Erro ao criar oportunidade", { description: "Erro" })
    } finally {
      setCreatingOpportunity(false)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pipeline de Vendas</h2>
          <p className="text-muted-foreground">
            {loading ? "Carregando..." : !userId ? "Faça login para visualizar" : "Gerencie leads, oportunidades e clientes em um só lugar"}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {pipelines.length > 0 && (
            <Select value={selectedPipelineId?.toString() || undefined} onValueChange={(v) => setSelectedPipelineId(Number(v))}>
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="Selecione o pipeline" />
              </SelectTrigger>
              <SelectContent>
                {pipelines.map((p: any) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}{p.team?.name ? ` — ${p.team.name}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {!loading && !authLoading && userId && (
            <Button onClick={loadOpportunities} variant="outline" size="sm">
              Atualizar
            </Button>
          )}
          {userId && (
            <Button onClick={() => setIsNewDealOpen(true)} disabled={loading || !userId}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Lead
            </Button>
          )}
        </div>
      </div>
      
      {authLoading || loading ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Carregando pipeline...
          </CardContent>
        </Card>
      ) : !userId ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Faça login para visualizar o pipeline
          </CardContent>
        </Card>
      ) : (
        <>
          {opportunities.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Você não tem oportunidades no momento
              </CardContent>
            </Card>
          )}
        </>
      )}
      
      {leadsNeedingAttention > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <div className="flex-1">
              <p className="font-medium text-orange-900">
                {leadsNeedingAttention} lead(s) sem contato há mais de 3 dias
              </p>
              <p className="text-sm text-orange-700">Revise e tome ação para não perder oportunidades</p>
            </div>
            <Button variant="outline" size="sm">
              Ver Leads
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total em Pipeline</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Oportunidades + Clientes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDeals}</div>
            <p className="text-xs text-muted-foreground">Em todas as etapas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads (Novos)</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deals.filter((d) => d.status === 'novo').length}</div>
            <p className="text-xs text-muted-foreground">Status Novo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes (Ativos)</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deals.filter((d) => d.status === 'ativo').length}</div>
            <p className="text-xs text-muted-foreground">Status Ativo</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="flex gap-4 p-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <Select value={filterStage} onValueChange={setFilterStage}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por etapa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as etapas</SelectItem>
              {stages.map((stage: any) => (
                <SelectItem key={stage.id} value={stage.id.toString()}>
                  {stage.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="media">Média</SelectItem>
              <SelectItem value="baixa">Baixa</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Tabs defaultValue="kanban" className="space-y-4">
        <TabsList>
          <TabsTrigger value="kanban">Visão Kanban</TabsTrigger>
          <TabsTrigger value="list">Visão Lista</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="space-y-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {stages.map((stage: any) => {
              const stageDeals = getDealsByStage(stage.id)
              const dealIds = stageDeals.map(d => d.id.toString())
              
              return (
                <Card key={stage.id} className="min-h-[600px]">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colorFromStage((stage as any).color) }} />
                        {stage.name}
                      </CardTitle>
                      <Badge variant="secondary">{stageDeals.length}</Badge>
                    </div>
                    <CardDescription className="text-xs">{(stage as any).description || ''}</CardDescription>
                    {stageDeals.reduce((sum, d) => sum + d.value, 0) > 0 && (
                      <p className="text-sm font-semibold text-green-600">R$ {stageDeals.reduce((sum, d) => sum + d.value, 0).toLocaleString()}</p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <DroppableColumn stage={stage}>
                      <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
                        {stageDeals.map((deal) => (
                    <DraggableCard
                      key={deal.id}
                      deal={deal}
                      stage={stage}
                      onClick={() => {
                        setSelectedDeal(deal)
                        setIsDetailOpen(true)
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Header do card */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm leading-tight">{deal.client}</h4>
                              <p className="text-xs text-muted-foreground">{deal.company}</p>
                            </div>
                            {deal.daysSinceContact > 3 && <Bell className="h-4 w-4 text-orange-500" />}
                          </div>

                          {/* Informações específicas por estágio */}
                          {stage.id === 1 && (
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Target className="h-3 w-3" />
                                Origem: {(deal as any).origem || 'N/A'}
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                Entrada: {new Date((deal as any).dataEntrada || Date.now()).toLocaleDateString()}
                              </div>
                              {getStatusBadge(deal.status)}
                            </div>
                          )}

                          {stage.id === 2 && (
                            <div className="space-y-2">
                              <div className="text-xs space-y-1">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  Último contato:{" "}
                                  {deal.lastContact ? new Date(deal.lastContact).toLocaleDateString() : "Nunca"}
                                </div>
                                <div className="text-xs">{deal.interactions.length} interações registradas</div>
                              </div>
                              {getStatusBadge(deal.status)}
                            </div>
                          )}

                          {stage.id === 3 && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-green-600">
                                  R$ {deal.value?.toLocaleString()}
                                </span>
                                {deal.probability && <Badge variant="outline">{deal.probability}%</Badge>}
                              </div>
                              <div className="text-xs space-y-1">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <FileText className="h-3 w-3" />
                                  {(deal as any).produto || 'N/A'}
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  Previsão:{" "}
                                  {(deal as any).expectedClose ? new Date((deal as any).expectedClose).toLocaleDateString() : "N/A"}
                                </div>
                              </div>
                              {getStatusBadge(deal.status)}
                            </div>
                          )}

                          {stage.id === 4 && (
                            <div className="space-y-2">
                              <div className="text-lg font-bold text-green-600">R$ {deal.value?.toLocaleString()}</div>
                              <div className="text-xs space-y-1">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  Cliente desde:{" "}
                                  {(deal as any).dataPrimeiraCompra
                                    ? new Date((deal as any).dataPrimeiraCompra).toLocaleDateString()
                                    : "N/A"}
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  Próximo follow-up:{" "}
                                  {(deal as any).proximoFollowup ? new Date((deal as any).proximoFollowup).toLocaleDateString() : "N/A"}
                                </div>
                              </div>
                              {getStatusBadge(deal.status)}
                            </div>
                          )}

                          {/* Ações rápidas específicas por estágio */}
                          <div className="flex flex-wrap gap-1 pt-2 border-t">
                            {stage.id === 1 && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-xs"
                                  onClick={() => handleQuickAction(deal.id, "enviar_email")}
                                >
                                  <Send className="h-3 w-3 mr-1" />
                                  Email
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-xs"
                                  onClick={() => handleQuickAction(deal.id, "marcar_followup")}
                                >
                                  <Calendar className="h-3 w-3 mr-1" />
                                  Follow-up
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-xs"
                                  onClick={() => handleQuickAction(deal.id, "mover_nutricao")}
                                >
                                  <ArrowRight className="h-3 w-3 mr-1" />
                                  Nutrição
                                </Button>
                              </>
                            )}

                            {/* Ações rápidas removidas até implementação real */}

                            <div className="flex items-center gap-1 ml-auto">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs"
                                onClick={() => {
                                  setSelectedDeal(deal)
                                  setIsEditing(false)
                                  setIsDetailOpen(true)
                                }}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs"
                                onClick={() => {
                                  setSelectedDeal(deal)
                                  setEditStageId(deal.stage)
                                  setIsEditing(true)
                                  setIsDetailOpen(true)
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </DraggableCard>
                  ))}
                  </SortableContext>
                  </DroppableColumn>
                </CardContent>
              </Card>
            )
            })}
          </div>
          <DragOverlay>
            {activeId ? (
              <Card className="cursor-grabbing opacity-80 rotate-2">
                <CardContent className="p-4">
                  <div className="font-semibold">Movendo...</div>
                </CardContent>
              </Card>
            ) : null}
          </DragOverlay>
          </DndContext>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Todos os Leads e Clientes</CardTitle>
              <CardDescription>Lista completa com filtros aplicados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getFilteredDeals().map((deal) => (
                  <Card key={deal.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <h4 className="font-semibold">{deal.client}</h4>
                            <Badge className={getPriorityColor(deal.priority)}>{deal.priority}</Badge>
                            {getStatusBadge(deal.status)}
                            <Badge variant="outline">{stages.find((s: any) => s.id === deal.stage)?.name}</Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {deal.company}
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {deal.email}
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {deal.phone}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {deal.daysSinceContact} dias sem contato
                            </div>
                          </div>

                          {deal.value > 0 && (
                            <div className="text-lg font-bold text-green-600">R$ {deal.value.toLocaleString()}</div>
                          )}
                        </div>

                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedDeal(deal)
                              setIsDetailOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <ConditionalRender {...({ requiredPermissions: [{ module: "pipeline", action: "edit" }] } as any)}>
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </ConditionalRender>
                          <Button size="sm" variant="ghost">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedDeal?.client}
              {selectedDeal && getStatusBadge(selectedDeal.status)}
            </DialogTitle>
            <DialogDescription>{selectedDeal?.company}</DialogDescription>
          </DialogHeader>

          {selectedDeal && (
            <div className="space-y-6">
              {/* Informações de contato */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="text-sm">{selectedDeal.email}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Telefone</Label>
                  <p className="text-sm">{selectedDeal.phone}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Origem</Label>
                  <p className="text-sm">{(selectedDeal as any).origem || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Prioridade</Label>
                  <Badge className={getPriorityColor(selectedDeal.priority)}>{selectedDeal.priority}</Badge>
                </div>
              </div>

              {/* Histórico de interações */}
              {selectedDeal.interactions && selectedDeal.interactions.length > 0 && (
                <div className="space-y-3">
                  <Label>Histórico de Interações</Label>
                  <div className="space-y-2">
                    {selectedDeal.interactions.map((interaction: any, index: number) => (
                      <Card key={index}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {interaction.type === "email" && <Mail className="h-4 w-4" />}
                              {interaction.type === "reuniao" && <Calendar className="h-4 w-4" />}
                              {interaction.type === "proposta" && <FileText className="h-4 w-4" />}
                              {interaction.type === "compra" && <CheckCircle className="h-4 w-4 text-green-600" />}
                              {interaction.type === "feedback" && <Star className="h-4 w-4" />}
                              {interaction.type === "site" && <Eye className="h-4 w-4" />}
                              <span className="text-sm">{interaction.description}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(interaction.date).toLocaleDateString()}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Notas */}
              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea value={selectedDeal.notes} readOnly className="min-h-[100px]" />
              </div>

              {/* Ações */}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  Fechar
                </Button>
                <Button onClick={() => setIsEditing(v => !v)}>
                  <Edit className="mr-2 h-4 w-4" />
                  {isEditing ? 'Fechar Edição' : 'Editar'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isNewDealOpen} onOpenChange={setIsNewDealOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Oportunidade</DialogTitle>
            <DialogDescription>Adicione uma nova oportunidade ao pipeline</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client-name">Nome do Cliente *</Label>
                <Input 
                  id="client-name" 
                  placeholder="João Silva" 
                  value={newOppData.customerName}
                  onChange={(e) => setNewOppData({ ...newOppData, customerName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Empresa</Label>
                <Input 
                  id="company" 
                  placeholder="Empresa ABC" 
                  value={newOppData.companyName}
                  onChange={(e) => setNewOppData({ ...newOppData, companyName: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="joao@empresa.com" 
                  value={newOppData.customerEmail}
                  onChange={(e) => setNewOppData({ ...newOppData, customerEmail: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input 
                  id="phone" 
                  placeholder="(11) 99999-9999" 
                  value={newOppData.customerPhone}
                  onChange={(e) => setNewOppData({ ...newOppData, customerPhone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origem">Origem</Label>
                <Select value={(newOppData as any).origem} onValueChange={(value) => setNewOppData({ ...newOppData, origem: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a origem" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formulario">Formulário Site</SelectItem>
                    <SelectItem value="magnet">Lead Magnet</SelectItem>
                    <SelectItem value="indicacao">Indicação</SelectItem>
                    <SelectItem value="evento">Evento</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select value={newOppData.priority} onValueChange={(value) => setNewOppData({ ...newOppData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="baixa">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value">Valor (R$) *</Label>
                <Input 
                  id="value"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={String(newOppData.value ?? 0)}
                  onChange={(e) => setNewOppData({ ...newOppData, value: Number(e.target.value || 0) })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea 
                id="notes" 
                placeholder="Notas sobre o lead..." 
                value={newOppData.notes}
                onChange={(e) => setNewOppData({ ...newOppData, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewDealOpen(false)} disabled={creatingOpportunity}>
              Cancelar
            </Button>
            <Button onClick={handleCreateOpportunity} disabled={creatingOpportunity}>
              {creatingOpportunity ? "Criando..." : "Criar Oportunidade"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}