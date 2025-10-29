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
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/use-auth"
import { getMyTasks } from "@/services/task-order-approval-invoice.service"
import { useToast } from "@/hooks/use-toast"

export default function MinhasTarefas() {
  const { user: authUser, loading: authLoading } = useAuth()
  const { toast } = useToast()
  
  const [filtroStatus, setFiltroStatus] = useState("todas")
  const [filtroPrioridade, setFiltroPrioridade] = useState("todas")
  const [loading, setLoading] = useState(true)
  const [tarefas, setTarefas] = useState<any[]>([])
  
  // Obter user de várias fontes
  const [user, setUser] = useState<any>(null)
  
  useEffect(() => {
    console.log("[minhas-tarefas] ============ DETECÇÃO DE USUÁRIO ============")
    console.log("[minhas-tarefas] authUser:", authUser)
    
    if (authUser) {
      console.log("[minhas-tarefas] usando authUser do hook")
      setUser(authUser)
      return
    }
    
    try {
      const storedUser = localStorage.getItem('user') || localStorage.getItem('currentUser')
      console.log("[minhas-tarefas] storedUser raw:", storedUser)
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        console.log("[minhas-tarefas] storedUser parsed:", parsedUser)
        setUser(parsedUser)
      }
    } catch (e) {
      console.warn("[minhas-tarefas] erro ao ler user", e)
    }
  }, [authUser])
  
  const userId = user?.id || user?.sub || user?.userId || user?.email || null
  console.log("[minhas-tarefas] userId final calculado:", userId, "de user:", user)
  
  // Carregar tarefas do backend
  useEffect(() => {
    if (authLoading) return
    if (!userId) {
      setLoading(false)
      return
    }
    
    loadTasks()
  }, [userId, authLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadTasks() {
    if (!userId) {
      console.log("[minhas-tarefas] userId não definido, abortando carregamento")
      setLoading(false)
      return
    }
    
    setLoading(true)
    try {
      console.log("[minhas-tarefas] ============ CARREGANDO TAREFAS ============")
      console.log("[minhas-tarefas] userId:", userId)
      console.log("[minhas-tarefas] user completo:", user)
      
      // Usar o endpoint dedicado que já filtra por usuário no backend
      const minhasTarefas = await getMyTasks("", 0, 100)
      
      console.log("[minhas-tarefas] ============ RESPOSTA DO BACKEND ============")
      console.log("[minhas-tarefas] total de tarefas recebidas:", minhasTarefas.length)
      console.log("[minhas-tarefas] tarefas recebidas:", JSON.stringify(minhasTarefas, null, 2))
      
      setTarefas(minhasTarefas)
    } catch (error: any) {
      console.error("[minhas-tarefas] ============ ERRO AO CARREGAR ============")
      console.error("[minhas-tarefas] erro:", error)
      console.error("[minhas-tarefas] erro.message:", error?.message)
      console.error("[minhas-tarefas] erro.response:", error?.response)
      toast({
        title: "Erro ao carregar tarefas",
        description: error?.message ?? "Não foi possível carregar as tarefas",
        variant: "destructive",
      })
      setTarefas([])
    } finally {
      setLoading(false)
    }
  }

  // Simulando usuário logado (fallback para UI)
  const usuarioAtual = {
    nome: user?.name || user?.firstName || "Usuário",
    avatar: user?.name?.substring(0, 2).toUpperCase() || "U",
  }
  
  // Calcular métricas das tarefas reais
  const tarefasPendentes = tarefas.filter((t) => !t.done && (!t.status || t.status === 'PENDING' || t.status === 'TODO'))
  const tarefasEmAndamento = tarefas.filter((t) => !t.done && (t.status === 'IN_PROGRESS' || t.status === 'DOING'))
  const tarefasConcluidas = tarefas.filter((t) => t.done || t.status === 'DONE' || t.status === 'COMPLETED')
  
  console.log("[minhas-tarefas] ============ FILTRAGEM DE TAREFAS ============")
  console.log("[minhas-tarefas] total tarefas:", tarefas.length)
  console.log("[minhas-tarefas] tarefasPendentes:", tarefasPendentes.length)
  console.log("[minhas-tarefas] tarefasEmAndamento:", tarefasEmAndamento.length)
  console.log("[minhas-tarefas] tarefasConcluidas:", tarefasConcluidas.length)
  
  const metricas = {
    totalTarefas: tarefas.length,
    pendentes: tarefasPendentes.length,
    emAndamento: tarefasEmAndamento.length,
    concluidas: tarefasConcluidas.length,
    produtividade: tarefas.length > 0 ? Math.round((tarefasConcluidas.length / tarefas.length) * 100) : 0,
  }
  
  // Mapear tarefas para formato da UI
  const mapTaskToUI = (task: any) => ({
    id: task.id,
    titulo: task.title || task.name || "Sem título",
    descricao: task.description || "",
    prioridade: task.priority === 'HIGH' ? 'Alta' : task.priority === 'MEDIUM' ? 'Média' : 'Baixa',
    prazo: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : null,
    criadoEm: task.createdAt ? new Date(task.createdAt).toISOString().split('T')[0] : null,
    estimativa: task.estimatedTime || task.estimate || "N/A",
    tags: task.tags || [],
    progresso: task.progress || 0,
  })

  const minhasTarefas = {
    pendentes: tarefasPendentes.map(mapTaskToUI),
    emAndamento: tarefasEmAndamento.map(mapTaskToUI),
    concluidas: tarefasConcluidas.map(mapTaskToUI),
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
                <p className="text-muted-foreground">
                  {loading ? "Carregando suas tarefas..." : "Suas tarefas e compromissos"}
                </p>
              </div>
              {!loading && !authLoading && (
                <Button onClick={loadTasks} variant="outline" disabled={!userId}>
                  Atualizar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        
        {authLoading || loading ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Carregando tarefas...
            </CardContent>
          </Card>
        ) : !userId ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Faça login para visualizar suas tarefas
            </CardContent>
          </Card>
        ) : tarefas.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Você não tem tarefas atribuídas no momento
            </CardContent>
          </Card>
        ) : (
          <>

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
        </>
        )}
      </div>
    </SidebarInset>
  )
}
