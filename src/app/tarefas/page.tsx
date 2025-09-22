"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
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
import { Progress } from "@/components/ui/progress"
import {
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreHorizontal,
  Calendar,
  Target,
  TrendingUp,
  Filter,
  Download,
} from "lucide-react"
import { useState } from "react"

export default function TarefasKanban() {
  const [filtroResponsavel, setFiltroResponsavel] = useState("todos")
  const [filtroPrioridade, setFiltroPrioridade] = useState("todas")

  const metricas = {
    totalTarefas: 47,
    pendentes: 18,
    emAndamento: 12,
    concluidas: 17,
    atrasadas: 5,
    produtividade: 78.5,
    tempoMedio: 3.2,
  }

  const responsaveis = [
    { id: "equipe-norte", nome: "Equipe Norte", tipo: "grupo", tarefas: 12, concluidas: 8 },
    { id: "equipe-sul", nome: "Equipe Sul", tipo: "grupo", tarefas: 9, concluidas: 6 },
    { id: "equipe-digital", nome: "Equipe Digital", tipo: "grupo", tarefas: 7, concluidas: 5 },
    { id: "joao-silva", nome: "João Silva", tipo: "vendedor", tarefas: 8, concluidas: 5 },
    { id: "ana-costa", nome: "Ana Costa", tipo: "vendedor", tarefas: 6, concluidas: 4 },
    { id: "pedro-santos", nome: "Pedro Santos", tipo: "vendedor", tarefas: 5, concluidas: 3 },
  ]

  const tarefasDetalhadas = {
    pendentes: [
      {
        id: 1,
        titulo: "Contatar leads da campanha Q4",
        descricao: "Fazer follow-up com 15 leads gerados na campanha de fim de ano",
        responsavel: "Equipe Norte",
        tipoResponsavel: "grupo",
        prioridade: "Alta",
        prazo: "2024-01-15",
        criadoEm: "2024-01-10",
        estimativa: "4h",
        tags: ["leads", "follow-up"],
      },
      {
        id: 2,
        titulo: "Apresentação para cliente ABC Corp",
        descricao: "Preparar proposta comercial completa com análise de ROI",
        responsavel: "João Silva",
        tipoResponsavel: "vendedor",
        prioridade: "Alta",
        prazo: "2024-01-18",
        criadoEm: "2024-01-12",
        estimativa: "6h",
        tags: ["proposta", "cliente"],
      },
      {
        id: 3,
        titulo: "Atualizar base de dados de clientes",
        descricao: "Revisar e atualizar informações de contato dos clientes inativos",
        responsavel: "Equipe Sul",
        tipoResponsavel: "grupo",
        prioridade: "Média",
        prazo: "2024-01-20",
        criadoEm: "2024-01-11",
        estimativa: "8h",
        tags: ["dados", "clientes"],
      },
    ],
    emAndamento: [
      {
        id: 4,
        titulo: "Negociação contrato XYZ Ltda",
        descricao: "Revisar termos e condições do contrato de prestação de serviços",
        responsavel: "Ana Costa",
        tipoResponsavel: "vendedor",
        prioridade: "Alta",
        prazo: "2024-01-12",
        criadoEm: "2024-01-08",
        estimativa: "3h",
        progresso: 65,
        tags: ["contrato", "negociação"],
      },
      {
        id: 5,
        titulo: "Campanha de email marketing",
        descricao: "Desenvolver e executar campanha para clientes inativos",
        responsavel: "Equipe Digital",
        tipoResponsavel: "grupo",
        prioridade: "Média",
        prazo: "2024-01-16",
        criadoEm: "2024-01-09",
        estimativa: "5h",
        progresso: 40,
        tags: ["marketing", "email"],
      },
    ],
    concluidas: [
      {
        id: 6,
        titulo: "Treinamento novos vendedores",
        descricao: "Onboarding completo da nova equipe de vendas",
        responsavel: "Pedro Santos",
        tipoResponsavel: "vendedor",
        prioridade: "Alta",
        prazo: "2024-01-10",
        criadoEm: "2024-01-05",
        concluidoEm: "2024-01-09",
        tempoGasto: "12h",
        tags: ["treinamento", "onboarding"],
      },
      {
        id: 7,
        titulo: "Relatório mensal de vendas",
        descricao: "Compilar dados e gerar relatório de performance dezembro",
        responsavel: "Equipe Norte",
        tipoResponsavel: "grupo",
        prioridade: "Média",
        prazo: "2024-01-08",
        criadoEm: "2024-01-02",
        concluidoEm: "2024-01-07",
        tempoGasto: "6h",
        tags: ["relatório", "vendas"],
      },
    ],
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">Gerenciamento de Tarefas</h1>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Métricas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Tarefas</CardTitle>
              <Target className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{metricas.totalTarefas}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+5</span> esta semana
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-200/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Produtividade</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{metricas.produtividade}%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+2.1%</span> do mês passado
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Concluídas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{metricas.concluidas}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+3</span> hoje
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-200/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Atrasadas</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{metricas.atrasadas}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-red-500">Requer atenção</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance por Responsável */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Performance por Responsável</CardTitle>
            <CardDescription>Acompanhamento de produtividade individual e por equipe</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {responsaveis.map((responsavel) => (
                <Card key={responsavel.id} className="border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {responsavel.nome
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{responsavel.nome}</p>
                          <Badge variant="outline" className="text-xs">
                            {responsavel.tipo === "grupo" ? "Equipe" : "Vendedor"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tarefas:</span>
                        <span className="font-medium">{responsavel.tarefas}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Concluídas:</span>
                        <span className="font-medium">{responsavel.concluidas}</span>
                      </div>
                      <Progress value={(responsavel.concluidas / responsavel.tarefas) * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground text-center">
                        {Math.round((responsavel.concluidas / responsavel.tarefas) * 100)}% de conclusão
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filtros e Ações */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filtros:</span>
              </div>
              <Select value={filtroResponsavel} onValueChange={setFiltroResponsavel}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Responsáveis</SelectItem>
                  <SelectItem value="grupos">Apenas Grupos</SelectItem>
                  <SelectItem value="vendedores">Apenas Vendedores</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filtroPrioridade} onValueChange={setFiltroPrioridade}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Tarefa
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
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
                      <div className="grid gap-2">
                        <Label htmlFor="estimativa">Estimativa (horas)</Label>
                        <Input id="estimativa" type="number" placeholder="Ex: 4" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Criar Tarefa</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kanban Detalhado */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Pendentes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <CardTitle className="text-lg">Pendentes</CardTitle>
                </div>
                <Badge variant="secondary">{tarefasDetalhadas.pendentes.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {tarefasDetalhadas.pendentes.map((tarefa) => (
                <Card key={tarefa.id} className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm leading-tight">{tarefa.titulo}</h4>
                        <Badge
                          variant={
                            tarefa.prioridade === "Alta"
                              ? "destructive"
                              : tarefa.prioridade === "Média"
                                ? "secondary"
                                : "outline"
                          }
                          className="text-xs shrink-0"
                        >
                          {tarefa.prioridade}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{tarefa.descricao}</p>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {tarefa.responsavel
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{tarefa.responsavel}</span>
                        <Badge variant="outline" className="text-xs ml-auto">
                          {tarefa.tipoResponsavel === "grupo" ? "Equipe" : "Vendedor"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(tarefa.prazo).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {tarefa.estimativa}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {tarefa.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Button variant="ghost" size="sm" className="w-full">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Coluna Em Andamento */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-lg">Em Andamento</CardTitle>
                </div>
                <Badge variant="secondary">{tarefasDetalhadas.emAndamento.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {tarefasDetalhadas.emAndamento.map((tarefa) => (
                <Card key={tarefa.id} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm leading-tight">{tarefa.titulo}</h4>
                        <Badge
                          variant={
                            tarefa.prioridade === "Alta"
                              ? "destructive"
                              : tarefa.prioridade === "Média"
                                ? "secondary"
                                : "outline"
                          }
                          className="text-xs shrink-0"
                        >
                          {tarefa.prioridade}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{tarefa.descricao}</p>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {tarefa.responsavel
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{tarefa.responsavel}</span>
                        <Badge variant="outline" className="text-xs ml-auto">
                          {tarefa.tipoResponsavel === "grupo" ? "Equipe" : "Vendedor"}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Progresso:</span>
                          <span className="font-medium">{tarefa.progresso}%</span>
                        </div>
                        <Progress value={tarefa.progresso} className="h-2" />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(tarefa.prazo).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {tarefa.estimativa}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {tarefa.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Button variant="ghost" size="sm" className="w-full">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Coluna Concluídas */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <CardTitle className="text-lg">Concluídas</CardTitle>
                </div>
                <Badge variant="secondary">{tarefasDetalhadas.concluidas.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {tarefasDetalhadas.concluidas.map((tarefa) => (
                <Card
                  key={tarefa.id}
                  className="border-l-4 border-l-green-500 opacity-75 hover:opacity-100 transition-opacity"
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm leading-tight line-through">{tarefa.titulo}</h4>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {tarefa.prioridade}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{tarefa.descricao}</p>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {tarefa.responsavel
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{tarefa.responsavel}</span>
                        <Badge variant="outline" className="text-xs ml-auto">
                          {tarefa.tipoResponsavel === "grupo" ? "Equipe" : "Vendedor"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {new Date(tarefa.concluidoEm).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {tarefa.tempoGasto}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {tarefa.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarInset>
  )
}
