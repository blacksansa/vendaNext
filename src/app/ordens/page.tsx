"use client"

import { useState } from "react"
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

export default function OrdensPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false)
  const [isEditOrderOpen, setIsEditOrderOpen] = useState(false)

  // Filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sellerFilter, setSellerFilter] = useState<string>("all")

  // Nova ordem
  const [newOrder, setNewOrder] = useState({
    customer: "",
    seller: "João Silva",
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
    const newOrderNumber = `ORD-2024-${String(orders.length + 1).padStart(3, "0")}`
    const duplicatedOrder: Order = {
      ...order,
      id: String(orders.length + 1),
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
    setOrders([...orders, duplicatedOrder])
  }

  const handleCancelOrder = (orderId: string) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: "cancelada" as OrderStatus,
              history: [
                ...order.history,
                {
                  id: String(order.history.length + 1),
                  action: "Cancelada",
                  user: "Sistema",
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
    setOrders(
      orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: newStatus,
              history: [
                ...order.history,
                {
                  id: String(order.history.length + 1),
                  action: `Status alterado para ${statusConfig[newStatus].label}`,
                  user: "Sistema",
                  date: new Date().toLocaleString(),
                  description: `Status alterado de ${statusConfig[order.status].label} para ${statusConfig[newStatus].label}`,
                },
              ],
            }
          : order,
      ),
    )
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

  const handleCreateOrder = () => {
    if (newOrder.customer && newOrder.products.length > 0) {
      const totalValue = newOrder.products.reduce((sum, p) => sum + p.subtotal, 0)
      const orderNumber = `ORD-2024-${String(orders.length + 1).padStart(3, "0")}`

      const order: Order = {
        id: String(orders.length + 1),
        orderNumber,
        customer: newOrder.customer,
        date: new Date().toISOString().split("T")[0],
        totalValue,
        status: "em_aberto",
        seller: newOrder.seller,
        products: newOrder.products,
        history: [
          {
            id: "1",
            action: "Criada",
            user: newOrder.seller,
            date: new Date().toLocaleString(),
            description: "Ordem criada",
          },
        ],
        notes: newOrder.notes,
      }

      setOrders([...orders, order])
      setIsNewOrderOpen(false)
      setNewOrder({ customer: "", seller: "João Silva", notes: "", products: [] })
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ordens de Venda</h1>
          <p className="text-muted-foreground">Gerencie suas ordens de venda</p>
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
                        disabled={order.status === "cancelada"}
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
                            <SelectItem value="aprovada">Aprovada</SelectItem>
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
                <Input
                  id="customer"
                  placeholder="Nome do cliente"
                  value={newOrder.customer}
                  onChange={(e) => setNewOrder({ ...newOrder, customer: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seller">Vendedor *</Label>
                <Select value={newOrder.seller} onValueChange={(value) => setNewOrder({ ...newOrder, seller: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="João Silva">João Silva</SelectItem>
                    <SelectItem value="Maria Santos">Maria Santos</SelectItem>
                  </SelectContent>
                </Select>
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
                        <TableHead className="text-right">Preço</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {newOrder.products.map((product) => (
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
    </div>
  )
}
