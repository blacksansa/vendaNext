"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, MoreHorizontal, Phone, Mail, Edit, Trash2, Filter, Download } from "lucide-react"
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from "@/lib/api.client"
import { Customer, CustomerListItem } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

const initialNewCustomerState = {
  name: "",
  companyName: "",
  observation: "",
}

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [customers, setCustomers] = useState<CustomerListItem[]>([])
  const [newCustomer, setNewCustomer] = useState(initialNewCustomerState)
  const [editingCustomer, setEditingCustomer] = useState<Partial<Customer> | null>(null)
  const [deletingCustomerId, setDeletingCustomerId] = useState<number | null>(null)
  const { toast } = useToast()

  const fetchCustomers = async () => {
    try {
      const data = await getCustomers(searchTerm)
      setCustomers(data)
    } catch (error) {
      console.error("Failed to fetch customers:", error)
      toast({ title: "Erro ao buscar clientes", variant: "destructive" })
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, []) // Initial fetch

  const handleSearch = () => {
    fetchCustomers()
  }

  const handleSaveCustomer = async () => {
    try {
      await createCustomer({
        ...newCustomer,
        code: Date.now().toString(), // Required field
      })
      setIsAddDialogOpen(false)
      setNewCustomer(initialNewCustomerState)
      toast({ title: "Sucesso!", description: "Cliente adicionado com sucesso." })
      fetchCustomers() // Refresh list
    } catch (error) {
      console.error("Failed to create customer:", error)
      toast({ title: "Erro ao criar cliente", variant: "destructive" })
    }
  }

  const handleUpdateCustomer = async () => {
    if (!editingCustomer || !editingCustomer.id) return
    try {
      await updateCustomer(editingCustomer.id, editingCustomer)
      setIsEditDialogOpen(false)
      setEditingCustomer(null)
      toast({ title: "Sucesso!", description: "Cliente atualizado com sucesso." })
      fetchCustomers() // Refresh list
    } catch (error) {
      console.error("Failed to update customer:", error)
      toast({ title: "Erro ao atualizar cliente", variant: "destructive" })
    }
  }

  const handleDeleteCustomer = async () => {
    if (!deletingCustomerId) return
    try {
      await deleteCustomer(deletingCustomerId)
      setIsDeleteDialogOpen(false)
      setDeletingCustomerId(null)
      toast({ title: "Sucesso!", description: "Cliente excluído com sucesso." })
      fetchCustomers() // Refresh list
    } catch (error) {
      console.error("Failed to delete customer:", error)
      toast({ title: "Erro ao excluir cliente", variant: "destructive" })
    }
  }

  const openEditDialog = (customer: CustomerListItem) => {
    setEditingCustomer(customer)
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (id: number) => {
    setDeletingCustomerId(id)
    setIsDeleteDialogOpen(true)
  }

  const filteredCustomers = customers.filter((customer) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      customer.name?.toLowerCase().includes(searchLower) ||
      customer.companyName?.toLowerCase().includes(searchLower)

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && customer.active) ||
      (statusFilter === "inactive" && !customer.active)

    return matchesSearch && matchesStatus
  })

  const getStatusVariant = (active: boolean) => {
    return active ? "default" : "secondary"
  }

  const getInitials = (name: string = "") => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <SidebarInset>
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex items-center justify-between w-full">
          <h1 className="text-lg font-semibold">Gerenciamento de Clientes</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Cliente</DialogTitle>
                  <DialogDescription>Crie um novo perfil de cliente.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Nome
                    </Label>
                    <Input
                      id="name"
                      placeholder="João da Silva"
                      className="col-span-3"
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="companyName" className="text-right">
                      Empresa
                    </Label>
                    <Input
                      id="companyName"
                      placeholder="Empresa Exemplo"
                      className="col-span-3"
                      value={newCustomer.companyName}
                      onChange={(e) => setNewCustomer({ ...newCustomer, companyName: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="observation" className="text-right">
                      Observações
                    </Label>
                    <Textarea
                      id="observation"
                      placeholder="Notas adicionais..."
                      className="col-span-3"
                      value={newCustomer.observation}
                      onChange={(e) => setNewCustomer({ ...newCustomer, observation: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleSaveCustomer}>
                    Adicionar Cliente
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Banco de Dados de Clientes</CardTitle>
            <CardDescription>Gerencie e acompanhe todos os seus relacionamentos com clientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch}>Buscar</Button>
            </div>
          </CardContent>
        </Card>

        {/* Customer Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Último Contato</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {getInitials(customer.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">ID: {customer.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-foreground">{/* Email not available */}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{/* Phone not available */}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-foreground">{customer.companyName}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(customer.active)} className="text-xs">
                        {customer.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-foreground">{/* Value not available */}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{/* Last contact not available */}</span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openEditDialog(customer)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar Cliente
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => openDeleteDialog(customer.id!)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir Cliente
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum cliente encontrado com os critérios informados.</p>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>Atualize as informações do cliente.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Nome
              </Label>
              <Input
                id="edit-name"
                value={editingCustomer?.name || ""}
                onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-companyName" className="text-right">
                Empresa
              </Label>
              <Input
                id="edit-companyName"
                value={editingCustomer?.companyName || ""}
                onChange={(e) => setEditingCustomer({ ...editingCustomer, companyName: e.target.value })}
                className="col-span-3"
              />
            </div>
            {/* Observation field can be added here if needed */}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" onClick={handleUpdateCustomer}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente o cliente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCustomer}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarInset>
  )
}
