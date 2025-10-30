"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  UserPlus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Target,
  Users,
  DollarSign,
  UserCheck,
  UserX,
  UsersIcon,
  Crown,
  Plus,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// React Query + API
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getSellers, createSeller, updateSeller, deleteSeller, getTeams } from "@/lib/api.client"
import { Seller } from "@/lib/types"

interface GrupoVendedores {
  id: string
  nome: string
  descricao: string
  administradorId: string
  vendedoresIds: string[]
  metaGrupo: number
  cor: string
}

interface Vendedor {
  id: string
  nome: string
  email: string
  telefone: string
  cargo: string
  regiao: string
  status: "ativo" | "inativo"
  vendas: number
  meta: number
  dataContratacao: string
  vendasMesAnterior: number
  clientesAtivos: number
  ticketMedio: number
  conversao: number
  grupoId?: string
}

// const vendedoresIniciais: Vendedor[] = [
//   {
//     id: "1",
//     nome: "João Silva",
//     email: "joao.silva@empresa.com",
//     telefone: "(11) 99999-9999",
//     cargo: "Vendedor Sênior",
//     regiao: "São Paulo",
//     status: "ativo",
//     vendas: 150000,
//     meta: 200000,
//     dataContratacao: "2023-01-15",
//     vendasMesAnterior: 120000,
//     clientesAtivos: 45,
//     ticketMedio: 3333,
//     conversao: 15.5,
//     grupoId: "1",
//   },
//   {
//     id: "2",
//     nome: "Maria Santos",
//     email: "maria.santos@empresa.com",
//     telefone: "(21) 88888-8888",
//     cargo: "Gerente de Vendas",
//     regiao: "Rio de Janeiro",
//     status: "ativo",
//     vendas: 280000,
//     meta: 300000,
//     dataContratacao: "2022-08-20",
//     vendasMesAnterior: 250000,
//     clientesAtivos: 78,
//     ticketMedio: 3590,
//     conversao: 22.3,
//     grupoId: "1",
//   },
//   {
//     id: "3",
//     nome: "Carlos Oliveira",
//     email: "carlos.oliveira@empresa.com",
//     telefone: "(31) 77777-7777",
//     cargo: "Vendedor Pleno",
//     regiao: "Minas Gerais",
//     status: "inativo",
//     vendas: 95000,
//     meta: 150000,
//     dataContratacao: "2023-06-10",
//     vendasMesAnterior: 110000,
//     clientesAtivos: 32,
//     ticketMedio: 2969,
//     conversao: 12.8,
//     grupoId: "2",
//   },
// ]

const gruposIniciais: GrupoVendedores[] = [
  {
    id: "1",
    nome: "Equipe Sudeste",
    descricao: "Vendedores responsáveis pela região Sudeste",
    administradorId: "2",
    vendedoresIds: ["1", "2"],
    metaGrupo: 500000,
    cor: "blue",
  },
  {
    id: "2",
    nome: "Equipe Expansão",
    descricao: "Novos vendedores em desenvolvimento",
    administradorId: "3",
    vendedoresIds: ["3"],
    metaGrupo: 200000,
    cor: "green",
  },
]

const dadosPerformance = [
  { mes: "Jan", vendas: 120000, meta: 200000 },
  { mes: "Fev", vendas: 135000, meta: 200000 },
  { mes: "Mar", vendas: 150000, meta: 200000 },
  { mes: "Abr", vendas: 165000, meta: 200000 },
  { mes: "Mai", vendas: 180000, meta: 200000 },
  { mes: "Jun", vendas: 195000, meta: 200000 },
]

const dadosRanking = [
  { nome: "Maria Santos", vendas: 280000 },
  { nome: "João Silva", vendas: 150000 },
  { nome: "Carlos Oliveira", vendas: 95000 },
]

export default function VendedoresPage() {
  const queryClient = useQueryClient()

  // carregar vendedores do backend
  const { data: vendedoresRaw = [], isLoading: sellersLoading } = useQuery({
    queryKey: ["sellers"],
    queryFn: () => getSellers("", 0, 100),
  })

  // mapear formato do backend -> Vendedor (ajuste conforme backend real)
  const mapApiSellerToVendedor = (s: any): Vendedor => {
    const user = s?.user;
    // nome: prefer firstName + lastName when user exists
    const nome =
      user && (user.firstName || user.lastName)
        ? `${(user.firstName ?? "").trim()} ${(user.lastName ?? "").trim()}`.trim()
        : s.name ?? s.nome ?? `Seller ${s.id}`;

    // cargo: prefer the first user.group name when available, fallback to role/cargo
    const cargo =
      (user?.groups && user.groups.length > 0 && user.groups[0]?.name) ??
      s.role ??
      s.cargo ??
      "";

    return {
      id: String(s.id),
      nome,
      email: user?.email ?? s.email ?? "",
      telefone: s.phone ?? s.telefone ?? "",
      cargo,
      regiao: s.region ?? s.regiao ?? "",
      status: s.active === false ? "inativo" : "ativo",
      vendas: Number(s.salesAmount ?? s.vendas ?? 0),
      meta: Number(s.quota ?? s.meta ?? 0),
      dataContratacao: s.hiredAt ? new Date(s.hiredAt).toISOString().split("T")[0] : "",
      vendasMesAnterior: Number(s.lastMonthSales ?? s.vendasMesAnterior ?? 0),
      clientesAtivos: Number(s.activeCustomers ?? s.clientesAtivos ?? 0),
      ticketMedio: Number(s.avgTicket ?? s.ticketMedio ?? 0),
      conversao: Number(s.conversion ?? s.conversao ?? 0),
      grupoId: s.groupId ? String(s.groupId) : s.teamId ? String(s.teamId) : undefined,
    }
  }

  // Mostrar apenas sellers que têm o campo `user` preenchido
  const vendedores: Vendedor[] = vendedoresRaw
    .filter((s: any) => s && s.user) // filtra entradas sem user
    .map(mapApiSellerToVendedor)

  // log raw payload from backend to inspect structure
  useEffect(() => {
    if (!vendedoresRaw) return
    console.log("DEBUG: sellers raw payload from backend:", vendedoresRaw)
    try {
      console.log("DEBUG: sellers raw (stringified):", JSON.stringify(vendedoresRaw, null, 2))
    } catch (err) {
      // ignore stringify errors (circular refs)
    }
  }, [vendedoresRaw])
  const [grupos, setGrupos] = useState<GrupoVendedores[]>(gruposIniciais)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [vendedorSelecionado, setVendedorSelecionado] = useState<Vendedor | null>(null)
  const [mostrarEdicao, setMostrarEdicao] = useState(false)
  const [mostrarMetas, setMostrarMetas] = useState(false)
  const [mostrarFormularioGrupo, setMostrarFormularioGrupo] = useState(false)
  const [mostrarGerenciarGrupos, setMostrarGerenciarGrupos] = useState(false)
  const [novoVendedor, setNovoVendedor] = useState({
    nome: "",
    email: "",
    telefone: "",
    cargo: "",
    regiao: "",
    meta: "",
    grupoId: "",
  })
  const [novoGrupo, setNovoGrupo] = useState({
    nome: "",
    descricao: "",
    administradorId: "",
    metaGrupo: "",
    cor: "blue",
  })

  // alterna status no backend (optimistic update via cache)
  const updateSellerMutation = useMutation<Seller, Error, { id: number | string; data: any }>({
    mutationFn: (payload: { id: number | string; data: any }) =>
      updateSeller(Number(payload.id), payload.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sellers"] }),
  })

  const alternarStatus = (id: string) => {
    const current = vendedores.find((v) => v.id === id)
    const novo = current?.status === "ativo" ? "inativo" : "ativo"
    // use queryKey array form
    queryClient.setQueryData<Vendedor[] | undefined>(["sellers"], (old = []) =>
      old.map((v) => (v.id === id ? { ...v, status: novo } : v))
    )
    updateSellerMutation.mutate({ id, data: { active: novo === "ativo" } })
  }

  const atualizarMeta = (id: string, novaMeta: number) => {
    queryClient.setQueryData<Vendedor[] | undefined>(["sellers"], (old = []) =>
      old.map((v) => (v.id === id ? { ...v, meta: novaMeta } : v))
    )
    updateSellerMutation.mutate({ id, data: { quota: novaMeta } })
  }

  const deleteSellerMutation = useMutation<void, Error, number | string>({
    mutationFn: (id: number | string) => deleteSeller(Number(id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sellers"] }),
  })

  const excluirVendedor = (id: string) => {
    // use queryKey array form
    const previous = queryClient.getQueryData<Vendedor[]>(["sellers"])
    queryClient.setQueryData<Vendedor[] | undefined>(["sellers"], (old = []) => old.filter((v) => v.id !== id))
    deleteSellerMutation.mutate(id, {
      onError: () => queryClient.setQueryData<Vendedor[] | undefined>(["sellers"], previous),
    })
  }

  const criarGrupo = (e: React.FormEvent) => {
    e.preventDefault()
    const grupo: GrupoVendedores = {
      id: Date.now().toString(),
      nome: novoGrupo.nome,
      descricao: novoGrupo.descricao,
      administradorId: novoGrupo.administradorId,
      vendedoresIds: [],
      metaGrupo: Number.parseInt(novoGrupo.metaGrupo) || 0,
      cor: novoGrupo.cor,
    }

    setGrupos([...grupos, grupo])
    setNovoGrupo({ nome: "", descricao: "", administradorId: "", metaGrupo: "", cor: "blue" })
    setMostrarFormularioGrupo(false)
  }

  const adicionarVendedorAoGrupo = (vendedorId: string, grupoId: string) => {
    // use queryKey array form
    queryClient.setQueryData<Vendedor[] | undefined>(["sellers"], (old = []) =>
      old.map((v) => (v.id === vendedorId ? { ...v, grupoId } : v))
    )
    updateSellerMutation.mutate({ id: vendedorId, data: { groupId: grupoId } })
    setGrupos(
      grupos.map((g) =>
        g.id === grupoId
          ? { ...g, vendedoresIds: [...g.vendedoresIds.filter((id) => id !== vendedorId), vendedorId] }
          : g,
      ),
    )
  }

  const removerVendedorDoGrupo = (vendedorId: string, grupoId: string) => {
    queryClient.setQueryData<Vendedor[] | undefined>(["sellers"], (old = []) =>
      old.map((v) => (v.id === vendedorId ? { ...v, grupoId: undefined } : v))
    )
    updateSellerMutation.mutate({ id: vendedorId, data: { groupId: null } })
    setGrupos(
      grupos.map((g) =>
        g.id === grupoId ? { ...g, vendedoresIds: g.vendedoresIds.filter((id) => id !== vendedorId) } : g,
      ),
    )
  }

  const obterVendedoresDoGrupo = (grupoId: string) => {
    return vendedores.filter((v) => v.grupoId === grupoId)
  }

  const obterAdministradorGrupo = (administradorId: string) => {
    return vendedores.find((v) => v.id === administradorId)
  }

  const createSellerMutation = useMutation<Seller, Error, any>({
    mutationFn: (data: any) => createSeller(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellers"] })
      setMostrarFormulario(false)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      name: novoVendedor.nome,
      email: novoVendedor.email,
      phone: novoVendedor.telefone,
      role: novoVendedor.cargo,
      region: novoVendedor.regiao,
      quota: Number.parseInt(novoVendedor.meta) || 0,
      groupId: novoVendedor.grupoId || null,
    }
    createSellerMutation.mutate(payload)
    setNovoVendedor({ nome: "", email: "", telefone: "", cargo: "", regiao: "", meta: "", grupoId: "" })
  }

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor)
  }

  const calcularPercentualMeta = (vendas: number, meta: number) => {
    return meta > 0 ? Math.round((vendas / meta) * 100) : 0
  }

  const totalVendas = vendedores.reduce((acc, v) => acc + v.vendas, 0)
  const totalMetas = vendedores.reduce((acc, v) => acc + v.meta, 0)
  const vendedoresAtivos = vendedores.filter((v) => v.status === "ativo").length
  const mediaTicket =
    vendedores.length > 0 ? vendedores.reduce((acc, v) => acc + v.ticketMedio, 0) / vendedores.length : 0

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
                <BreadcrumbPage>Vendedores</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Vendedores</h1>
            <p className="text-muted-foreground">Gerencie sua equipe de vendas e acompanhe métricas</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setMostrarGerenciarGrupos(true)}>
              <UsersIcon className="mr-2 h-4 w-4" />
              Gerenciar Grupos
            </Button>
            <Button variant="outline" onClick={() => setMostrarMetas(true)}>
              <Target className="mr-2 h-4 w-4" />
              Gerenciar Metas
            </Button>
            <Button onClick={() => setMostrarFormulario(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Vendedor
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatarMoeda(totalVendas)}</div>
              <p className="text-xs text-muted-foreground">
                {calcularPercentualMeta(totalVendas, totalMetas)}% da meta total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendedores Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vendedoresAtivos}</div>
              <p className="text-xs text-muted-foreground">de {vendedores.length} vendedores</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Grupos Ativos</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{grupos.length}</div>
              <p className="text-xs text-muted-foreground">grupos de vendedores</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance Geral</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{calcularPercentualMeta(totalVendas, totalMetas)}%</div>
              <Progress value={calcularPercentualMeta(totalVendas, totalMetas)} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Performance Mensal</CardTitle>
              <CardDescription>Vendas vs Meta ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dadosPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatarMoeda(Number(value))} />
                  <Line type="monotone" dataKey="vendas" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="meta" stroke="#82ca9d" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Ranking de Vendedores</CardTitle>
              <CardDescription>Top performers do mês</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosRanking}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatarMoeda(Number(value))} />
                  <Bar dataKey="vendas" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="vendedores" className="w-full">
          <TabsList>
            <TabsTrigger value="vendedores">Vendedores</TabsTrigger>
            <TabsTrigger value="grupos">Grupos</TabsTrigger>
          </TabsList>

          <TabsContent value="vendedores">
            {mostrarFormulario && (
              <Card>
                <CardHeader>
                  <CardTitle>Cadastrar Novo Vendedor</CardTitle>
                  <CardDescription>Preencha os dados do novo vendedor</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nome">Nome Completo</Label>
                        <Input
                          id="nome"
                          value={novoVendedor.nome}
                          onChange={(e) => setNovoVendedor({ ...novoVendedor, nome: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={novoVendedor.email}
                          onChange={(e) => setNovoVendedor({ ...novoVendedor, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telefone">Telefone</Label>
                        <Input
                          id="telefone"
                          value={novoVendedor.telefone}
                          onChange={(e) => setNovoVendedor({ ...novoVendedor, telefone: e.target.value })}
                          placeholder="(11) 99999-9999"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cargo">Cargo</Label>
                        <Select
                          value={novoVendedor.cargo}
                          onValueChange={(value) => setNovoVendedor({ ...novoVendedor, cargo: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o cargo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="vendedor-junior">Vendedor Júnior</SelectItem>
                            <SelectItem value="vendedor-pleno">Vendedor Pleno</SelectItem>
                            <SelectItem value="vendedor-senior">Vendedor Sênior</SelectItem>
                            <SelectItem value="gerente-vendas">Gerente de Vendas</SelectItem>
                            <SelectItem value="coordenador-vendas">Coordenador de Vendas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="regiao">Região</Label>
                        <Select
                          value={novoVendedor.regiao}
                          onValueChange={(value) => setNovoVendedor({ ...novoVendedor, regiao: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a região" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sao-paulo">São Paulo</SelectItem>
                            <SelectItem value="rio-janeiro">Rio de Janeiro</SelectItem>
                            <SelectItem value="minas-gerais">Minas Gerais</SelectItem>
                            <SelectItem value="parana">Paraná</SelectItem>
                            <SelectItem value="santa-catarina">Santa Catarina</SelectItem>
                            <SelectItem value="rio-grande-sul">Rio Grande do Sul</SelectItem>
                            <SelectItem value="bahia">Bahia</SelectItem>
                            <SelectItem value="pernambuco">Pernambuco</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="meta">Meta Mensal (R$)</Label>
                        <Input
                          id="meta"
                          type="number"
                          value={novoVendedor.meta}
                          onChange={(e) => setNovoVendedor({ ...novoVendedor, meta: e.target.value })}
                          placeholder="200000"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="grupo">Grupo (Opcional)</Label>
                        <Select
                          value={novoVendedor.grupoId}
                          onValueChange={(value) => setNovoVendedor({ ...novoVendedor, grupoId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um grupo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nenhum grupo</SelectItem>
                            {grupos.map((grupo) => (
                              <SelectItem key={grupo.id} value={grupo.id}>
                                {grupo.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">Cadastrar Vendedor</Button>
                      <Button type="button" variant="outline" onClick={() => setMostrarFormulario(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
              <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Lista de Vendedores</CardTitle>
                    <CardDescription>{vendedores.length} vendedores cadastrados</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Search className="mr-2 h-4 w-4" />
                      Pesquisar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      Filtrar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Região</TableHead>
                      <TableHead>Grupo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Vendas</TableHead>
                      <TableHead>Meta</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Clientes</TableHead>
                      <TableHead>Ticket Médio</TableHead>
                      <TableHead>Conversão</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendedores.map((vendedor) => {
                      const grupo = grupos.find((g) => g.id === vendedor.grupoId)
                      const isAdmin = grupo?.administradorId === vendedor.id
                      return (
                        <TableRow key={vendedor.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {vendedor.nome}
                              {isAdmin && (
                                <span title="Administrador do Grupo">
                                  <Crown className="h-4 w-4 text-yellow-500" />
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{vendedor.cargo}</TableCell>
                          <TableCell>{vendedor.regiao}</TableCell>
                          <TableCell>
                            {grupo ? (
                              <Badge variant="outline" className={`border-${grupo.cor}-500 text-${grupo.cor}-700`}>
                                {grupo.nome}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">Sem grupo</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={vendedor.status === "ativo" ? "default" : "secondary"}>
                              {vendedor.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatarMoeda(vendedor.vendas)}</TableCell>
                          <TableCell>{formatarMoeda(vendedor.meta)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-muted rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full"
                                  style={{
                                    width: `${Math.min(calcularPercentualMeta(vendedor.vendas, vendedor.meta), 100)}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {calcularPercentualMeta(vendedor.vendas, vendedor.meta)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{vendedor.clientesAtivos}</TableCell>
                          <TableCell>{formatarMoeda(vendedor.ticketMedio)}</TableCell>
                          <TableCell>{vendedor.conversao}%</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setVendedorSelecionado(vendedor)
                                    setMostrarEdicao(true)
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => alternarStatus(vendedor.id)}>
                                  {vendedor.status === "ativo" ? (
                                    <>
                                      <UserX className="mr-2 h-4 w-4" />
                                      Desativar
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="mr-2 h-4 w-4" />
                                      Ativar
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => excluirVendedor(vendedor.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grupos">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Grupos de Vendedores</h2>
                <p className="text-muted-foreground">Organize sua equipe em grupos com administradores</p>
              </div>
              <Button onClick={() => setMostrarFormularioGrupo(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Grupo
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {grupos.map((grupo) => {
                const vendedoresGrupo = obterVendedoresDoGrupo(grupo.id)
                const administrador = obterAdministradorGrupo(grupo.administradorId)
                const vendasGrupo = vendedoresGrupo.reduce((acc, v) => acc + v.vendas, 0)
                const performanceGrupo = calcularPercentualMeta(vendasGrupo, grupo.metaGrupo)

                return (
                  <Card key={grupo.id} className={`border-l-4 border-l-${grupo.cor}-500`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <UsersIcon className="h-5 w-5" />
                          {grupo.nome}
                        </CardTitle>
                        <Badge variant="outline" className={`border-${grupo.cor}-500 text-${grupo.cor}-700`}>
                          {vendedoresGrupo.length} vendedores
                        </Badge>
                      </div>
                      <CardDescription>{grupo.descricao}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">Administrador:</span>
                        <span className="text-sm">{administrador?.nome || "Não definido"}</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Vendas do Grupo:</span>
                          <span className="font-medium">{formatarMoeda(vendasGrupo)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Meta do Grupo:</span>
                          <span className="font-medium">{formatarMoeda(grupo.metaGrupo)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Performance:</span>
                          <span className="font-medium">{performanceGrupo}%</span>
                        </div>
                        <Progress value={performanceGrupo} className="mt-2" />
                      </div>

                      <div className="space-y-2">
                        <span className="text-sm font-medium">Vendedores:</span>
                        <div className="space-y-1">
                          {vendedoresGrupo.map((vendedor) => (
                            <div key={vendedor.id} className="flex items-center justify-between text-sm">
                              <span>{vendedor.nome}</span>
                              <Badge
                                variant={vendedor.status === "ativo" ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {vendedor.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={mostrarFormularioGrupo} onOpenChange={setMostrarFormularioGrupo}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Grupo</DialogTitle>
              <DialogDescription>Defina um grupo de vendedores com um administrador</DialogDescription>
            </DialogHeader>
            <form onSubmit={criarGrupo} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nomeGrupo">Nome do Grupo</Label>
                <Input
                  id="nomeGrupo"
                  value={novoGrupo.nome}
                  onChange={(e) => setNovoGrupo({ ...novoGrupo, nome: e.target.value })}
                  placeholder="Ex: Equipe Sudeste"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricaoGrupo">Descrição</Label>
                <Input
                  id="descricaoGrupo"
                  value={novoGrupo.descricao}
                  onChange={(e) => setNovoGrupo({ ...novoGrupo, descricao: e.target.value })}
                  placeholder="Descrição do grupo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="administradorGrupo">Administrador</Label>
                <Select
                  value={novoGrupo.administradorId}
                  onValueChange={(value) => setNovoGrupo({ ...novoGrupo, administradorId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o administrador" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendedores
                      .filter((v) => v.status === "ativo")
                      .map((vendedor) => (
                        <SelectItem key={vendedor.id} value={vendedor.id}>
                          {vendedor.nome} - {vendedor.cargo}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaGrupo">Meta do Grupo (R$)</Label>
                <Input
                  id="metaGrupo"
                  type="number"
                  value={novoGrupo.metaGrupo}
                  onChange={(e) => setNovoGrupo({ ...novoGrupo, metaGrupo: e.target.value })}
                  placeholder="500000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="corGrupo">Cor do Grupo</Label>
                <Select value={novoGrupo.cor} onValueChange={(value) => setNovoGrupo({ ...novoGrupo, cor: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Azul</SelectItem>
                    <SelectItem value="green">Verde</SelectItem>
                    <SelectItem value="red">Vermelho</SelectItem>
                    <SelectItem value="purple">Roxo</SelectItem>
                    <SelectItem value="orange">Laranja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setMostrarFormularioGrupo(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Criar Grupo</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={mostrarGerenciarGrupos} onOpenChange={setMostrarGerenciarGrupos}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Gerenciar Grupos de Vendedores</DialogTitle>
              <DialogDescription>Adicione ou remova vendedores dos grupos</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {grupos.map((grupo) => {
                const vendedoresGrupo = obterVendedoresDoGrupo(grupo.id)
                const vendedoresSemGrupo = vendedores.filter((v) => !v.grupoId || v.grupoId !== grupo.id)

                return (
                  <div key={grupo.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <UsersIcon className="h-5 w-5" />
                      <h3 className="font-semibold">{grupo.nome}</h3>
                      <Badge variant="outline" className={`border-${grupo.cor}-500 text-${grupo.cor}-700`}>
                        {vendedoresGrupo.length} vendedores
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Vendedores no Grupo:</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {vendedoresGrupo.map((vendedor) => (
                            <div key={vendedor.id} className="flex items-center justify-between p-2 bg-muted rounded">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{vendedor.nome}</span>
                                {grupo.administradorId === vendedor.id && <Crown className="h-4 w-4 text-yellow-500" />}
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removerVendedorDoGrupo(vendedor.id, grupo.id)}
                              >
                                Remover
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Adicionar Vendedores:</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {vendedoresSemGrupo.map((vendedor) => (
                            <div key={vendedor.id} className="flex items-center justify-between p-2 bg-muted rounded">
                              <span className="text-sm">{vendedor.nome}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => adicionarVendedorAoGrupo(vendedor.id, grupo.id)}
                              >
                                Adicionar
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <DialogFooter>
              <Button onClick={() => setMostrarGerenciarGrupos(false)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={mostrarMetas} onOpenChange={setMostrarMetas}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Gerenciar Metas dos Vendedores</DialogTitle>
              <DialogDescription>Defina e ajuste as metas mensais para cada vendedor</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {vendedores.map((vendedor) => (
                <div key={vendedor.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{vendedor.nome}</h4>
                    <p className="text-sm text-muted-foreground">
                      {vendedor.cargo} - {vendedor.regiao}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Meta Atual</p>
                      <p className="font-medium">{formatarMoeda(vendedor.meta)}</p>
                    </div>
                    <Input
                      type="number"
                      placeholder="Nova meta"
                      className="w-32"
                      onBlur={(e) => {
                        const novaMeta = Number.parseInt(e.target.value)
                        if (novaMeta > 0) {
                          atualizarMeta(vendedor.id, novaMeta)
                        }
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button onClick={() => setMostrarMetas(false)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarInset>
  )
}