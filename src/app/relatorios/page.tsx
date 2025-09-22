import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  FileText,
  Download,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Award,
  AlertTriangle,
} from "lucide-react"

export default function RelatoriosPage() {
  const relatoriosDisponiveis = [
    {
      id: 1,
      nome: "Vendas por Período",
      descricao: "Análise detalhada de vendas por dia, semana, mês",
      tipo: "Vendas",
      ultimaAtualizacao: "2024-01-15",
      status: "Disponível",
    },
    {
      id: 2,
      nome: "Performance de Vendedores",
      descricao: "Ranking e métricas individuais da equipe",
      tipo: "Equipe",
      ultimaAtualizacao: "2024-01-15",
      status: "Disponível",
    },
    {
      id: 3,
      nome: "Análise de Clientes",
      descricao: "Segmentação e comportamento dos clientes",
      tipo: "Clientes",
      ultimaAtualizacao: "2024-01-14",
      status: "Disponível",
    },
    {
      id: 4,
      nome: "Funil de Vendas",
      descricao: "Conversão por etapa do processo comercial",
      tipo: "Processo",
      ultimaAtualizacao: "2024-01-15",
      status: "Processando",
    },
  ]

  const metricas = {
    vendas: {
      totalMes: 325000,
      crescimento: 12.5,
      metaMes: 300000,
      ticketMedio: 2850,
    },
    equipe: {
      totalVendedores: 18,
      vendedoresAtivos: 16,
      performanceMedia: 87.3,
      melhorVendedor: "Ana Costa",
    },
    clientes: {
      totalClientes: 2847,
      novosClientes: 156,
      clientesAtivos: 2234,
      taxaRetencao: 94.2,
    },
    processos: {
      leadsGerados: 423,
      taxaConversao: 24.8,
      tempoMedioFechamento: 12,
      oportunidadesAbertas: 127,
    },
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">Relatórios</h1>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Central de Relatórios</h2>
            <p className="text-muted-foreground">Análises detalhadas e insights do seu CRM</p>
          </div>
          <div className="flex gap-2">
            <Select defaultValue="mes">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semana">Esta Semana</SelectItem>
                <SelectItem value="mes">Este Mês</SelectItem>
                <SelectItem value="trimestre">Trimestre</SelectItem>
                <SelectItem value="ano">Este Ano</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Exportar Tudo
            </Button>
          </div>
        </div>

        <Tabs defaultValue="metricas" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="metricas">Métricas Gerais</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
            <TabsTrigger value="insights">Insights IA</TabsTrigger>
          </TabsList>

          <TabsContent value="metricas" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Vendas do Mês</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    R$ {metricas.vendas.totalMes.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-500">+{metricas.vendas.crescimento}%</span> vs mês anterior
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Meta: R$ {metricas.vendas.metaMes.toLocaleString()} (
                    {((metricas.vendas.totalMes / metricas.vendas.metaMes) * 100).toFixed(1)}%)
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Equipe</CardTitle>
                  <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {metricas.equipe.vendedoresAtivos}/{metricas.equipe.totalVendedores}
                  </div>
                  <p className="text-xs text-muted-foreground">Vendedores ativos</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Performance média: {metricas.equipe.performanceMedia}%
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Clientes</CardTitle>
                  <Target className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{metricas.clientes.totalClientes}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-500">+{metricas.clientes.novosClientes}</span> novos este mês
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground">Retenção: {metricas.clientes.taxaRetencao}%</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-200/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Conversão</CardTitle>
                  <Activity className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{metricas.processos.taxaConversao}%</div>
                  <p className="text-xs text-muted-foreground">{metricas.processos.leadsGerados} leads gerados</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Tempo médio: {metricas.processos.tempoMedioFechamento} dias
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Top Vendedores do Mês
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { nome: "Ana Costa", vendas: 45000, meta: 40000, posicao: 1 },
                      { nome: "Pedro Santos", vendas: 42000, meta: 38000, posicao: 2 },
                      { nome: "João Silva", vendas: 38000, meta: 35000, posicao: 3 },
                      { nome: "Maria Oliveira", vendas: 35000, meta: 32000, posicao: 4 },
                    ].map((vendedor) => (
                      <div key={vendedor.nome} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                            {vendedor.posicao === 1 && <Award className="h-4 w-4 text-yellow-500" />}
                            {vendedor.posicao !== 1 && <span className="text-sm font-medium">{vendedor.posicao}</span>}
                          </div>
                          <div>
                            <p className="font-medium">{vendedor.nome}</p>
                            <p className="text-sm text-muted-foreground">
                              R$ {vendedor.vendas.toLocaleString()} / R$ {vendedor.meta.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant={vendedor.vendas >= vendedor.meta ? "default" : "secondary"}>
                          {((vendedor.vendas / vendedor.meta) * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Distribuição de Vendas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { categoria: "Produtos Premium", valor: 125000, percentual: 38.5, cor: "bg-blue-500" },
                      { categoria: "Produtos Standard", valor: 98000, percentual: 30.2, cor: "bg-green-500" },
                      { categoria: "Serviços", valor: 67000, percentual: 20.6, cor: "bg-purple-500" },
                      { categoria: "Consultoria", valor: 35000, percentual: 10.7, cor: "bg-orange-500" },
                    ].map((item) => (
                      <div key={item.categoria} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{item.categoria}</span>
                          <span className="text-sm text-muted-foreground">{item.percentual}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className={`h-2 rounded-full ${item.cor}`} style={{ width: `${item.percentual}%` }} />
                        </div>
                        <div className="text-xs text-muted-foreground">R$ {item.valor.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="relatorios" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatoriosDisponiveis.map((relatorio) => (
                <Card key={relatorio.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <CardTitle className="text-base">{relatorio.nome}</CardTitle>
                          <CardDescription>{relatorio.descricao}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={relatorio.status === "Disponível" ? "default" : "secondary"}>
                        {relatorio.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Tipo:</span>
                        <Badge variant="outline">{relatorio.tipo}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Última atualização:</span>
                        <span>{new Date(relatorio.ultimaAtualizacao).toLocaleDateString("pt-BR")}</span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" disabled={relatorio.status !== "Disponível"}>
                          <Download className="h-4 w-4 mr-2" />
                          Baixar PDF
                        </Button>
                        <Button variant="outline" size="sm" disabled={relatorio.status !== "Disponível"}>
                          Visualizar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-green-200/20 bg-green-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <TrendingUp className="h-5 w-5" />
                    Oportunidades Identificadas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-background/50 rounded-lg border">
                    <h4 className="font-medium text-sm mb-1">Horário de Pico</h4>
                    <p className="text-sm text-muted-foreground">
                      Vendas aumentam 34% entre 14h-16h. Considere concentrar ligações neste período.
                    </p>
                  </div>
                  <div className="p-3 bg-background/50 rounded-lg border">
                    <h4 className="font-medium text-sm mb-1">Segmento Promissor</h4>
                    <p className="text-sm text-muted-foreground">
                      Empresas de tecnologia têm ticket médio 45% maior. Foque prospecção neste setor.
                    </p>
                  </div>
                  <div className="p-3 bg-background/50 rounded-lg border">
                    <h4 className="font-medium text-sm mb-1">Sazonalidade</h4>
                    <p className="text-sm text-muted-foreground">
                      Vendas crescem 28% na última semana do mês. Intensifique esforços no período.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-200/20 bg-orange-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-700">
                    <AlertTriangle className="h-5 w-5" />
                    Alertas e Riscos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-background/50 rounded-lg border">
                    <h4 className="font-medium text-sm mb-1">Leads Frios</h4>
                    <p className="text-sm text-muted-foreground">
                      23 leads sem contato há mais de 7 dias. Taxa de conversão cai 67% após este período.
                    </p>
                  </div>
                  <div className="p-3 bg-background/50 rounded-lg border">
                    <h4 className="font-medium text-sm mb-1">Performance Baixa</h4>
                    <p className="text-sm text-muted-foreground">
                      3 vendedores abaixo de 70% da meta. Considere treinamento ou redistribuição de leads.
                    </p>
                  </div>
                  <div className="p-3 bg-background/50 rounded-lg border">
                    <h4 className="font-medium text-sm mb-1">Churn Risk</h4>
                    <p className="text-sm text-muted-foreground">
                      12 clientes sem interação há 30+ dias. Risco de cancelamento aumenta em 45%.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Previsões para os Próximos 30 Dias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-200/20">
                    <h4 className="font-medium text-sm mb-2">Vendas Previstas</h4>
                    <div className="text-2xl font-bold text-blue-600">R$ 380.000</div>
                    <p className="text-xs text-muted-foreground">+17% vs mês atual</p>
                  </div>
                  <div className="p-4 bg-green-500/10 rounded-lg border border-green-200/20">
                    <h4 className="font-medium text-sm mb-2">Novos Clientes</h4>
                    <div className="text-2xl font-bold text-green-600">+187</div>
                    <p className="text-xs text-muted-foreground">Baseado no funil atual</p>
                  </div>
                  <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-200/20">
                    <h4 className="font-medium text-sm mb-2">Taxa de Conversão</h4>
                    <div className="text-2xl font-bold text-purple-600">26.3%</div>
                    <p className="text-xs text-muted-foreground">+1.5% vs atual</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SidebarInset>
  )
}
