"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Target,
  TrendingUp,
  Filter,
  PlayCircle,
  CheckCircle2,
} from "lucide-react"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function MinhasTarefas() {
  const [filtroStatus, setFiltroStatus] = useState("todas")
  const [filtroPrioridade, setFiltroPrioridade] = useState("todas")

  // Simulando usuário logado
  const usuarioAtual = {
    nome: "João Silva",
    avatar: "JS",
  }

  const metricas = {
    totalTarefas: 8,
    pendentes: 3,
    emAndamento: 2,
    concluidas: 3,
    produtividade: 75,
  }

  const minhasTarefas = {
    pendentes: [
      {
        id: 1,
        titulo: "Apresentação para cliente ABC Corp",
        descricao: "Preparar proposta comercial completa com análise de ROI",
        prioridade: "Alta",
        prazo: "2024-01-18",
        criadoEm: "2024-01-12",
        estimativa: "6h",
        tags: ["proposta", "cliente"],
      },
      {
        id: 2,
        titulo: "Follow-up com leads da semana",
        descricao: "Entrar em contato com 10 leads que demonstraram interesse",
        prioridade: "Média",
        prazo: "2024-01-20",
        criadoEm: "2024-01-14",
        estimativa: "3h",
        tags: ["leads", "follow-up"],
      },
      {
        id: 3,
        titulo: "Atualizar pipeline de vendas",
        descricao: "Revisar e atualizar status de todas as oportunidades em aberto",
        prioridade: "Baixa",
        prazo: "2024-01-22",
        criadoEm: "2024-01-13",
        estimativa: "2h",
        tags: ["pipeline", "atualização"],
      },
    ],
    emAndamento: [
      {
        id: 4,
        titulo: "Negociação contrato XYZ Ltda",
        descricao: "Revisar termos e condições do contrato de prestação de serviços",
        prioridade: "Alta",
        prazo: "2024-01-16",
        criadoEm: "2024-01-10",
        estimativa: "4h",
        progresso: 65,
        tags: ["contrato", "negociação"],
      },
      {
        id: 5,
        titulo: "Preparar relatório mensal",
        descricao: "Compilar dados de vendas e performance do mês",
        prioridade: "Média",
        prazo: "2024-01-19",
        criadoEm: "2024-01-11",
        estimativa: "5h",
        progresso: 40,
        tags: ["relatório", "vendas"],
      },
    ],
    concluidas: [
      {
        id: 6,
        titulo: "Reunião com equipe de marketing",
        descricao: "Alinhar estratégias de captação de leads para Q1",
        prioridade: "Alta",
        prazo: "2024-01-12",
        criadoEm: "2024-01-08",
        concluidoEm: "2024-01-12",
        tempoGasto: "2h",
        tags: ["reunião", "marketing"],
      },
      {
        id: 7,
        titulo: "Cadastrar novos clientes no sistema",
        descricao: "Inserir dados de 5 novos clientes fechados na semana",
        prioridade: "Média",
        prazo: "2024-01-13",
        criadoEm: "2024-01-09",
        concluidoEm: "2024-01-13",
        tempoGasto: "1h",
        tags: ["cadastro", "clientes"],
      },
      {
        id: 8,
        titulo: "Treinamento sobre novo produto",
        descricao: "Participar do treinamento sobre lançamento de produto",
        prioridade: "Alta",
        prazo: "2024-01-11",
        criadoEm: "2024-01-07",
        concluidoEm: "2024-01-11",
        tempoGasto: "3h",
        tags: ["treinamento", "produto"],
      },
    ],
  }

  const tarefasFiltradas = {
    pendentes:
      filtroStatus === "todas" || filtroStatus === "pendentes"
        ? minhasTarefas.pendentes.filter(
            (t) => filtroPrioridade === "todas" || t.prioridade.toLowerCase() === filtroPrioridade,
          )
        : [],
    emAndamento:
      filtroStatus === "todas" || filtroStatus === "emAndamento"
        ? minhasTarefas.emAndamento.filter(
            (t) => filtroPrioridade === "todas" || t.prioridade.toLowerCase() === filtroPrioridade,
          )
        : [],
    concluidas:
      filtroStatus === "todas" || filtroStatus === "concluidas"
        ? minhasTarefas.concluidas.filter(
            (t) => filtroPrioridade === "todas" || t.prioridade.toLowerCase() === filtroPrioridade,
          )
        : [],
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">Minhas Tarefas</h1>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Header com informações do usuário */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {usuarioAtual.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{usuarioAtual.nome}</h2>
                <p className="text-muted-foreground">Suas tarefas e compromissos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Métricas Pessoais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
              <Target className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{metricas.totalTarefas}</div>
              <p className="text-xs text-muted-foreground">tarefas atribuídas</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-200/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{metricas.pendentes}</div>
              <p className="text-xs text-muted-foreground">aguardando início</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Em Andamento</CardTitle>
              <AlertCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{metricas.emAndamento}</div>
              <p className="text-xs text-muted-foreground">em execução</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Concluídas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{metricas.concluidas}</div>
              <p className="text-xs text-muted-foreground">finalizadas</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Produtividade</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{metricas.produtividade}%</div>
              <p className="text-xs text-muted-foreground">taxa de conclusão</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filtros:</span>
              </div>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as Tarefas</SelectItem>
                  <SelectItem value="pendentes">Apenas Pendentes</SelectItem>
                  <SelectItem value="emAndamento">Apenas Em Andamento</SelectItem>
                  <SelectItem value="concluidas">Apenas Concluídas</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filtroPrioridade} onValueChange={setFiltroPrioridade}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="média">Média</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Kanban de Tarefas Pessoais */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Pendentes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <CardTitle className="text-lg">Pendentes</CardTitle>
                </div>
                <Badge variant="secondary">{tarefasFiltradas.pendentes.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {tarefasFiltradas.pendentes.map((tarefa) => (
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
                      <Button variant="default" size="sm" className="w-full">
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Iniciar Tarefa
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
                <Badge variant="secondary">{tarefasFiltradas.emAndamento.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {tarefasFiltradas.emAndamento.map((tarefa) => (
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
                      <Button variant="default" size="sm" className="w-full">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Concluir Tarefa
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
                <Badge variant="secondary">{tarefasFiltradas.concluidas.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {tarefasFiltradas.concluidas.map((tarefa) => (
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
