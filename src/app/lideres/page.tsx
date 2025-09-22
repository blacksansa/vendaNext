"use client"
import { useState } from "react"
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
} from "lucide-react"
import { AlertCircle } from "lucide-react" // Import AlertCircle
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

// Dados simulados para o dashboard de líderes
const gruposLiderados = [
  {
    id: "1",
    nome: "Equipe Sudeste",
    vendedores: 8,
    vendas: 450000,
    meta: 500000,
    crescimento: 12.5,
    status: "acima_meta",
    cor: "blue",
    vendedoresAtivos: 7,
    ticketMedio: 3500,
    conversao: 18.2,
  },
  {
    id: "2",
    nome: "Equipe Expansão",
    vendedores: 5,
    vendas: 180000,
    meta: 250000,
    crescimento: -5.2,
    status: "abaixo_meta",
    cor: "red",
    vendedoresAtivos: 4,
    ticketMedio: 2800,
    conversao: 14.1,
  },
]

const performanceVendedores = [
  { nome: "João Silva", vendas: 85000, meta: 80000, performance: 106, status: "excelente" },
  { nome: "Maria Santos", vendas: 92000, meta: 90000, performance: 102, status: "bom" },
  { nome: "Carlos Oliveira", vendas: 65000, meta: 75000, performance: 87, status: "atencao" },
  { nome: "Ana Costa", vendas: 78000, meta: 70000, performance: 111, status: "excelente" },
  { nome: "Pedro Lima", vendas: 45000, meta: 60000, performance: 75, status: "critico" },
]

const dadosTemporais = [
  { mes: "Jan", vendas: 380000, meta: 400000, vendedores: 12 },
  { mes: "Fev", vendas: 420000, meta: 450000, vendedores: 13 },
  { mes: "Mar", vendas: 465000, meta: 480000, vendedores: 13 },
  { mes: "Abr", vendas: 510000, meta: 500000, vendedores: 14 },
  { mes: "Mai", vendas: 485000, meta: 520000, vendedores: 13 },
  { mes: "Jun", vendas: 630000, meta: 550000, vendedores: 13 },
]

const distribuicaoStatus = [
  { name: "Excelente", value: 35, color: "#22c55e" },
  { name: "Bom", value: 40, color: "#3b82f6" },
  { name: "Atenção", value: 20, color: "#f59e0b" },
  { name: "Crítico", value: 5, color: "#ef4444" },
]

const atividadesRecentes = [
  { id: 1, tipo: "meta_atingida", vendedor: "João Silva", descricao: "Atingiu 106% da meta mensal", tempo: "2h atrás" },
  { id: 2, tipo: "alerta", vendedor: "Pedro Lima", descricao: "Performance abaixo de 80% da meta", tempo: "4h atrás" },
  {
    id: 3,
    tipo: "conquista",
    vendedor: "Ana Costa",
    descricao: "Fechou maior deal do mês (R$ 25.000)",
    tempo: "1d atrás",
  },
  {
    id: 4,
    tipo: "reuniao",
    vendedor: "Equipe Sudeste",
    descricao: "Reunião de alinhamento agendada",
    tempo: "2d atrás",
  },
]

const proximasAcoes = [
  { id: 1, acao: "Reunião 1:1 com Pedro Lima", prioridade: "alta", prazo: "Hoje, 14:00" },
  { id: 2, acao: "Revisão de metas Q2", prioridade: "media", prazo: "Amanhã" },
  { id: 3, acao: "Treinamento equipe vendas", prioridade: "baixa", prazo: "Próxima semana" },
  { id: 4, acao: "Análise de pipeline", prioridade: "alta", prazo: "Sexta-feira" },
]

const usuarioLogado = {
  id: "user123",
  nome: "João Silva",
  papel: "lider",
  grupoLiderado: 1,
}

export default function DashboardLideresPage() {
  const [periodoSelecionado, setPeriodoSelecionado] = useState("mes")
  const [grupoSelecionado, setGrupoSelecionado] = useState("todos")

  const gruposPermitidos =
    usuarioLogado.papel === "admin"
      ? gruposLiderados
      : gruposLiderados.filter((grupo) => grupo.id === usuarioLogado.grupoLiderado.toString())

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor)
  }

  const calcularPercentualMeta = (vendas: number, meta: number) => {
    return meta > 0 ? Math.round((vendas / meta) * 100) : 0
  }

  const obterCorStatus = (status: string) => {
    switch (status) {
      case "excelente":
        return "text-green-600"
      case "bom":
        return "text-blue-600"
      case "atencao":
        return "text-yellow-600"
      case "critico":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const obterIconeStatus = (status: string) => {
    switch (status) {
      case "excelente":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "bom":
        return <TrendingUp className="h-4 w-4 text-blue-600" />
      case "atencao":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "critico":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const totalVendas = gruposPermitidos.reduce((acc, grupo) => acc + grupo.vendas, 0)
  const totalMetas = gruposPermitidos.reduce((acc, grupo) => acc + grupo.meta, 0)
  const totalVendedores = gruposPermitidos.reduce((acc, grupo) => acc + grupo.vendedores, 0)
  const mediaPerformance = calcularPercentualMeta(totalVendas, totalMetas)

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
              {usuarioLogado.papel === "admin" ? "Dashboard de Líderes" : "Meu Dashboard de Liderança"}
            </h1>
            <p className="text-muted-foreground">
              {usuarioLogado.papel === "admin"
                ? "Visão executiva para líderes de grupos de vendas"
                : `Gerencie seu grupo: ${gruposPermitidos[0]?.nome || "Nenhum grupo atribuído"}`}
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

        {usuarioLogado.papel === "lider" && gruposPermitidos.length === 0 && (
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
                  <Progress value={mediaPerformance} className="mt-2" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {usuarioLogado.papel === "admin" ? "Vendedores Liderados" : "Meus Vendedores"}
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalVendedores}</div>
                  <p className="text-xs text-muted-foreground">
                    {gruposPermitidos.reduce((acc, g) => acc + g.vendedoresAtivos, 0)} ativos
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {usuarioLogado.papel === "admin" ? "Grupos Gerenciados" : "Meu Grupo"}
                  </CardTitle>
                  <Crown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{gruposPermitidos.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {gruposPermitidos.filter((g) => g.status === "acima_meta").length} acima da meta
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
                      gruposPermitidos.reduce((acc, g) => acc + g.ticketMedio, 0) / gruposPermitidos.length,
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {usuarioLogado.papel === "admin" ? "Média dos grupos" : "Do seu grupo"}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Performance dos Grupos */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {usuarioLogado.papel === "admin" ? "Performance dos Grupos" : "Performance do Meu Grupo"}
                  </CardTitle>
                  <CardDescription>
                    {usuarioLogado.papel === "admin"
                      ? "Acompanhe o desempenho de cada equipe"
                      : "Acompanhe o desempenho da sua equipe"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {gruposPermitidos.map((grupo) => (
                    <div key={grupo.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full bg-${grupo.cor}-500`} />
                          <span className="font-medium">{grupo.nome}</span>
                          <Badge variant="outline">{grupo.vendedores} vendedores</Badge>
                          {usuarioLogado.papel === "lider" && (
                            <Badge variant="secondary" className="text-xs">
                              <Crown className="h-3 w-3 mr-1" />
                              Seu Grupo
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{calcularPercentualMeta(grupo.vendas, grupo.meta)}%</div>
                          <div className="text-xs text-muted-foreground">{formatarMoeda(grupo.vendas)}</div>
                        </div>
                      </div>
                      <Progress value={calcularPercentualMeta(grupo.vendas, grupo.meta)} />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Meta: {formatarMoeda(grupo.meta)}</span>
                        <span className={grupo.crescimento > 0 ? "text-green-600" : "text-red-600"}>
                          {grupo.crescimento > 0 ? "+" : ""}
                          {grupo.crescimento}%
                        </span>
                      </div>
                    </div>
                  ))}
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
                    <CardTitle>Performance Individual dos Vendedores</CardTitle>
                    <CardDescription>Acompanhe o desempenho de cada membro da equipe</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vendedor</TableHead>
                          <TableHead>Vendas</TableHead>
                          <TableHead>Meta</TableHead>
                          <TableHead>Performance</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Ação</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {performanceVendedores.map((vendedor) => (
                          <TableRow key={vendedor.nome}>
                            <TableCell className="font-medium">{vendedor.nome}</TableCell>
                            <TableCell>{formatarMoeda(vendedor.vendas)}</TableCell>
                            <TableCell>{formatarMoeda(vendedor.meta)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-muted rounded-full h-2">
                                  <div
                                    className="bg-primary h-2 rounded-full"
                                    style={{ width: `${Math.min(vendedor.performance, 100)}%` }}
                                  />
                                </div>
                                <span className="text-sm">{vendedor.performance}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {obterIconeStatus(vendedor.status)}
                                <span className={`text-sm ${obterCorStatus(vendedor.status)}`}>{vendedor.status}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm">
                                <MessageSquare className="mr-2 h-4 w-4" />
                                1:1
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tendencias">
                <Card>
                  <CardHeader>
                    <CardTitle>Tendências de Performance</CardTitle>
                    <CardDescription>Evolução das vendas e metas ao longo do tempo</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <AreaChart data={dadosTemporais}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatarMoeda(Number(value))} />
                        <Area type="monotone" dataKey="vendas" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                        <Area type="monotone" dataKey="meta" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="atividades">
                <Card>
                  <CardHeader>
                    <CardTitle>Atividades Recentes</CardTitle>
                    <CardDescription>Acompanhe as últimas atividades da sua equipe</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {atividadesRecentes.map((atividade) => (
                        <div key={atividade.id} className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className="mt-1">
                            {atividade.tipo === "meta_atingida" && <Award className="h-5 w-5 text-green-600" />}
                            {atividade.tipo === "alerta" && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
                            {atividade.tipo === "conquista" && <TrendingUp className="h-5 w-5 text-blue-600" />}
                            {atividade.tipo === "reuniao" && <Calendar className="h-5 w-5 text-purple-600" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{atividade.vendedor}</span>
                              <span className="text-xs text-muted-foreground">{atividade.tempo}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{atividade.descricao}</p>
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
                    <CardTitle>Próximas Ações</CardTitle>
                    <CardDescription>Tarefas e compromissos importantes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {proximasAcoes.map((acao) => (
                        <div key={acao.id} className="flex items-center justify-between p-3 border rounded-lg">
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
                              <span className="font-medium">{acao.acao}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{acao.prazo}</span>
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Concluir
                          </Button>
                        </div>
                      ))}
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
                      {gruposPermitidos.map((grupo) => (
                        <div key={grupo.id} className="p-4 border rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded-full bg-${grupo.cor}-500`} />
                              <h3 className="font-semibold">{grupo.nome}</h3>
                              <Badge variant="outline">{grupo.vendedores} membros</Badge>
                              {usuarioLogado.papel === "lider" && (
                                <Badge variant="secondary" className="text-xs">
                                  <Crown className="h-3 w-3 mr-1" />
                                  Seu Grupo
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Users className="mr-2 h-4 w-4" />
                                Gerenciar
                              </Button>
                              <Button variant="outline" size="sm">
                                <Target className="mr-2 h-4 w-4" />
                                Metas
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Vendas</span>
                              <div className="font-medium">{formatarMoeda(grupo.vendas)}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Meta</span>
                              <div className="font-medium">{formatarMoeda(grupo.meta)}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Performance</span>
                              <div
                                className={`font-medium ${grupo.crescimento > 0 ? "text-green-600" : "text-red-600"}`}
                              >
                                {calcularPercentualMeta(grupo.vendas, grupo.meta)}%
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="text-blue-600">
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Reunião de Equipe
                            </Button>
                            <Button variant="ghost" size="sm" className="text-green-600">
                              <Award className="mr-2 h-4 w-4" />
                              Reconhecimento
                            </Button>
                            <Button variant="ghost" size="sm" className="text-orange-600">
                              <AlertTriangle className="mr-2 h-4 w-4" />
                              Plano de Ação
                            </Button>
                          </div>
                        </div>
                      ))}

                      <Button className="w-full bg-transparent" variant="outline">
                        <Users className="mr-2 h-4 w-4" />
                        Criar Novo Grupo
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Ações Rápidas</CardTitle>
                      <CardDescription>Ferramentas de gestão para líderes</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button className="w-full justify-start bg-transparent" variant="outline">
                        <Target className="mr-2 h-4 w-4" />
                        Definir Metas Mensais
                      </Button>
                      <Button className="w-full justify-start bg-transparent" variant="outline">
                        <Users className="mr-2 h-4 w-4" />
                        Redistribuir Vendedores
                      </Button>
                      <Button className="w-full justify-start bg-transparent" variant="outline">
                        <Calendar className="mr-2 h-4 w-4" />
                        Agendar Reuniões 1:1
                      </Button>
                      <Button className="w-full justify-start bg-transparent" variant="outline">
                        <Award className="mr-2 h-4 w-4" />
                        Programa de Incentivos
                      </Button>
                      <Button className="w-full justify-start bg-transparent" variant="outline">
                        <Activity className="mr-2 h-4 w-4" />
                        Relatório de Performance
                      </Button>
                      <Button className="w-full justify-start bg-transparent" variant="outline">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Análise de Tendências
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Configurações de Liderança</CardTitle>
                    <CardDescription>Personalize sua abordagem de gestão</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-3">
                        <h4 className="font-medium">Notificações de Performance</h4>
                        <div className="space-y-2">
                          <label className="flex items-center space-x-2">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <span className="text-sm">Alertar quando vendedor fica abaixo de 80% da meta</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <span className="text-sm">Notificar quando grupo atinge meta mensal</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm">Relatório semanal automático</span>
                          </label>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium">Frequência de Reuniões</h4>
                        <div className="space-y-2">
                          <Select defaultValue="semanal">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="diaria">Diária</SelectItem>
                              <SelectItem value="semanal">Semanal</SelectItem>
                              <SelectItem value="quinzenal">Quinzenal</SelectItem>
                              <SelectItem value="mensal">Mensal</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            Frequência padrão para reuniões 1:1 com vendedores
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t">
                      <Button>Salvar Configurações</Button>
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
