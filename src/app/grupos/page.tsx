"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Plus, Settings, Target, TrendingUp, Edit, Crown, AlertCircle, Trash2, Pencil, UserPlus } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { RoleGuard } from "@/components/role-guard"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getTeams, createTeam, getSellers, getUsers } from "@/lib/api.client"

export default function GruposPage() {
  const { user } = useAuth()

  const [grupos, setGrupos] = useState([
    {
      id: 1,
      nome: "Equipe Alpha",
      lider: "João Silva",
      liderUserId: "1", // Ajustado para corresponder ao ID do usuário mockado
      membros: 8,
      metaMensal: 150000,
      vendidoMes: 120000,
      status: "ativo",
      descricao: "Equipe focada em grandes contas corporativas",
      vendedores: [
        { nome: "Maria Santos", vendas: 25000, status: "ativo" },
        { nome: "Pedro Costa", vendas: 18000, status: "ativo" },
        { nome: "Ana Lima", vendas: 22000, status: "ativo" },
      ],
    },
    {
      id: 2,
      nome: "Equipe Beta",
      lider: "Maria Oliveira",
      liderUserId: "2",
      membros: 6,
      metaMensal: 100000,
      vendidoMes: 95000,
      status: "ativo",
      descricao: "Equipe especializada em PMEs",
      vendedores: [
        { nome: "Carlos Rocha", vendas: 20000, status: "ativo" },
        { nome: "Lucia Ferreira", vendas: 15000, status: "ativo" },
        { nome: "Roberto Silva", vendas: 18000, status: "inativo" },
      ],
    },
  ])

  // --- Integração backend /teams (NÃO altera UI) ---
  const queryClient = useQueryClient()

  // Carrega times (grupos de vendas) do backend
  const { data: teams = [] } = useQuery({
    queryKey: ["teams"],
    queryFn: () => getTeams("", 0, 100),
  })

  // Carrega vendedores do backend
  const { data: sellers = [] } = useQuery({
    queryKey: ["sellers"],
    queryFn: () => getSellers("", 0, 100),
  })

  // Carrega usuários para seleção de gerente
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => getUsers("", 0, 100),
  })

  // Mutação para criar grupo (team) no backend
  const createTeamMutation = useMutation({
    mutationFn: (payload: { name: string; description?: string; managerId?: string; sellerIds?: string[] }) =>
      createTeam(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teams"] }),
  })

  // Função para criar grupo de vendas (NÃO altera UI)
  const criarGrupoBackend = (dados: { name: string; description?: string; managerId?: string; sellerIds?: string[] }) => {
    createTeamMutation.mutate(dados)
  }

  // --- NOVO: sincronizar cards com backend ---
  const gruposSincronizados = teams.map((team: any) => {
    // Busca gerente pelo id
    const gerente = users.find((u: any) => String(u.id) === String(team.managerId));
    // Busca vendedores do grupo
    const vendedoresGrupo = (team.sellerIds || [])
      .map((sid: string) => {
        const s = sellers.find((seller: any) => String(seller.id) === String(sid));
        return s
          ? {
              nome:
                s.user && (s.user.firstName || s.user.lastName)
                  ? `${s.user.firstName ?? ""} ${s.user.lastName ?? ""}`.trim()
                  : s.name ?? s.email ?? s.id,
              vendas: s.salesAmount ?? 0,
              status: s.active === false ? "inativo" : "ativo",
            }
          : null;
      })
      .filter(Boolean);

    return {
      id: team.id,
      nome: team.name,
      lider: gerente?.name || gerente?.email || team.managerId || "",
      liderUserId: team.managerId,
      membros: vendedoresGrupo.length,
      metaMensal: team.quota ?? 0,
      vendidoMes: vendedoresGrupo.reduce((acc, v) => acc + (v?.vendas ?? 0), 0),
      status: team.active === false ? "inativo" : "ativo",
      descricao: team.description ?? "",
      vendedores: vendedoresGrupo,
    };
  });

  const [gruposFiltrados, setGruposFiltrados] = useState<any[]>([])
  const [podeGerenciarTodos, setPodeGerenciarTodos] = useState(false)
  const [novoGrupo, setNovoGrupo] = useState({
    nome: "",
    lider: "",
    descricao: "",
    metaMensal: "",
  })
  const [grupoSelecionado, setGrupoSelecionado] = useState(null)
  const [dialogoEditarAberto, setDialogoEditarAberto] = useState(false)
  const [dialogoGerenciarAberto, setDialogoGerenciarAberto] = useState(false)
  const [grupoEditando, setGrupoEditando] = useState(null)

  const [novoMembro, setNovoMembro] = useState({ nome: "", email: "", telefone: "" })
  const [membroEditando, setMembroEditando] = useState(null)
  const [dialogoAdicionarMembroAberto, setDialogoAdicionarMembroAberto] = useState(false)
  const [dialogoEditarMembroAberto, setDialogoEditarMembroAberto] = useState(false)

  // Estado para dialog de atribuição de líder
  const [dialogoAtribuirLiderAberto, setDialogoAtribuirLiderAberto] = useState(false)
  const [grupoParaAtribuirLider, setGrupoParaAtribuirLider] = useState<any>(null)
  const [novoLiderId, setNovoLiderId] = useState("")

  useEffect(() => {
    setGruposFiltrados(gruposSincronizados)
    setPodeGerenciarTodos(true)
  }, [user, teams, sellers, users])

  const criarGrupo = () => {
    if (user?.role !== "admin") {
      alert("Apenas administradores podem criar novos grupos")
      return
    }

    const grupo = {
      id: grupos.length + 1,
      nome: novoGrupo.nome,
      lider: novoGrupo.lider,
      liderUserId: "", // Seria definido baseado na seleção
      membros: 0,
      metaMensal: Number.parseInt(novoGrupo.metaMensal),
      vendidoMes: 0,
      status: "ativo",
      descricao: novoGrupo.descricao,
      vendedores: [],
    }
    setGrupos([...grupos, grupo])
    setNovoGrupo({ nome: "", lider: "", descricao: "", metaMensal: "" })
  }

  const calcularPerformance = (vendido, meta) => {
    return ((vendido / meta) * 100).toFixed(1)
  }

  const editarGrupo = (grupo) => {
    setGrupoEditando({
      id: grupo.id,
      nome: grupo.nome,
      lider: grupo.lider,
      descricao: grupo.descricao,
      metaMensal: grupo.metaMensal.toString(),
    })
    setDialogoEditarAberto(true)
  }

  const salvarEdicaoGrupo = () => {
    const gruposAtualizados = grupos.map((grupo) =>
      grupo.id === grupoEditando.id
        ? {
            ...grupo,
            nome: grupoEditando.nome,
            lider: grupoEditando.lider,
            descricao: grupoEditando.descricao,
            metaMensal: Number.parseInt(grupoEditando.metaMensal),
          }
        : grupo,
    )
    setGrupos(gruposAtualizados)
    setDialogoEditarAberto(false)
    setGrupoEditando(null)
  }

  const gerenciarGrupo = (grupo) => {
    setGrupoSelecionado(grupo)
    setDialogoGerenciarAberto(true)
  }

  const adicionarMembro = () => {
    if (!novoMembro.nome || !novoMembro.email) {
      alert("Nome e email são obrigatórios")
      return
    }

    const gruposAtualizados = grupos.map((grupo) =>
      grupo.id === grupoSelecionado.id
        ? {
            ...grupo,
            vendedores: [
              ...grupo.vendedores,
              {
                nome: novoMembro.nome,
                email: novoMembro.email,
                telefone: novoMembro.telefone,
                vendas: 0,
                status: "ativo",
              },
            ],
            membros: grupo.membros + 1,
          }
        : grupo,
    )

    setGrupos(gruposAtualizados)
    setGrupoSelecionado(gruposAtualizados.find((g) => g.id === grupoSelecionado.id))
    setNovoMembro({ nome: "", email: "", telefone: "" })
    setDialogoAdicionarMembroAberto(false)
  }

  const editarMembro = (vendedor, index) => {
    setMembroEditando({ ...vendedor, index })
    setDialogoEditarMembroAberto(true)
  }

  const salvarEdicaoMembro = () => {
    const gruposAtualizados = grupos.map((grupo) =>
      grupo.id === grupoSelecionado.id
        ? {
            ...grupo,
            vendedores: grupo.vendedores.map((v, i) =>
              i === membroEditando.index
                ? {
                    ...v,
                    nome: membroEditando.nome,
                    status: membroEditando.status,
                  }
                : v,
            ),
          }
        : grupo,
    )

    setGrupos(gruposAtualizados)
    setGrupoSelecionado(gruposAtualizados.find((g) => g.id === grupoSelecionado.id))
    setMembroEditando(null)
    setDialogoEditarMembroAberto(false)
  }

  const removerMembro = (index) => {
    if (confirm("Tem certeza que deseja remover este membro do grupo?")) {
      const gruposAtualizados = grupos.map((grupo) =>
        grupo.id === grupoSelecionado.id
          ? {
              ...grupo,
              vendedores: grupo.vendedores.filter((_, i) => i !== index),
              membros: grupo.membros - 1,
            }
          : grupo,
      )

      setGrupos(gruposAtualizados)
      setGrupoSelecionado(gruposAtualizados.find((g) => g.id === grupoSelecionado.id))
    }
  }

  // Mutação para atualizar líder do grupo (backend)
  const updateTeamMutation = useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: any }) => getTeams.updateTeam(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teams"] }),
  })

  // Função para abrir dialog de atribuição de líder
  const abrirDialogAtribuirLider = (grupo: any) => {
    setGrupoParaAtribuirLider(grupo)
    setNovoLiderId(grupo.liderUserId || "")
    setDialogoAtribuirLiderAberto(true)
  }

  // Função para salvar novo líder
  const salvarNovoLider = () => {
    if (!grupoParaAtribuirLider) return
    updateTeamMutation.mutate({ id: grupoParaAtribuirLider.id, data: { managerId: novoLiderId } })
    setDialogoAtribuirLiderAberto(false)
    setGrupoParaAtribuirLider(null)
    setNovoLiderId("")
  }

  return (
    <SidebarInset>
      {/* ...existing header... */}
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">{podeGerenciarTodos ? "Gerenciamento de Grupos" : "Meu Grupo"}</h1>
          {user && (
            <Badge variant="outline" className="ml-auto">
              {user.role.toUpperCase()}
            </Badge>
          )}
          {/* Botão de criação de grupo sempre visível para admin */}
          <Button className="ml-4" onClick={() => setDialogoEditarAberto(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Grupo
          </Button>
        </div>
      </header>
      {/* ...existing code... */}

      <div className="flex-1 space-y-4 p-4 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {podeGerenciarTodos ? "Gerenciamento de Grupos" : "Meu Grupo"}
            </h2>
            <p className="text-muted-foreground">
              {podeGerenciarTodos
                ? "Gerencie todos os grupos de vendas da organização"
                : `Gerencie seu grupo: ${gruposFiltrados[0]?.nome || "Nenhum grupo atribuído"}`}
            </p>
          </div>
        </div>

        {!podeGerenciarTodos && gruposFiltrados.length === 0 && (
          <Card>
            <CardHeader className="text-center">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
              <CardTitle>Nenhum Grupo Atribuído</CardTitle>
              <CardDescription>
                Você ainda não foi designado como líder de nenhum grupo. Entre em contato com o administrador para ser
                atribuído a um grupo.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <Tabs defaultValue="visao-geral" className="space-y-4">
          <TabsList>
            <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="detalhes">Detalhes dos Grupos</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="visao-geral" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {podeGerenciarTodos ? "Total de Grupos" : "Meu Grupo"}
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{gruposFiltrados.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {podeGerenciarTodos ? "+2 desde o mês passado" : "Grupo sob sua liderança"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Vendedores</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {gruposFiltrados.reduce((acc, grupo) => acc + grupo.membros, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {podeGerenciarTodos ? `Distribuídos em ${gruposFiltrados.length} grupos` : "Em seu grupo"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Meta Total</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R$ {gruposFiltrados.reduce((acc, grupo) => acc + grupo.metaMensal, 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {podeGerenciarTodos ? "Meta mensal combinada" : "Meta do seu grupo"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Performance Geral</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {calcularPerformance(
                      gruposFiltrados.reduce((acc, grupo) => acc + grupo.vendidoMes, 0),
                      gruposFiltrados.reduce((acc, grupo) => acc + grupo.metaMensal, 0),
                    )}
                    %
                  </div>
                  <p className="text-xs text-muted-foreground">Da meta mensal</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {gruposFiltrados.map((grupo) => (
                <Card key={grupo.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        {grupo.nome}
                        {grupo.liderUserId === user?.id && (
                          <Badge variant="secondary" className="ml-2">
                            <Crown className="h-3 w-3 mr-1" />
                            Seu Grupo
                          </Badge>
                        )}
                      </CardTitle>
                      <Badge variant={grupo.status === "ativo" ? "default" : "secondary"}>{grupo.status}</Badge>
                    </div>
                    <CardDescription>{grupo.descricao}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">Líder: {grupo.lider}</span>
                      {/* Botão para atribuir líder */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2"
                        title="Atribuir novo líder"
                        onClick={() => abrirDialogAtribuirLider(grupo)}
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Membros</p>
                        <p className="font-medium">{grupo.membros}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Performance</p>
                        <p className="font-medium">{calcularPerformance(grupo.vendidoMes, grupo.metaMensal)}%</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Vendido: R$ {grupo.vendidoMes.toLocaleString()}</span>
                        <span>Meta: R$ {grupo.metaMensal.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${Math.min(calcularPerformance(grupo.vendidoMes, grupo.metaMensal), 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <>
                        <Button variant="outline" size="sm" onClick={() => editarGrupo(grupo)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => gerenciarGrupo(grupo)}>
                          <Settings className="h-4 w-4 mr-1" />
                          Gerenciar
                        </Button>
                      </>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="detalhes" className="space-y-4">
            <div className="grid gap-4">
              {gruposFiltrados.map((grupo) => (
                <Card key={grupo.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {grupo.nome}
                      {grupo.liderUserId === user?.id && (
                        <Badge variant="secondary">
                          <Crown className="h-3 w-3 mr-1" />
                          Seu Grupo
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>Detalhes completos do grupo e membros</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Líder</p>
                          <p className="font-medium">{grupo.lider}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Membros</p>
                          <p className="font-medium">{grupo.membros}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Meta Mensal</p>
                          <p className="font-medium">R$ {grupo.metaMensal.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Vendido</p>
                          <p className="font-medium">R$ {grupo.vendidoMes.toLocaleString()}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Vendedores do Grupo</h4>
                        <div className="space-y-2">
                          {grupo.vendedores.map((vendedor, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border rounded">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>
                                    {vendedor.nome
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{vendedor.nome}</span>
                                <Badge variant={vendedor.status === "ativo" ? "default" : "secondary"}>
                                  {vendedor.status}
                                </Badge>
                              </div>
                              <div className="text-sm">R$ {vendedor.vendas.toLocaleString()}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>{podeGerenciarTodos ? "Ranking de Performance" : "Performance do Meu Grupo"}</CardTitle>
                  <CardDescription>
                    {podeGerenciarTodos
                      ? "Grupos ordenados por performance mensal"
                      : "Acompanhe a performance do seu grupo"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {gruposFiltrados
                      .sort(
                        (a, b) =>
                          calcularPerformance(b.vendidoMes, b.metaMensal) -
                          calcularPerformance(a.vendidoMes, a.metaMensal),
                      )
                      .map((grupo, index) => (
                        <div key={grupo.id} className="flex items-center justify-between p-4 border rounded">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium flex items-center gap-2">
                                {grupo.nome}
                                {grupo.liderUserId === user?.id && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Crown className="h-3 w-3 mr-1" />
                                    Seu
                                  </Badge>
                                )}
                              </p>
                              <p className="text-sm text-muted-foreground">Líder: {grupo.lider}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">
                              {calcularPerformance(grupo.vendidoMes, grupo.metaMensal)}%
                            </p>
                            <p className="text-sm text-muted-foreground">
                              R$ {grupo.vendidoMes.toLocaleString()} / R$ {grupo.metaMensal.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={dialogoEditarAberto} onOpenChange={setDialogoEditarAberto}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Grupo</DialogTitle>
              <DialogDescription>Modifique as informações do grupo selecionado.</DialogDescription>
            </DialogHeader>
            {grupoEditando && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-nome">Nome do Grupo</Label>
                  <Input
                    id="edit-nome"
                    value={grupoEditando.nome}
                    onChange={(e) => setGrupoEditando({ ...grupoEditando, nome: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-lider">Líder do Grupo</Label>
                  <Input
                    id="edit-lider"
                    value={grupoEditando.lider}
                    onChange={(e) => setGrupoEditando({ ...grupoEditando, lider: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-meta">Meta Mensal (R$)</Label>
                  <Input
                    id="edit-meta"
                    type="number"
                    value={grupoEditando.metaMensal}
                    onChange={(e) => setGrupoEditando({ ...grupoEditando, metaMensal: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-descricao">Descrição</Label>
                  <Textarea
                    id="edit-descricao"
                    value={grupoEditando.descricao}
                    onChange={(e) => setGrupoEditando({ ...grupoEditando, descricao: e.target.value })}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogoEditarAberto(false)}>
                Cancelar
              </Button>
              <Button onClick={salvarEdicaoGrupo}>Salvar Alterações</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={dialogoGerenciarAberto} onOpenChange={setDialogoGerenciarAberto}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Gerenciar Grupo: {grupoSelecionado?.nome}</DialogTitle>
              <DialogDescription>Gerencie membros, metas e configurações do grupo.</DialogDescription>
            </DialogHeader>
            {grupoSelecionado && (
              <Tabs defaultValue="membros" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="membros">Membros</TabsTrigger>
                  <TabsTrigger value="metas">Metas</TabsTrigger>
                  <TabsTrigger value="config">Configurações</TabsTrigger>
                </TabsList>

                <TabsContent value="membros" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Vendedores do Grupo</h4>
                    <Button size="sm" onClick={() => setDialogoAdicionarMembroAberto(true)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar Membro
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {grupoSelecionado.vendedores.map((vendedor, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {vendedor.nome
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{vendedor.nome}</p>
                            <p className="text-sm text-muted-foreground">R$ {vendedor.vendas.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={vendedor.status === "ativo" ? "default" : "secondary"}>
                            {vendedor.status}
                          </Badge>
                          <Button variant="outline" size="sm" onClick={() => editarMembro(vendedor, index)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => removerMembro(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="metas" className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>Meta Mensal Atual</Label>
                      <Input type="number" value={grupoSelecionado.metaMensal} placeholder="Meta em R$" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Performance Atual</Label>
                      <div className="p-3 bg-muted rounded">
                        <p className="text-2xl font-bold">
                          {calcularPerformance(grupoSelecionado.vendidoMes, grupoSelecionado.metaMensal)}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                          R$ {grupoSelecionado.vendidoMes.toLocaleString()} de R${" "}
                          {grupoSelecionado.metaMensal.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="config" className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>Status do Grupo</Label>
                      <Select defaultValue={grupoSelecionado.status}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="inativo">Inativo</SelectItem>
                          <SelectItem value="pausado">Pausado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Descrição do Grupo</Label>
                      <Textarea value={grupoSelecionado.descricao} placeholder="Descrição e foco do grupo" />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogoGerenciarAberto(false)}>
                Fechar
              </Button>
              <Button>Salvar Alterações</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={dialogoAdicionarMembroAberto} onOpenChange={setDialogoAdicionarMembroAberto}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Membro</DialogTitle>
              <DialogDescription>Adicione um novo vendedor ao grupo {grupoSelecionado?.nome}.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="membro-nome">Nome Completo</Label>
                <Input
                  id="membro-nome"
                  value={novoMembro.nome}
                  onChange={(e) => setNovoMembro({ ...novoMembro, nome: e.target.value })}
                  placeholder="Ex: Carlos Silva"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="membro-email">Email</Label>
                <Input
                  id="membro-email"
                  type="email"
                  value={novoMembro.email}
                  onChange={(e) => setNovoMembro({ ...novoMembro, email: e.target.value })}
                  placeholder="carlos@empresa.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="membro-telefone">Telefone (Opcional)</Label>
                <Input
                  id="membro-telefone"
                  value={novoMembro.telefone}
                  onChange={(e) => setNovoMembro({ ...novoMembro, telefone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogoAdicionarMembroAberto(false)}>
                Cancelar
              </Button>
              <Button onClick={adicionarMembro}>Adicionar Membro</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={dialogoEditarMembroAberto} onOpenChange={setDialogoEditarMembroAberto}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Membro</DialogTitle>
              <DialogDescription>Modifique as informações do vendedor selecionado.</DialogDescription>
            </DialogHeader>
            {membroEditando && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-membro-nome">Nome Completo</Label>
                  <Input
                    id="edit-membro-nome"
                    value={membroEditando.nome}
                    onChange={(e) => setMembroEditando({ ...membroEditando, nome: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-membro-status">Status</Label>
                  <Select
                    value={membroEditando.status}
                    onValueChange={(value) => setMembroEditando({ ...membroEditando, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                      <SelectItem value="licenca">Em Licença</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogoEditarMembroAberto(false)}>
                Cancelar
              </Button>
              <Button onClick={salvarEdicaoMembro}>Salvar Alterações</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog para atribuição de líder */}
        <Dialog open={dialogoAtribuirLiderAberto} onOpenChange={setDialogoAtribuirLiderAberto}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Atribuir Líder ao Grupo</DialogTitle>
              <DialogDescription>
                Selecione o novo líder para o grupo <b>{grupoParaAtribuirLider?.nome}</b>.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Label htmlFor="novo-lider">Novo Líder</Label>
              <Select
                value={novoLiderId}
                onValueChange={setNovoLiderId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um líder" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u: any) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name || u.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogoAtribuirLiderAberto(false)}>
                Cancelar
              </Button>
              <Button onClick={salvarNovoLider}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarInset>
  )
}
