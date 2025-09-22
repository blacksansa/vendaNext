"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "lucide-react"

// Dados mockados do pipeline
const pipelineStages = [
  { id: 1, name: "Prospecção", color: "bg-blue-500", deals: 12, value: 45000 },
  { id: 2, name: "Qualificação", color: "bg-yellow-500", deals: 8, value: 32000 },
  { id: 3, name: "Proposta", color: "bg-orange-500", deals: 5, value: 28000 },
  { id: 4, name: "Negociação", color: "bg-purple-500", deals: 3, value: 18000 },
  { id: 5, name: "Fechamento", color: "bg-green-500", deals: 2, value: 15000 },
]

const deals = [
  {
    id: 1,
    title: "Implementação CRM - Empresa ABC",
    value: 15000,
    probability: 85,
    stage: 1,
    client: "João Silva",
    company: "Empresa ABC",
    email: "joao@empresaabc.com",
    phone: "(11) 99999-9999",
    expectedClose: "2024-01-15",
    lastActivity: "2024-01-10",
    notes: "Cliente muito interessado, aguardando aprovação do orçamento.",
  },
  {
    id: 2,
    title: "Consultoria Digital - Tech Corp",
    value: 8500,
    probability: 60,
    stage: 2,
    client: "Maria Santos",
    company: "Tech Corp",
    email: "maria@techcorp.com",
    phone: "(11) 88888-8888",
    expectedClose: "2024-01-20",
    lastActivity: "2024-01-08",
    notes: "Precisa de mais informações sobre o ROI.",
  },
  {
    id: 3,
    title: "Sistema de Vendas - StartupXYZ",
    value: 12000,
    probability: 40,
    stage: 3,
    client: "Pedro Costa",
    company: "StartupXYZ",
    email: "pedro@startupxyz.com",
    phone: "(11) 77777-7777",
    expectedClose: "2024-02-01",
    lastActivity: "2024-01-05",
    notes: "Aguardando definição de budget.",
  },
]

export default function PipelinePage() {
  const [selectedDeal, setSelectedDeal] = useState(null)
  const [isNewDealOpen, setIsNewDealOpen] = useState(false)
  const [isStageDialogOpen, setIsStageDialogOpen] = useState(false)

  const totalValue = pipelineStages.reduce((sum, stage) => sum + stage.value, 0)
  const totalDeals = pipelineStages.reduce((sum, stage) => sum + stage.deals, 0)
  const avgDealValue = totalValue / totalDeals

  const getDealsByStage = (stageId: number) => {
    return deals.filter((deal) => deal.stage === stageId)
  }

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return "text-green-600"
    if (probability >= 60) return "text-yellow-600"
    if (probability >= 40) return "text-orange-600"
    return "text-red-600"
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pipeline de Vendas</h2>
          <p className="text-muted-foreground">Gerencie suas oportunidades e acompanhe o progresso das vendas</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isStageDialogOpen} onOpenChange={setIsStageDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Novo Estágio
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Estágio</DialogTitle>
                <DialogDescription>Adicione um novo estágio ao seu pipeline de vendas</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stage-name" className="text-right">
                    Nome
                  </Label>
                  <Input id="stage-name" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stage-color" className="text-right">
                    Cor
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecione uma cor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Azul</SelectItem>
                      <SelectItem value="green">Verde</SelectItem>
                      <SelectItem value="yellow">Amarelo</SelectItem>
                      <SelectItem value="red">Vermelho</SelectItem>
                      <SelectItem value="purple">Roxo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setIsStageDialogOpen(false)}>Criar Estágio</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isNewDealOpen} onOpenChange={setIsNewDealOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Oportunidade
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nova Oportunidade</DialogTitle>
                <DialogDescription>Adicione uma nova oportunidade ao pipeline</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deal-title">Título da Oportunidade</Label>
                    <Input id="deal-title" placeholder="Ex: Implementação CRM" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deal-value">Valor (R$)</Label>
                    <Input id="deal-value" type="number" placeholder="15000" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-name">Nome do Cliente</Label>
                    <Input id="client-name" placeholder="João Silva" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Empresa</Label>
                    <Input id="company" placeholder="Empresa ABC" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="joao@empresa.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" placeholder="(11) 99999-9999" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stage">Estágio</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o estágio" />
                      </SelectTrigger>
                      <SelectContent>
                        {pipelineStages.map((stage) => (
                          <SelectItem key={stage.id} value={stage.id.toString()}>
                            {stage.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="probability">Probabilidade (%)</Label>
                    <Input id="probability" type="number" min="0" max="100" placeholder="75" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expected-close">Data Prevista de Fechamento</Label>
                  <Input id="expected-close" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea id="notes" placeholder="Notas sobre a oportunidade..." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewDealOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsNewDealOpen(false)}>Criar Oportunidade</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Métricas do Pipeline */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total em Pipeline</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% em relação ao mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Oportunidades</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDeals}</div>
            <p className="text-xs text-muted-foreground">5 novas esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {Math.round(avgDealValue).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+8% em relação ao mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24%</div>
            <p className="text-xs text-muted-foreground">+2% em relação ao mês anterior</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="kanban" className="space-y-4">
        <TabsList>
          <TabsTrigger value="kanban">Visão Kanban</TabsTrigger>
          <TabsTrigger value="list">Visão Lista</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {pipelineStages.map((stage) => (
              <Card key={stage.id} className="min-h-[600px]">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                      {stage.name}
                    </CardTitle>
                    <Badge variant="secondary">{stage.deals}</Badge>
                  </div>
                  <CardDescription>R$ {stage.value.toLocaleString()}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {getDealsByStage(stage.id).map((deal) => (
                    <Card key={deal.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm leading-tight">{deal.title}</h4>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-green-600">R$ {deal.value.toLocaleString()}</span>
                            <Badge variant="outline" className={getProbabilityColor(deal.probability)}>
                              {deal.probability}%
                            </Badge>
                          </div>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {deal.company}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(deal.expectedClose).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex gap-1 pt-2">
                            <Button size="sm" variant="ghost" className="h-6 px-2">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-6 px-2">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-6 px-2">
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Todas as Oportunidades</CardTitle>
              <CardDescription>Lista completa de oportunidades no pipeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deals.map((deal) => (
                  <div key={deal.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{deal.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {deal.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {deal.client}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(deal.expectedClose).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold text-green-600">R$ {deal.value.toLocaleString()}</div>
                        <Badge variant="outline" className={getProbabilityColor(deal.probability)}>
                          {deal.probability}%
                        </Badge>
                      </div>
                      <Badge variant="secondary">{pipelineStages.find((s) => s.id === deal.stage)?.name}</Badge>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance por Estágio</CardTitle>
                <CardDescription>Distribuição de oportunidades e valores</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pipelineStages.map((stage) => (
                  <div key={stage.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                        {stage.name}
                      </span>
                      <span className="font-medium">
                        {stage.deals} deals - R$ {stage.value.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={(stage.value / totalValue) * 100} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tempo Médio por Estágio</CardTitle>
                <CardDescription>Duração média das oportunidades em cada estágio</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pipelineStages.map((stage, index) => (
                  <div key={stage.id} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm">
                      <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                      {stage.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{Math.floor(Math.random() * 20) + 5} dias</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
