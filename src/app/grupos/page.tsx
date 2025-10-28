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
import { Users, Plus, Settings, Target, TrendingUp, Edit, Crown, Trash2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useGruposModel } from "@/models/grupo.model"

export default function GruposPage() {
  const { user } = useAuth()

  // -> Presentation-only: UI state (dialogs, form values)
  const [dialogoEditarAberto, setDialogoEditarAberto] = useState(false)
  const [dialogoGerenciarAberto, setDialogoGerenciarAberto] = useState(false)
  const [dialogoAdicionarMembroAberto, setDialogoAdicionarMembroAberto] = useState(false)
  const [dialogoEditarMembroAberto, setDialogoEditarMembroAberto] = useState(false)

  const [novoGrupo, setNovoGrupo] = useState({
    nome: "",
    lider: "",
    descricao: "",
    metaMensal: "",
  })

  const [novoMembro, setNovoMembro] = useState({ nome: "", email: "", telefone: "" })
  const [membroEditandoLocal, setMembroEditandoLocal] = useState<any | null>(null)
  const [vendedorSelecionado, setVendedorSelecionado] = useState("")

  // -> Model (single source of truth)
  const {
    gruposFiltrados,
    selecionado,
    editando,
    setEditando,
    setSelecionado,
    criarGrupo,
    atualizarGrupo,
    deletarGrupo,
    adicionarVendedor,
    removerVendedor,
    calcularPerformance,
    gerentes, // <- vem do model
    vendedoresDisponiveis, // <- ADICIONADO: vem do model (apenas vendedores livres)
  } = useGruposModel()

  // Tudo visível, independente de role
  const podeGerenciarTodos = true

  useEffect(() => {
    if (editando) setDialogoEditarAberto(true)
  }, [editando])

  // --- Handlers delegating to model (UI remains presentation-only) ---
  const handleCriarGrupo = async () => {
    await criarGrupo({
      nome: novoGrupo.nome,
      descricao: novoGrupo.descricao,
      metaMensal: Number(novoGrupo.metaMensal || 0),
      liderUserId: novoGrupo.lider || null, // Will be converted to string in model
    })
    setNovoGrupo({ nome: "", lider: "", descricao: "", metaMensal: "" })
    setDialogoEditarAberto(false)
  }

  const handleSalvarEdicaoGrupo = async () => {
    if (!editando) return
    await atualizarGrupo(editando.id, {
      nome: editando.nome,
      descricao: editando.descricao,
      metaMensal: Number(editando.metaMensal ?? editando.metaMensal),
      liderUserId: editando.liderUserId ?? editando.lider ?? null,
      status: editando.status,
    } as any)
    setEditando(null)
    setDialogoEditarAberto(false)
  }

  const handleGerenciarGrupo = (grupo: any) => {
    setSelecionado(grupo)
    setDialogoGerenciarAberto(true)
  }

  const handleAdicionarMembro = async () => {
    if (!selecionado) return
    if (!vendedorSelecionado) {
      alert("Selecione um vendedor")
      return
    }
    await adicionarVendedor(selecionado.id, vendedorSelecionado)
    setVendedorSelecionado("")
    setDialogoAdicionarMembroAberto(false)
  }

  const handleRemoverMembro = async (index: number) => {
    if (!selecionado) return
    const vendedor = selecionado.vendedores?.[index]
    if (!vendedor) return
    if (confirm("Tem certeza que deseja remover este membro do grupo?")) {
      await removerVendedor(selecionado.id, vendedor.id ?? vendedor.email ?? vendedor.nome)
    }
  }

  const handleEditarMembro = (vendedor: any, index: number) => {
    setMembroEditandoLocal({ ...vendedor, index })
    setDialogoEditarMembroAberto(true)
  }

  const handleSalvarEdicaoMembro = async () => {
    if (!membroEditandoLocal || !selecionado) return
    setMembroEditandoLocal(null)
    setDialogoEditarMembroAberto(false)
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">{podeGerenciarTodos ? "Gerenciamento de Grupos" : "Meu Grupo"}</h1>
        </div>
      </header>

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
          <Dialog open={dialogoEditarAberto} onOpenChange={setDialogoEditarAberto}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Grupo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Grupo</DialogTitle>
                <DialogDescription>Configure um novo grupo de vendas com líder e meta mensal.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nome">Nome do Grupo</Label>
                  <Input
                    id="nome"
                    value={novoGrupo.nome}
                    onChange={(e) => setNovoGrupo({ ...novoGrupo, nome: e.target.value })}
                    placeholder="Ex: Equipe Alpha"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lider">Líder do Grupo</Label>
                  <Select onValueChange={(value) => setNovoGrupo({ ...novoGrupo, lider: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um líder" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">João Silva</SelectItem>
                      <SelectItem value="2">Maria Oliveira</SelectItem>
                      <SelectItem value="3">Carlos Santos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="meta">Meta Mensal (R$)</Label>
                  <Input
                    id="meta"
                    type="number"
                    value={novoGrupo.metaMensal}
                    onChange={(e) => setNovoGrupo({ ...novoGrupo, metaMensal: e.target.value })}
                    placeholder="150000"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={novoGrupo.descricao}
                    onChange={(e) => setNovoGrupo({ ...novoGrupo, descricao: e.target.value })}
                    placeholder="Descreva o foco e especialidade do grupo"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCriarGrupo}>Criar Grupo</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

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
                    {gruposFiltrados.reduce((acc, grupo) => acc + (grupo.membros || 0), 0)}
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
                    R$ {gruposFiltrados.reduce((acc, grupo) => acc + (grupo.metaMensal || 0), 0).toLocaleString()}
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
                      gruposFiltrados.reduce((acc, grupo) => acc + (grupo.vendidoMes || 0), 0),
                      gruposFiltrados.reduce((acc, grupo) => acc + (grupo.metaMensal || 0), 0),
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
                        <span>Vendido: R$ {grupo.vendidoMes?.toLocaleString()}</span>
                        <span>Meta: R$ {grupo.metaMensal?.toLocaleString()}</span>
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditando(grupo)
                          setDialogoEditarAberto(true)
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleGerenciarGrupo(grupo)}>
                        <Settings className="h-4 w-4 mr-1" />
                        Gerenciar
                      </Button>
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
                          <p className="font-medium">R$ {grupo.metaMensal?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Vendido</p>
                          <p className="font-medium">R$ {grupo.vendidoMes?.toLocaleString()}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Vendedores do Grupo</h4>
                        <div className="space-y-2">
                          {grupo.vendedores?.map((vendedor: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-2 border rounded">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>
                                    {vendedor.nome
                                      .split(" ")
                                      .map((n: string) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{vendedor.nome}</span>
                                <Badge variant={vendedor.status === "ativo" ? "default" : "secondary"}>
                                  {vendedor.status}
                                </Badge>
                              </div>
                              <div className="text-sm">R$ {vendedor.vendas?.toLocaleString()}</div>
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
                      .slice()
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
                              R$ {grupo.vendidoMes?.toLocaleString()} / R$ {grupo.metaMensal?.toLocaleString()}
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

        {/* Edit Group Dialog */}
        <Dialog open={dialogoEditarAberto} onOpenChange={setDialogoEditarAberto}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Grupo</DialogTitle>
              <DialogDescription>Modifique as informações do grupo selecionado.</DialogDescription>
            </DialogHeader>
            {editando && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-nome">Nome do Grupo</Label>
                  <Input
                    id="edit-nome"
                    value={editando.nome}
                    onChange={(e) => setEditando({ ...editando, nome: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-lider">Líder do Grupo</Label>
                  {gerentes.length > 0 ? (
                    <Select
                      value={editando.liderUserId ? String(editando.liderUserId) : ""}
                      onValueChange={(value) => {
                        const selected = gerentes.find((g) => String(g.id) === value)
                        setEditando({
                          ...editando,
                          liderUserId: value, // Keep as string
                          lider: selected?.nome ?? "",
                        })
                      }}
                    >
                      <SelectTrigger id="edit-lider">
                        <SelectValue placeholder="Selecione um gerente" />
                      </SelectTrigger>
                      <SelectContent>
                        {gerentes.map((g) => (
                          <SelectItem key={String(g.id)} value={String(g.id)}>
                            {g.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-sm text-muted-foreground">Carregando gerentes...</div>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-meta">Meta Mensal (R$)</Label>
                  <Input
                    id="edit-meta"
                    type="number"
                    value={String(editando.metaMensal ?? "")}
                    onChange={(e) => setEditando({ ...editando, metaMensal: Number(e.target.value) })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-descricao">Descrição</Label>
                  <Textarea
                    id="edit-descricao"
                    value={editando.descricao}
                    onChange={(e) => setEditando({ ...editando, descricao: e.target.value })}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => { setEditando(null); setDialogoEditarAberto(false) }}>
                Cancelar
              </Button>
              <Button onClick={handleSalvarEdicaoGrupo}>Salvar Alterações</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Gerenciar Group Dialog */}
        <Dialog open={dialogoGerenciarAberto} onOpenChange={setDialogoGerenciarAberto}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Gerenciar Grupo: {selecionado?.nome}</DialogTitle>
              <DialogDescription>Gerencie membros, metas e configurações do grupo.</DialogDescription>
            </DialogHeader>
            {selecionado && (
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
                    {selecionado.vendedores?.map((vendedor: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {vendedor.nome
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{vendedor.nome}</p>
                            <p className="text-sm text-muted-foreground">R$ {vendedor.vendas?.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={vendedor.status === "ativo" ? "default" : "secondary"}>
                            {vendedor.status}
                          </Badge>
                          <Button variant="outline" size="sm" onClick={() => handleEditarMembro(vendedor, index)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleRemoverMembro(index)}>
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
                      <Input type="number" value={selecionado.metaMensal} placeholder="Meta em R$" readOnly />
                    </div>
                    <div className="grid gap-2">
                      <Label>Performance Atual</Label>
                      <div className="p-3 bg-muted rounded">
                        <p className="text-2xl font-bold">
                          {calcularPerformance(selecionado.vendidoMes, selecionado.metaMensal)}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                          R$ {selecionado.vendidoMes?.toLocaleString()} de R$ {selecionado.metaMensal?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="config" className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>Status do Grupo</Label>
                      <Select defaultValue={selecionado.status} onValueChange={(v) => setSelecionado({ ...selecionado, status: v })}>
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
                      <Textarea value={selecionado.descricao} placeholder="Descrição e foco do grupo" onChange={(e) => setSelecionado({ ...selecionado, descricao: e.target.value })} />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogoGerenciarAberto(false)}>
                Fechar
              </Button>
              <Button onClick={async () => {
                if (selecionado) await atualizarGrupo(selecionado.id, selecionado)
                setDialogoGerenciarAberto(false)
              }}>Salvar Alterações</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Adicionar Membro Dialog */}
        <Dialog open={dialogoAdicionarMembroAberto} onOpenChange={setDialogoAdicionarMembroAberto}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Membro</DialogTitle>
              <DialogDescription>Adicione um novo vendedor ao grupo {selecionado?.nome}.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="membro-select">Vendedor disponível</Label>
                {Array.isArray(vendedoresDisponiveis) && vendedoresDisponiveis.length > 0 ? (
                  <Select value={vendedorSelecionado} onValueChange={setVendedorSelecionado}>
                    <SelectTrigger id="membro-select">
                      <SelectValue placeholder="Selecione um vendedor (não vinculado a nenhum grupo)" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendedoresDisponiveis.map((v) => (
                        <SelectItem key={String(v.id)} value={String(v.id)}>
                          {v.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    {Array.isArray(vendedoresDisponiveis)
                      ? "Nenhum vendedor disponível — todos já estão em um grupo."
                      : "Carregando vendedores..."}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogoAdicionarMembroAberto(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAdicionarMembro} disabled={!vendedorSelecionado}>
                Adicionar Membro
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Member Dialog */}
        <Dialog open={dialogoEditarMembroAberto} onOpenChange={setDialogoEditarMembroAberto}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Membro</DialogTitle>
              <DialogDescription>Modifique as informações do vendedor selecionado.</DialogDescription>
            </DialogHeader>
            {membroEditandoLocal && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-membro-nome">Nome Completo</Label>
                  <Input
                    id="edit-membro-nome"
                    value={membroEditandoLocal.nome}
                    onChange={(e) => setMembroEditandoLocal({ ...membroEditandoLocal, nome: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-membro-status">Status</Label>
                  <Select
                    value={membroEditandoLocal.status}
                    onValueChange={(value) => setMembroEditandoLocal({ ...membroEditandoLocal, status: value })}
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
              <Button onClick={handleSalvarEdicaoMembro}>Salvar Alterações</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarInset>

    )
}