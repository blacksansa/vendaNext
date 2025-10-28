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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Eye, Edit, Copy, X, Plus, Search, Filter, ShoppingCart, Trash2 } from "lucide-react"
import invoiceModel, { type InvoiceUI } from "@/models/invoice.model"
import { listCustomers, type CustomerDTO } from "@/services/customer.service"
import { getApproverForSeller, getSellerIdFromUserId } from "@/lib/approval-helper"
import { useAuth } from "@/hooks/use-auth"

// Perfil atual (troque por seu hook de auth e groups quando disponível)
type UserRole = "admin" | "manager" | "seller"
interface CurrentUser {
  id: string
  name: string
  role: UserRole
}

// Helpers de permissão/status
const canApprove = (u: CurrentUser) => u.role === "admin" || u.role === "manager"
const canCancel = (u: CurrentUser, order: Order) =>
  u.role === "admin" || u.role === "manager" || (u.role === "seller" && order.status === "em_aberto" && order.seller === u.name)
const canInvoice = (order: Order) => order.status === "aprovada"
const nextOrderId = (list: Order[]) => String((Math.max(0, ...list.map(o => Number(o.id))) || 0) + 1)
const nextOrderNumber = (list: Order[]) => `ORD-${new Date().getFullYear()}-${String(list.length + 1).padStart(3, "0")}`

type OrderStatus = "em_aberto" | "aprovada" | "faturada" | "cancelada"

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
}

const statusConfig = {
  em_aberto: { label: "Em Aberto", color: "bg-blue-500" },
  aprovada: { label: "Aprovada", color: "bg-green-500" },
  faturada: { label: "Faturada", color: "bg-purple-500" },
  cancelada: { label: "Cancelada", color: "bg-red-500" },
}

const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-2024-001",
    customer: "Empresa ABC Ltda",
    date: "2024-01-15",
    totalValue: 15000,
    status: "aprovada",
    seller: "João Silva",
    products: [
      { id: "1", name: "Produto A", quantity: 10, price: 1000, subtotal: 10000 },
      { id: "2", name: "Produto B", quantity: 5, price: 1000, subtotal: 5000 },
    ],
    history: [
      { id: "1", action: "Criada", user: "João Silva", date: "2024-01-15 10:00", description: "Ordem criada" },
      {
        id: "2",
        action: "Aprovada",
        user: "Gerente",
        date: "2024-01-15 14:30",
        description: "Ordem aprovada pelo gerente",
      },
    ],
    notes: "Cliente solicitou entrega urgente",
  },
  {
    id: "2",
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
  },
]

// mapeia InvoiceUI -> Order (mantém a apresentação da página)
function mapInvoiceToOrder(inv: InvoiceUI): Order {
  // status já vem mapeado no model (em_aberto/aprovada/faturada/cancelada)
  return {
    id: inv.id,
    orderNumber: inv.code ?? `INV-${inv.id}`,
    customer: inv.customer ?? "—",
    date: inv.date ?? new Date().toISOString().split("T")[0],
    totalValue: Number(inv.total ?? 0),
    status: inv.status as OrderStatus,
    seller: inv.seller ?? "—",
    products: (inv.items || []).map((it, i) => ({
      id: String(it.productId ?? it.id ?? i + 1),
      name: it.description ?? `Item ${i + 1}`,
      quantity: Number(it.quantity ?? 1),
      price: Number(it.unitPrice ?? 0),
      subtotal: Number(it.total ?? (Number(it.quantity ?? 1) * Number(it.unitPrice ?? 0))),
    })),
    history: (inv.history || []).map((h, i) => ({
      id: String(h.id ?? i + 1),
      action: h.action ?? "",
      user: h.user ?? "",
      date: h.date ?? "",
      description: h.description ?? "",
    })),
    notes: inv.notes,
  }
}

export default function OrdensPage() {
  // Mock de usuário atual (substitua por seu hook de auth)
  const [currentUser] = useState<CurrentUser>(() => {
    const saved = globalThis?.localStorage?.getItem("currentUser")
    if (saved) return JSON.parse(saved) as CurrentUser
    const def: CurrentUser = { id: "u-1", name: "João Silva", role: "seller" }
    try { localStorage.setItem("currentUser", JSON.stringify(def)) } catch {}
    return def
  })

  // Carregar/persistir ordens em localStorage
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const raw = localStorage.getItem("orders")
      if (raw) return JSON.parse(raw) as Order[]
    } catch {}
    return mockOrders
  })
  const persistOrders = (list: Order[]) => {
    setOrders(list)
    try { localStorage.setItem("orders", JSON.stringify(list)) } catch {}
  }

  // Backend helpers (fallback para localhost durante desenvolvimento)
  const apiBaseRaw =
    typeof window !== "undefined"
      ? (window as any).BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      : (process.env.NEXT_PUBLIC_API_URL || "")
  // remove trailing slashes and a possible /api suffix to avoid double /api
  const apiBase = apiBaseRaw.replace(/\/+$/, "").replace(/\/api$/i, "")

  async function fetchOrdersFromBackend() {
    try {
      console.debug("[OrdensPage] fetching invoices via invoiceModel")
      const data = await invoiceModel.list(0, 200, "")
      const mapped: Order[] = data.map(mapInvoiceToOrder)
      persistOrders(mapped)
      return mapped
    } catch (err) {
      console.warn("[OrdensPage] fetchInvoicesFromBackend failed:", err)
      return null
    }
  }

  async function createOrderBackendFromOrder(order: Order) {
    try {
      console.debug("[OrdensPage] creating invoice via invoiceModel")
      
      // Buscar sellerId a partir do currentUser
      const sellerId = await getSellerIdFromUserId(currentUser.id)
      
      // Buscar aprovador (manager do grupo ou admin)
      const approverId = sellerId ? await getApproverForSeller(sellerId) : null
      
      console.log("[OrdensPage] aprovador calculado", { sellerId, approverId })
      
      const uiPartial: Partial<InvoiceUI> = {
        code: order.orderNumber,
        customer: order.customer,
        seller: order.seller,
        total: order.totalValue,
        status: order.status as any, // model converte para enum do backend
        notes: order.notes,
        approverIds: approverId ? [approverId] : undefined, // envia aprovador
        items: order.products.map((p) => ({
          productId: p.id,
          description: p.name,
          quantity: p.quantity,
          unitPrice: p.price,
          total: p.subtotal,
        })),
      }
      const res = await invoiceModel.create(uiPartial)
      return res
    } catch (e) {
      console.warn("[OrdensPage] createInvoiceBackend failed:", e)
      return null
    }
  }

  async function updateOrderBackend(id: string | number, payload: { status?: OrderStatus; approverId?: string; notes?: string }) {
    try {
      console.debug("[OrdensPage] updating invoice via invoiceModel", id, payload)
      if (payload.status === "aprovada") {
        const approverNum = Number(payload.approverId)
        return await invoiceModel.approve(id, Number.isFinite(approverNum) ? approverNum : undefined)
      }
      const uiPartial: Partial<InvoiceUI> = {
        status: payload.status as any,
        notes: payload.notes,
      }
      const res = await invoiceModel.update(id, uiPartial)
      return res
    } catch (e) {
      console.warn("[OrdensPage] updateInvoiceBackend failed:", e)
      return null
    }
  }

  // carregar do backend no mount (se disponível)
  useEffect(() => {
    fetchOrdersFromBackend().catch(() => {})
  }, [])

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false)
  const [isEditOrderOpen, setIsEditOrderOpen] = useState(false)

  // Filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sellerFilter, setSellerFilter] = useState<string>("all")

  // Clientes cadastrados
  const [customers, setCustomers] = useState<CustomerDTO[]>([])
  const [customersLoading, setCustomersLoading] = useState(false)
  useEffect(() => {
    if (!isNewOrderOpen) return
    ;(async () => {
      try {
        setCustomersLoading(true)
        const data = await listCustomers(0, 200, "")
        setCustomers(Array.isArray(data) ? data : [])
      } catch {
        setCustomers([])
      } finally {
        setCustomersLoading(false)
      }
    })()
  }, [isNewOrderOpen])

  // Nova ordem
  const [newOrder, setNewOrder] = useState({
    customerId: undefined as number | undefined,
    customer: "",
    seller: currentUser.name, // vendedor logado
    notes: "",
    products: [] as OrderProduct[],
  })

  const [newProduct, setNewProduct] = useState({
    name: "",
    quantity: 1,
    price: 0,
  })

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    const matchesSeller = sellerFilter === "all" || order.seller === sellerFilter
    return matchesSearch && matchesStatus && matchesSeller
  })

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailOpen(true)
  }

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsEditOrderOpen(true)
  }

  const handleDuplicateOrder = (order: Order) => {
    const newOrderNumber = nextOrderNumber(orders)
    const duplicatedOrder: Order = {
      ...order,
      id: nextOrderId(orders),
      orderNumber: newOrderNumber,
      date: new Date().toISOString().split("T")[0],
      status: "em_aberto",
      history: [
        {
          id: "1",
          action: "Criada",
          user: order.seller,
          date: new Date().toLocaleString(),
          description: `Ordem duplicada de ${order.orderNumber}`,
        },
      ],
    }
    persistOrders([...orders, duplicatedOrder])
  }

  const handleCancelOrder = (orderId: string) => {
    persistOrders(
      orders.map((order) =>
        order.id === orderId && canCancel(currentUser, order)
          ? {
              ...order,
              status: "cancelada" as OrderStatus,
              history: [
                ...order.history,
                {
                  id: String(order.history.length + 1),
                  action: "Cancelada",
                  user: currentUser.name,
                  date: new Date().toLocaleString(),
                  description: "Ordem cancelada",
                },
              ],
            }
          : order,
      ),
    )
  }

  const handleChangeStatus = (orderId: string, newStatus: OrderStatus) => {
    // update backend first, fallback to local update if backend fails
    (async () => {
      const order = orders.find((o) => o.id === orderId)
      if (!order) return
      const can = (() => {
        if (newStatus === "aprovada") return canApprove(currentUser)
        if (newStatus === "faturada") return canInvoice(order)
        if (newStatus === "cancelada") return canCancel(currentUser, order)
        return true
      })()
      if (!can) return

      const payload = {
        status: newStatus,
        approverId: newStatus === "aprovada" ? currentUser.id : undefined,
        approvedAt: newStatus === "aprovada" ? new Date().toISOString() : undefined,
      }
      const res = await updateOrderBackend(orderId, payload)
      if (res) {
        // map backend result if needed; here update local list using newStatus
        persistOrders(
          orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: newStatus,
                  history: [
                    ...o.history,
                    {
                      id: String(o.history.length + 1),
                      action: `Status alterado para ${statusConfig[newStatus].label}`,
                      user: currentUser.name,
                      date: new Date().toLocaleString(),
                      description: `Status alterado de ${statusConfig[o.status].label} para ${statusConfig[newStatus].label}`,
                    },
                  ],
                }
              : o,
          ),
        )
      } else {
        // fallback local
        persistOrders(
          orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: newStatus,
                  history: [
                    ...o.history,
                    {
                      id: String(o.history.length + 1),
                      action: `Status alterado para ${statusConfig[newStatus].label}`,
                      user: currentUser.name,
                      date: new Date().toLocaleString(),
                      description: `Status alterado de ${statusConfig[o.status].label} para ${statusConfig[newStatus].label}`,
                    },
                  ],
                }
              : o,
          ),
        )
      }
    })().catch(console.error)
   if (selectedOrder?.id === orderId) {
     const updatedOrder = orders.find((o) => o.id === orderId)
     if (updatedOrder) {
       setSelectedOrder({ ...updatedOrder, status: newStatus })
     }
   }
 }

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.quantity > 0 && newProduct.price > 0) {
      const product: OrderProduct = {
        id: String(newOrder.products.length + 1),
        name: newProduct.name,
        quantity: newProduct.quantity,
        price: newProduct.price,
        subtotal: newProduct.quantity * newProduct.price,
      }
      setNewOrder({
        ...newOrder,
        products: [...newOrder.products, product],
      })
      setNewProduct({ name: "", quantity: 1, price: 0 })
    }
  }

  const handleRemoveProduct = (productId: string) => {
    setNewOrder({
      ...newOrder,
      products: newOrder.products.filter((p) => p.id !== productId),
    })
  }

  // Atualizar campos de produto (inline na tabela)
  function updateProductField(productId: string, field: "quantity" | "price", value: number) {
    setNewOrder((prev) => {
      const products = prev.products.map((p) => {
        if (p.id !== productId) return p
        const quantity = field === "quantity" ? Math.max(1, Math.floor(value) || 1) : p.quantity
        const price = field === "price" ? Math.max(0, Number(value) || 0) : p.price
        return { ...p, quantity, price, subtotal: quantity * price }
      })
      return { ...prev, products }
    })
  }

  const handleCreateOrder = () => {
    if (newOrder.customer && newOrder.products.length > 0) {
      const totalValue = newOrder.products.reduce((sum, p) => sum + p.subtotal, 0)
      const orderNumber = nextOrderNumber(orders)

      // Admin aprova automaticamente
      const autoApprove = currentUser.role === "admin"
      const baseHistory: OrderHistory[] = [
        {
          id: "1",
          action: "Criada",
          user: newOrder.seller,
          date: new Date().toLocaleString(),
          description: autoApprove ? "Criada e aprovada automaticamente (admin)" : "Ordem criada e enviada para aprovação",
        },
      ]
      const history = autoApprove
        ? [
            ...baseHistory,
            {
              id: "2",
              action: "Aprovada",
              user: currentUser.name,
              date: new Date().toLocaleString(),
              description: "Aprovação automática por ser administrador",
            },
          ]
        : baseHistory

      const order: Order = {
        id: nextOrderId(orders),
        orderNumber,
        customer: newOrder.customer,
        date: new Date().toISOString().split("T")[0],
        totalValue,
        status: autoApprove ? "aprovada" : "em_aberto",
        seller: newOrder.seller,
        products: newOrder.products,
        history,
        notes: newOrder.notes,
      }

      // try create on backend, fallback to local
      ;(async () => {
        const payload = {
          code: order.orderNumber,
          sellerName: order.seller,
          customer: order.customer,
          total: order.totalValue,
          status: order.status,
          items: order.products.map((p) => ({
            productId: p.id,
            description: p.name,
            quantity: p.quantity,
            unitPrice: p.price,
            total: p.subtotal,
          })),
          notes: order.notes,
        }
        const res = await createOrderBackendFromOrder(order)
        if (res) {
          // prefer backend id/code if returned
          const created: Order = {
            ...order,
            id: String((res as any)?.id ?? (res as any)?.code ?? order.id),
            orderNumber: (res as any)?.code ?? order.orderNumber,
          }
          persistOrders([...orders, created])
        } else {
          persistOrders([...orders, order])
        }
      })().catch((e) => {
        console.error(e)
        persistOrders([...orders, order])
      })

      setIsNewOrderOpen(false)
      setNewOrder({ customerId: undefined, customer: "", seller: currentUser.name, notes: "", products: [] })
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ordens de Venda</h1>
          <p className="text-muted-foreground">
            Gerencie suas ordens de venda • Usuário: {currentUser.name} ({currentUser.role})
          </p>
        </div>
        <Button onClick={() => setIsNewOrderOpen(true)} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Nova Ordem
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="em_aberto">Em Aberto</SelectItem>
                <SelectItem value="aprovada">Aprovada</SelectItem>
                <SelectItem value="faturada">Faturada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sellerFilter} onValueChange={setSellerFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Vendedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Vendedores</SelectItem>
                <SelectItem value="João Silva">João Silva</SelectItem>
                <SelectItem value="Maria Santos">Maria Santos</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setStatusFilter("all")
                setSellerFilter("all")
              }}
            >
              <Filter className="mr-2 h-4 w-4" />
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Ordens */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº da Ordem</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{new Date(order.date).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(order.totalValue)}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusConfig[order.status].color}>{statusConfig[order.status].label}</Badge>
                  </TableCell>
                  <TableCell>{order.seller}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleViewOrder(order)} title="Visualizar">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditOrder(order)}
                        title="Editar"
                        disabled={order.status === "cancelada"}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDuplicateOrder(order)} title="Duplicar">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCancelOrder(order.id)}
                        title="Cancelar"
                        disabled={order.status === "cancelada" || !canCancel(currentUser, order)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Sheet de Detalhes */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedOrder && (
            <>
              <SheetHeader>
                <SheetTitle>Detalhes da Ordem {selectedOrder.orderNumber}</SheetTitle>
                <SheetDescription>Visualize e gerencie os detalhes desta ordem de venda</SheetDescription>
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
                        <Label className="text-muted-foreground">Valor Total</Label>
                        <p className="font-medium text-lg">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(selectedOrder.totalValue)}
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Status</Label>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge className={statusConfig[selectedOrder.status].color}>
                          {statusConfig[selectedOrder.status].label}
                        </Badge>
                        <Select
                          value={selectedOrder.status}
                          onValueChange={(value) => handleChangeStatus(selectedOrder.id, value as OrderStatus)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="em_aberto">Em Aberto</SelectItem>
                            <SelectItem value="aprovada" disabled={!canApprove(currentUser)}>Aprovada</SelectItem>
                            <SelectItem value="faturada">Faturada</SelectItem>
                            <SelectItem value="cancelada">Cancelada</SelectItem>
                          </SelectContent>
                        </Select>
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
                    <CardTitle className="text-lg">Histórico de Alterações</CardTitle>
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
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Dialog Nova Ordem */}
      <Dialog open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Ordem de Venda</DialogTitle>
            <DialogDescription>Preencha os dados para criar uma nova ordem de venda</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customer">Cliente *</Label>
                {customers && customers.length > 0 ? (
                  <Select
                    value={newOrder.customerId ? String(newOrder.customerId) : ""}
                    onValueChange={(val) => {
                      const sel = customers.find((c) => String(c.id) === val)
                      setNewOrder({
                        ...newOrder,
                        customerId: sel ? sel.id : undefined,
                        customer: sel ? sel.name : "",
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={customersLoading ? "Carregando..." : "Selecione um cliente"} />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="customer"
                    placeholder={customersLoading ? "Carregando..." : "Nome do cliente"}
                    value={newOrder.customer}
                    onChange={(e) => setNewOrder({ ...newOrder, customer: e.target.value })}
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="seller">Vendedor *</Label>
                <Input id="seller" value={newOrder.seller} disabled />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Observações sobre a ordem..."
                value={newOrder.notes}
                onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Produtos</CardTitle>
                <CardDescription>Adicione os produtos desta ordem</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="productName">Nome do Produto</Label>
                    <Input
                      id="productName"
                      placeholder="Nome do produto"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantidade</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={newProduct.quantity}
                      onChange={(e) => setNewProduct({ ...newProduct, quantity: Number.parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço Unit.</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: Number.parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <Button onClick={handleAddProduct} className="w-full bg-transparent" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Produto
                </Button>

                {newOrder.products.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead className="text-right">Qtd</TableHead>
                        <TableHead className="text-right">Preço Unit.</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {newOrder.products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell className="text-right">
                            <Input
                              className="text-right"
                              type="number"
                              min={1}
                              value={product.quantity}
                              onChange={(e) => updateProductField(product.id, "quantity", Number(e.target.value))}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              className="text-right"
                              type="number"
                              min={0}
                              step="0.01"
                              value={product.price}
                              onChange={(e) => updateProductField(product.id, "price", Number(e.target.value))}
                            />
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(product.subtotal)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveProduct(product.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-bold">
                          Total:
                        </TableCell>
                        <TableCell className="text-right font-bold text-lg">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(newOrder.products.reduce((sum, p) => sum + p.subtotal, 0))}
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewOrderOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateOrder} disabled={!newOrder.customer || newOrder.products.length === 0}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Criar Ordem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar Ordem */}
      <Dialog
        open={isEditOrderOpen}
        onOpenChange={(open) => {
          setIsEditOrderOpen(open)
          if (!open) setSelectedOrder(null)
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Ordem de Venda</DialogTitle>
            <DialogDescription>Altere os dados da ordem de venda</DialogDescription>
          </DialogHeader>

          {selectedOrder ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="customer">Cliente *</Label>
                  {customers && customers.length > 0 ? (
                    <Select
                      value={(() => {
                        const sel = customers.find((c) => c.name === selectedOrder.customer)
                        return sel ? String(sel.id) : ""
                      })()}
                      onValueChange={(val) => {
                        const sel = customers.find((c) => String(c.id) === val)
                        if (sel) setSelectedOrder({ ...selectedOrder, customer: sel.name })
                        else setSelectedOrder({ ...selectedOrder, customer: "" })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={customersLoading ? "Carregando..." : "Selecione um cliente"} />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="customer"
                      placeholder={customersLoading ? "Carregando..." : "Nome do cliente"}
                      value={selectedOrder.customer ?? ""}
                      onChange={(e) => setSelectedOrder({ ...selectedOrder, customer: e.target.value })}
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seller">Vendedor *</Label>
                  <Input id="seller" value={selectedOrder.seller ?? ""} disabled />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={selectedOrder.notes ?? ""}
                  onChange={(e) => setSelectedOrder({ ...selectedOrder, notes: e.target.value })}
                  placeholder="Observações sobre a ordem..."
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Produtos</CardTitle>
                  <CardDescription>Revise os produtos desta ordem</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead className="text-right">Qtd</TableHead>
                        <TableHead className="text-right">Preço Unit.</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell className="text-right">
                            <Input
                              className="text-right"
                              type="number"
                              min={1}
                              value={product.quantity}
                              onChange={(e) => updateProductField(product.id, "quantity", Number(e.target.value))}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              className="text-right"
                              type="number"
                              min={0}
                              step="0.01"
                              value={product.price}
                              onChange={(e) => updateProductField(product.id, "price", Number(e.target.value))}
                            />
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(product.subtotal)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveProduct(product.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-bold">
                          Total:
                        </TableCell>
                        <TableCell className="text-right font-bold text-lg">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(selectedOrder.products.reduce((sum, p) => sum + p.subtotal, 0))}
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOrderOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateOrder} size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
