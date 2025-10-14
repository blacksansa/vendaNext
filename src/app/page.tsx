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
import { useSession } from "next-auth/react";
import { useState } from "react";
import { RoleGuard } from "@/components/role-guard"
import { useAuth } from "@/hooks/use-auth"

export default function CRMDashboard() {
  const { data: session } = useSession()
  console.log("Session:", session)

  const { user } = useAuth()
  const [isResumoExpanded, setIsResumoExpanded] = useState(true)
  const [tarefasRapidas, setTarefasRapidas] = useState([
    { id: 1, titulo: "Adicionar Novo Cliente", icone: "Users", url: "/customers", cor: "blue" },
    { id: 2, titulo: "Agendar Ligação", icone: "Phone", url: "#", cor: "green" },
    { id: 3, titulo: "Enviar Email", icone: "Mail", url: "#", cor: "purple" },
    { id: 4, titulo: "Ver Calendário", icone: "Calendar", url: "#", cor: "orange" },
    { id: 5, titulo: "Ver Análises", icone: "BarChart3", url: "/analytics", cor: "red" },
  ])
  const [novaTarefa, setNovaTarefa] = useState({ titulo: "", icone: "Users", url: "", cor: "blue" })
  const [editandoTarefa, setEditandoTarefa] = useState(null)

  const getIcone = (nomeIcone) => {
    const icones = {
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

  const adicionarTarefaRapida = () => {
    if (novaTarefa.titulo.trim()) {
      const novaId = Math.max(...tarefasRapidas.map((t) => t.id)) + 1
      setTarefasRapidas([...tarefasRapidas, { ...novaTarefa, id: novaId }])
      setNovaTarefa({ titulo: "", icone: "Users", url: "", cor: "blue" })
    }
  }

  const removerTarefaRapida = (id) => {
    setTarefasRapidas(tarefasRapidas.filter((t) => t.id !== id))
  }

  const editarTarefaRapida = (tarefa) => {
    setEditandoTarefa(tarefa)
    setNovaTarefa({ titulo: tarefa.titulo, icone: tarefa.icone, url: tarefa.url, cor: tarefa.cor })
  }

  const salvarEdicao = () => {
    if (novaTarefa.titulo.trim()) {
      setTarefasRapidas(
        tarefasRapidas.map((t) => (t.id === editandoTarefa.id ? { ...editandoTarefa, ...novaTarefa } : t)),
      )
      setEditandoTarefa(null)
      setNovaTarefa({ titulo: "", icone: "Users", url: "", cor: "blue" })
    }
  }

  const gruposVendedores = [
    {
      id: 1,
      nome: "Equipe Norte",
      administrador: "Carlos Silva",
      membros: 8,
      metaMensal: 150000,
      vendidoMes: 142000,
      performance: 94.7,
      status: "Ativo",
    },
    {
      id: 2,
      nome: "Equipe Sul",
      administrador: "Ana Costa",
      membros: 6,
      metaMensal: 120000,
      vendidoMes: 98000,
      performance: 81.7,
      status: "Ativo",
    },
    {
      id: 3,
      nome: "Equipe Digital",
      administrador: "Pedro Santos",
      membros: 4,
      metaMensal: 80000,
      vendidoMes: 85000,
      performance: 106.3,
      status: "Ativo",
    },
  ]

  const tarefasKanban = {
    pendentes: [
      {
        id: 1,
        titulo: "Contatar leads da campanha Q4",
        descricao: "Fazer follow-up com 15 leads gerados",
        responsavel: "Equipe Norte",
        prioridade: "Alta",
        prazo: "2024-01-15",
      },
      {
        id: 2,
        titulo: "Apresentação para cliente ABC",
        descricao: "Preparar proposta comercial",
        responsavel: "João Silva",
        prioridade: "Média",
        prazo: "2024-01-18",
      },
    ],
    emAndamento: [
      {
        id: 3,
        titulo: "Negociação contrato XYZ",
        descricao: "Revisar termos e condições",
        responsavel: "Ana Costa",
        prioridade: "Alta",
        prazo: "2024-01-12",
      },
    ],
    concluidas: [
      {
        id: 4,
        titulo: "Treinamento novos vendedores",
        descricao: "Onboarding da equipe",
        responsavel: "Equipe Digital",
        prioridade: "Baixa",
        prazo: "2024-01-10",
      },
    ],
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">Dashboard</h1>
          {user && (
            <Badge variant="outline" className="ml-auto">
              {user.role.toUpperCase()}
            </Badge>
          )}
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <RoleGuard module="analytics" action="view" allowedRoles={["admin", "manager"]}>
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
                      <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                        <RefreshCw className="h-4 w-4 mr-2" />
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
                  <div className="space-y-4">
                    <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                      <h4 className="font-medium text-sm mb-2 text-green-600">📈 Performance Destacada</h4>
                      <p className="text-sm text-muted-foreground">
                        A <strong>Equipe Digital</strong> superou a meta mensal em 6,3%, liderada por Pedro Santos.
                        Recomendo replicar suas estratégias de vendas online para outras equipes.
                      </p>
                    </div>
                    <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                      <h4 className="font-medium text-sm mb-2 text-orange-600">⚠️ Atenção Necessária</h4>
                      <p className="text-sm text-muted-foreground">
                        Detectei 3 leads de alto valor sem follow-up há mais de 5 dias. Sugiro priorizar contato
                        imediato para evitar perda de oportunidades.
                      </p>
                    </div>
                    <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                      <h4 className="font-medium text-sm mb-2 text-blue-600">💡 Oportunidade</h4>
                      <p className="text-sm text-muted-foreground">
                        Identifiquei padrão de aumento de 23% nas vendas às terças-feiras. Considere concentrar
                        campanhas e prospecção neste dia da semana.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </RoleGuard>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">2.847</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+12,5%</span> do mês passado
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Receita</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">R$ 45.231</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+8,2%</span> do mês passado
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-200/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Negócios Ativos</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">127</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+3,1%</span> do mês passado
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Conversão</CardTitle>
              <Activity className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">24,8%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+2,4%</span> do mês passado
              </p>
            </CardContent>
          </Card>
        </div>

        <RoleGuard module="grupos" action="view" allowedRoles={["admin", "manager", "team_leader"]}>
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">Performance dos Grupos</CardTitle>
                  <CardDescription>Acompanhamento das equipes de vendas</CardDescription>
                </div>
                <RoleGuard module="vendedores" action="view" allowedRoles={["admin", "manager"]}>
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
                  .filter((grupo) => {
                    if (user?.role === "team_leader") {
                      return user.groupId === grupo.id.toString()
                    }
                    return true
                  })
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

        <RoleGuard module="tarefas" action="view">
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
                  <RoleGuard module="tarefas" action="create">
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
                    <h3 className="font-medium">Pendentes ({tarefasKanban.pendentes.length})</h3>
                  </div>
                  <div className="space-y-3">
                    {tarefasKanban.pendentes.map((tarefa) => (
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
                    <h3 className="font-medium">Em Andamento ({tarefasKanban.emAndamento.length})</h3>
                  </div>
                  <div className="space-y-3">
                    {tarefasKanban.emAndamento.map((tarefa) => (
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
                    <h3 className="font-medium">Concluídas ({tarefasKanban.concluidas.length})</h3>
                  </div>
                  <div className="space-y-3">
                    {tarefasKanban.concluidas.map((tarefa) => (
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
          <RoleGuard module="customers" action="view">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground">Clientes Recentes</CardTitle>
                    <CardDescription>Últimas interações e atualizações de clientes</CardDescription>
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
                  {[
                    {
                      name: "Sarah Johnson",
                      email: "sarah.j@empresa.com",
                      status: "Ativo",
                      value: "R$ 12.500",
                      avatar: "SJ",
                    },
                    {
                      name: "Michael Chen",
                      email: "m.chen@startup.io",
                      status: "Lead",
                      value: "R$ 8.200",
                      avatar: "MC",
                    },
                    {
                      name: "Emma Wilson",
                      email: "emma@design.co",
                      status: "Ativo",
                      value: "R$ 15.800",
                      avatar: "EW",
                    },
                    {
                      name: "David Rodriguez",
                      email: "david.r@tech.com",
                      status: "Prospecto",
                      value: "R$ 5.400",
                      avatar: "DR",
                    },
                  ].map((customer, index) => (
                    <div
                      key={index}
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
                <RoleGuard module="settings" action="edit" allowedRoles={["admin", "manager"]}>
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
                                    setNovaTarefa({ titulo: "", icone: "Users", url: "", cor: "blue" })
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
                .filter((tarefa) => {
                  if (tarefa.url === "/analytics" && !user) return false
                  if (tarefa.url === "/analytics" && user?.role === "sales_rep") return false
                  if (tarefa.url === "/customers" && user?.role === "viewer") return false
                  return true
                })
                .map((tarefa) => {
                  const IconeComponent = getIcone(tarefa.icone)
                  const TarefaButton = ({ children, ...props }) => (
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
