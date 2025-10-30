"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Eye, CheckCircle, XCircle, Search, AlertCircle, Clock } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/hooks/use-auth"
import invoiceModel, { type InvoiceUI } from "@/models/invoice.model"
import { useToast } from "@/hooks/use-toast"

type OrderStatus = "em_aberto" | "aprovada" | "faturada" | "cancelada" | "rejeitada"

interface OrderProduct {
  id: string
  name: string
  quantity: number
  price: number
  subtotal: number
}

interface OrderHistory {
  id: string
  action: string
  user: string
  date: string
  description: string
}

interface Order {
  id: string
  orderNumber: string
  customer: string
  date: string
  totalValue: number
  status: OrderStatus
  seller: string
  products: OrderProduct[]
  history: OrderHistory[]
  notes?: string
  daysWaiting: number
}

const statusConfig = {
  em_aberto: { label: "Pendente", color: "bg-yellow-500" },
  aprovada: { label: "Aprovada", color: "bg-green-500" },
  faturada: { label: "Faturada", color: "bg-purple-500" },
  cancelada: { label: "Cancelada", color: "bg-red-500" },
  rejeitada: { label: "Rejeitada", color: "bg-red-600" },
}

const mockPendingOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-2024-002",
    customer: "Tech Solutions",
    date: "2024-01-16",
    totalValue: 8500,
    status: "em_aberto",
    seller: "Maria Santos",
    products: [{ id: "3", name: "Produto C", quantity: 5, price: 1700, subtotal: 8500 }],
    history: [
      { id: "3", action: "Criada", user: "Maria Santos", date: "2024-01-16 09:15", description: "Ordem criada" },
    ],
    daysWaiting: 2,
  },
  {
    id: "2",
    orderNumber: "ORD-2024-003",
    customer: "Inovação Digital",
    date: "2024-01-17",
    totalValue: 25000,
    status: "em_aberto",
    seller: "João Silva",
    products: [
      { id: "4", name: "Produto D", quantity: 10, price: 2000, subtotal: 20000 },
      { id: "5", name: "Produto E", quantity: 5, price: 1000, subtotal: 5000 },
    ],
    history: [{ id: "4", action: "Criada", user: "João Silva", date: "2024-01-17 11:30", description: "Ordem criada" }],
    notes: "Cliente VIP - prioridade alta",
    daysWaiting: 1,
  },
  {
    id: "3",
    orderNumber: "ORD-2024-004",
    customer: "Comércio Global",
    date: "2024-01-14",
    totalValue: 12000,
    status: "em_aberto",
    seller: "Carlos Oliveira",
    products: [{ id: "6", name: "Produto F", quantity: 8, price: 1500, subtotal: 12000 }],
    history: [
      { id: "5", action: "Criada", user: "Carlos Oliveira", date: "2024-01-14 14:20", description: "Ordem criada" },
    ],
    daysWaiting: 4,
  },
]

export default function AprovacoesPage() {
  const { user: authUser, loading: authLoading, isAuthenticated } = useAuth()
  const { toast } = useToast()
  
  // Tentar obter user de várias fontes
  const [user, setUser] = useState<any>(null)
  
  useEffect(() => {
    // 1. Tentar do useAuth
    if (authUser) {
      setUser(authUser)
      return
    }
    
    // 2. Tentar do localStorage (fallback)
    try {
      const storedUser = localStorage.getItem('user') || localStorage.getItem('currentUser')
      if (storedUser) {
        const parsed = JSON.parse(storedUser)
        console.log("[aprovacoes] user obtido do localStorage:", parsed)
        setUser(parsed)
        return
      }
    } catch (e) {
      console.warn("[aprovacoes] erro ao ler localStorage", e)
    }
    
    // 3. Tentar do sessionStorage
    try {
      const sessionUser = sessionStorage.getItem('user')
      if (sessionUser) {
        const parsed = JSON.parse(sessionUser)
        console.log("[aprovacoes] user obtido do sessionStorage:", parsed)
        setUser(parsed)
        return
      }
    } catch (e) {
      console.warn("[aprovacoes] erro ao ler sessionStorage", e)
    }
  }, [authUser])
  
  // Obter userId de diferentes formatos possíveis
  const userId = user?.id || user?.sub || user?.userId || user?.email || null
  
  console.log("[aprovacoes] auth state:", { 
    userId, 
    authLoading, 
    isAuthenticated,
    hasAuthUser: !!authUser,
    hasUser: !!user,
    userKeys: user ? Object.keys(user) : [],
  })
  
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [approvalNotes, setApprovalNotes] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [processing, setProcessing] = useState(false)

  // Filtros
  const [searchTerm, setSearchTerm] = useState("")

  // Carregar invoices pendentes de aprovação
  useEffect(() => {
    // Só tenta carregar se auth terminou de carregar
    if (authLoading) {
      console.log("[aprovacoes] aguardando autenticação...")
      return
    }
    
    if (!userId) {
      console.warn("[aprovacoes] userId não disponível, user:", user)
      setLoading(false)
      setOrders([])
      return
    }
    
    console.log("[aprovacoes] user detectado, carregando invoices para userId:", userId)
    loadPendingInvoices()
  }, [userId, authLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadPendingInvoices() {
    const currentUserId = user?.id || user?.sub || user?.userId || user?.email
    
    if (!currentUserId) {
      console.warn("[aprovacoes] userId não disponível em loadPendingInvoices, user:", user)
      setLoading(false)
      return
    }
    
    setLoading(true)
    
    // Timeout de segurança
    const timeoutId = setTimeout(() => {
      console.warn("[aprovacoes] timeout ao carregar invoices")
      setLoading(false)
      setOrders([]) // Mostrar lista vazia em vez de infinito
      toast.error("A requisição demorou muito. Clique em 'Atualizar' para tentar novamente.", {
        description: "Tempo esgotado"
      })
    }, 10000) // 10 segundos
    
    try {
      console.log("[aprovacoes] carregando invoices pendentes para userId:", currentUserId)
      
      // Buscar todas as invoices
      const allInvoices = await invoiceModel.list(0, 100)
      
      clearTimeout(timeoutId) // Limpar timeout se sucesso
      
      console.log("[aprovacoes] total de invoices retornadas", allInvoices?.length ?? 0)
      
      if (!Array.isArray(allInvoices)) {
        console.warn("[aprovacoes] invoices não é array", allInvoices)
        setOrders([])
        setLoading(false)
        return
      }
      
      console.log("[aprovacoes] currentUserId:", currentUserId)
      console.log("[aprovacoes] total invoices:", allInvoices.length)
      
      // Filtrar apenas as que estão pendentes e o user atual é o aprovador
      const pendingForUser = allInvoices.filter((inv) => {
        const isPending = inv.status === "em_aberto"
        const isApprover = inv.approverIds?.includes(String(currentUserId))
        console.log("[aprovacoes] invoice", inv.id, {
          isPending, 
          isApprover, 
          approverIds: inv.approverIds,
          approverIdsType: typeof inv.approverIds,
          approverIdsIsArray: Array.isArray(inv.approverIds),
          currentUserId: String(currentUserId),
          status: inv.status,
          sellerId: inv.raw?.sellerId,
          code: inv.code,
          rawApproverId: inv.raw?.approverId,
          rawApproverIds: inv.raw?.approverIds
        })
        return isPending && isApprover
      })
      
      console.log("[aprovacoes] encontradas", pendingForUser.length, "invoices pendentes")
      
      // Mapear para o formato Order
      const mappedOrders: Order[] = pendingForUser.map((inv) => {
        const createdDate = inv.date ? new Date(inv.date) : new Date()
        const daysWaiting = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
        
        return {
          id: String(inv.id),
          orderNumber: inv.code ?? `INV-${inv.id}`,
          customer: inv.customer ?? "Cliente não informado",
          date: inv.date ?? new Date().toISOString(),
          totalValue: inv.total ?? 0,
          status: inv.status as OrderStatus,
          seller: inv.seller ?? "Vendedor não informado",
          products: inv.items.map((item) => ({
            id: String(item.id),
            name: item.description ?? "Produto",
            quantity: item.quantity,
            price: item.unitPrice,
            subtotal: item.total,
          })),
          history: inv.history.map((h) => ({
            id: String(h.id),
            action: h.action ?? "",
            user: h.user ?? "",
            date: h.date ?? "",
            description: h.description ?? "",
          })),
          notes: inv.notes,
          daysWaiting,
        }
      })
      
      setOrders(mappedOrders)
      console.log("[aprovacoes] mapeadas", mappedOrders.length, "ordens")
    } catch (error: any) {
      console.error("[aprovacoes] ERRO DETALHADO ao carregar invoices", {
        error,
        message: error?.message,
        response: error?.response,
        status: error?.response?.status,
      })
      clearTimeout(timeoutId)
      setOrders([]) // Limpar em caso de erro
      toast.error(error?.message ?? "Não foi possível carregar as aprovações pendentes. Verifique o console para mais detalhes.", {
        description: "Erro ao carregar aprovações"
      })
    } finally {
      clearTimeout(timeoutId)
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.seller.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch && order.status === "em_aberto"
  })

  const pendingCount = orders.filter((o) => o.status === "em_aberto").length
  const urgentCount = orders.filter((o) => o.status === "em_aberto" && o.daysWaiting >= 3).length
  const totalValue = orders.filter((o) => o.status === "em_aberto").reduce((sum, order) => sum + order.totalValue, 0)

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailOpen(true)
  }

  const handleApproveClick = (order: Order) => {
    setSelectedOrder(order)
    setIsApproveDialogOpen(true)
  }

  const handleRejectClick = (order: Order) => {
    setSelectedOrder(order)
    setIsRejectDialogOpen(true)
  }

  const handleApproveOrder = async () => {
    const currentUserId = user?.id || user?.sub || user?.userId || user?.email
    if (!selectedOrder || !currentUserId) return
    
    setProcessing(true)
    try {
      console.log("[aprovacoes] aprovando invoice", selectedOrder.id)
      
      // Aprovar via model
      await invoiceModel.approve(selectedOrder.id, String(currentUserId))
      
      toast.success(`Ordem ${selectedOrder.orderNumber} foi aprovada com sucesso`, {
        description: "Ordem aprovada"
      })
      
      // Recarregar lista
      await loadPendingInvoices()
      
      setIsApproveDialogOpen(false)
      setIsDetailOpen(false)
      setApprovalNotes("")
      setSelectedOrder(null)
    } catch (error) {
      console.error("[aprovacoes] erro ao aprovar", error)
      toast.error("Não foi possível aprovar a ordem", {
        description: "Erro ao aprovar"
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleRejectOrder = async () => {
    if (!selectedOrder || !rejectionReason) {
      toast.error("Informe o motivo da rejeição", {
        description: "Motivo obrigatório"
      })
      return
    }
    
    setProcessing(true)
    try {
      console.log("[aprovacoes] rejeitando invoice", selectedOrder.id)
      
      // Atualizar status para cancelada/rejeitada
      await invoiceModel.update(selectedOrder.id, {
        status: "cancelada",
        notes: `${selectedOrder.notes ?? ""}\n\nREJEITADA: ${rejectionReason}`.trim(),
      })
      
      toast.success(`Ordem ${selectedOrder.orderNumber} foi rejeitada`, {
        description: "Ordem rejeitada"
      })
      
      // Recarregar lista
      await loadPendingInvoices()
      
      setIsRejectDialogOpen(false)
      setIsDetailOpen(false)
      setRejectionReason("")
      setSelectedOrder(null)
    } catch (error) {
      console.error("[aprovacoes] erro ao rejeitar", error)
      toast.error("Não foi possível rejeitar a ordem", {
        description: "Erro ao rejeitar"
      })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Aprovação de Ordens</h1>
          <p className="text-muted-foreground">
            {authLoading 
              ? "Verificando autenticação..." 
              : loading 
              ? "Carregando..." 
              : userId
              ? `${pendingCount} ${pendingCount === 1 ? "ordem pendente" : "ordens pendentes"} de aprovação`
              : "Faça login para visualizar as aprovações pendentes"
            }
          </p>
        </div>
        <Button onClick={loadPendingInvoices} disabled={loading || authLoading || !userId} variant="outline">
          {loading ? "Carregando..." : "Atualizar"}
        </Button>
      </div>

      {!authLoading && !loading && !userId && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Autenticação necessária</AlertTitle>
          <AlertDescription>
            Você precisa estar logado como gerente ou administrador para visualizar e aprovar ordens de venda.
            Por favor, faça login no sistema.
          </AlertDescription>
        </Alert>
      )}

      {/* Alertas */}
      {!loading && urgentCount > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Atenção!</AlertTitle>
          <AlertDescription>
            Você tem {urgentCount} {urgentCount === 1 ? "ordem" : "ordens"} aguardando aprovação há mais de 3 dias.
          </AlertDescription>
        </Alert>
      )}

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ordens Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ordens Urgentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{urgentCount}</div>
            <p className="text-xs text-muted-foreground">Mais de 3 dias aguardando</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Pendente</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totalValue)}
            </div>
            <p className="text-xs text-muted-foreground">Em ordens pendentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Buscar Ordens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número, cliente ou vendedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Ordens Pendentes */}
      <Card>
        <CardHeader>
          <CardTitle>Ordens Pendentes de Aprovação</CardTitle>
          <CardDescription>Revise e aprove ou rejeite as ordens de venda</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Carregando aprovações pendentes...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº da Ordem</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Dias Aguardando</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? "Nenhuma ordem encontrada com os critérios de busca" : "Nenhuma ordem pendente de aprovação"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id} className={order.daysWaiting >= 3 ? "bg-destructive/5" : ""}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>{order.seller}</TableCell>
                      <TableCell>{new Date(order.date).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>
                        <Badge variant={order.daysWaiting >= 3 ? "destructive" : "secondary"}>
                          {order.daysWaiting} {order.daysWaiting === 1 ? "dia" : "dias"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(order.totalValue)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleViewOrder(order)} title="Visualizar">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleApproveClick(order)}
                            disabled={processing}
                            className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Aprovar
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleRejectClick(order)} disabled={processing}>
                          <XCircle className="mr-1 h-4 w-4" />
                          Rejeitar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      {/* Sheet de Detalhes */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedOrder && (
            <>
              <SheetHeader>
                <SheetTitle>Detalhes da Ordem {selectedOrder.orderNumber}</SheetTitle>
                <SheetDescription>Revise os detalhes antes de aprovar ou rejeitar</SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Informações Gerais */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informações Gerais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Cliente</Label>
                        <p className="font-medium">{selectedOrder.customer}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Vendedor</Label>
                        <p className="font-medium">{selectedOrder.seller}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Data</Label>
                        <p className="font-medium">{new Date(selectedOrder.date).toLocaleDateString("pt-BR")}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Dias Aguardando</Label>
                        <Badge variant={selectedOrder.daysWaiting >= 3 ? "destructive" : "secondary"}>
                          {selectedOrder.daysWaiting} {selectedOrder.daysWaiting === 1 ? "dia" : "dias"}
                        </Badge>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-muted-foreground">Valor Total</Label>
                        <p className="font-bold text-2xl">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(selectedOrder.totalValue)}
                        </p>
                      </div>
                    </div>
                    {selectedOrder.notes && (
                      <div>
                        <Label className="text-muted-foreground">Observações</Label>
                        <p className="mt-1 text-sm">{selectedOrder.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Produtos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Produtos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produto</TableHead>
                          <TableHead className="text-right">Qtd</TableHead>
                          <TableHead className="text-right">Preço Unit.</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.products.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>{product.name}</TableCell>
                            <TableCell className="text-right">{product.quantity}</TableCell>
                            <TableCell className="text-right">
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(product.price)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(product.subtotal)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Histórico */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Histórico</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedOrder.history.map((item, index) => (
                        <div key={item.id} className="flex gap-4">
                          <div className="relative">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              {index + 1}
                            </div>
                            {index < selectedOrder.history.length - 1 && (
                              <div className="absolute left-4 top-8 h-full w-px bg-border" />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <p className="font-medium">{item.action}</p>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {item.user} • {item.date}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Ações */}
                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleApproveClick(selectedOrder)}
                    disabled={processing}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Aprovar Ordem
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1" 
                    onClick={() => handleRejectClick(selectedOrder)}
                    disabled={processing}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Rejeitar Ordem
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Dialog de Aprovação */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprovar Ordem {selectedOrder?.orderNumber}</DialogTitle>
            <DialogDescription>
              Confirme a aprovação desta ordem de venda. Você pode adicionar observações opcionais.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="approvalNotes">Observações (opcional)</Label>
              <Textarea
                id="approvalNotes"
                placeholder="Adicione observações sobre a aprovação..."
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)} disabled={processing}>
              Cancelar
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700" 
              onClick={handleApproveOrder}
              disabled={processing}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {processing ? "Aprovando..." : "Confirmar Aprovação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Rejeição */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Ordem {selectedOrder?.orderNumber}</DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição desta ordem de venda. Este campo é obrigatório.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Motivo da Rejeição *</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Descreva o motivo da rejeição..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)} disabled={processing}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRejectOrder} 
              disabled={!rejectionReason || processing}
            >
              <XCircle className="mr-2 h-4 w-4" />
              {processing ? "Rejeitando..." : "Confirmar Rejeição"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
