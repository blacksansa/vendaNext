"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, MoreHorizontal, Edit, Trash2, Package, Users, Building2, Tag, UserCog } from "lucide-react"
import { createCustomer, getCustomers, getCustomerById, updateCustomer, deleteCustomer } from "@/lib/api.client"
import { getProducts, createProduct, updateProduct, deleteProduct, Product } from "@/services/product.service"
import { getProductGroups, ProductGroup } from "@/services/product-group.service"
import { getPriceTags, createPriceTag, updatePriceTag, deletePriceTag, PriceTag } from "@/services/price-tag.service"
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier, Supplier } from "@/services/supplier.service"
import { getSellers, createSeller, updateSeller, deleteSeller, SellerDTO } from "@/services/seller.service"
import { useToast } from "@/hooks/use-toast"
import { Customer, CustomerListItem } from "@/lib/types"
import { CustomerForm } from "@/components/cadastros/customer-form"
import { ProductForm } from "@/components/cadastros/product-form"
import { SupplierForm } from "@/components/cadastros/supplier-form"
import { PriceTagForm } from "@/components/cadastros/price-tag-form"
import { SellerForm } from "@/components/forms/SellerForm"

const initialCustomerState = {
  name: "",
  type: "pf",
  email: "",
  phone: "",
  companyName: "",
  observation: "",
}

const initialProductState = {
  code: "",
  name: "",
  ncm: "",
  supplier: "",
  packaging: "",
  price: 0,
  stockQuantity: 0,
  minStock: 0,
  active: true,
}

const initialPriceTagState: Partial<PriceTag> = {
  code: "",
  name: "",
  description: "",
  validFrom: undefined,
  validTo: undefined,
  items: [],
}

const initialSupplierState: Partial<Supplier> = {
  code: "",
  name: "",
  companyName: "",
  cnpj: "",
  document: "",
  observation: "",
  active: true,
  addresses: [],
  contacts: [],
}

export default function CadastrosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [productSearchTerm, setProductSearchTerm] = useState("")
  const [priceTagSearchTerm, setPriceTagSearchTerm] = useState("")
  const [supplierSearchTerm, setSupplierSearchTerm] = useState("")
  const [sellerSearchTerm, setSellerSearchTerm] = useState("")
  
  // View states - controla se mostra lista ou formulário
  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const [showProductForm, setShowProductForm] = useState(false)
  const [showPriceTagForm, setShowPriceTagForm] = useState(false)
  const [showSupplierForm, setShowSupplierForm] = useState(false)
  const [showSellerForm, setShowSellerForm] = useState(false)
  
  // Dialog states
  const [isClienteDialogOpen, setIsClienteDialogOpen] = useState(false)
  const [isProdutoDialogOpen, setIsProdutoDialogOpen] = useState(false)
  const [isPriceTagDialogOpen, setIsPriceTagDialogOpen] = useState(false)
  const [isFornecedorDialogOpen, setIsFornecedorDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditProductDialogOpen, setIsEditProductDialogOpen] = useState(false)
  const [isDeleteProductDialogOpen, setIsDeleteProductDialogOpen] = useState(false)
  const [isEditPriceTagDialogOpen, setIsEditPriceTagDialogOpen] = useState(false)
  const [isDeletePriceTagDialogOpen, setIsDeletePriceTagDialogOpen] = useState(false)
  const [isEditSupplierDialogOpen, setIsEditSupplierDialogOpen] = useState(false)
  const [isDeleteSupplierDialogOpen, setIsDeleteSupplierDialogOpen] = useState(false)
  const [isDeleteSellerDialogOpen, setIsDeleteSellerDialogOpen] = useState(false)
  
  // Form states
  const [newCustomer, setNewCustomer] = useState(initialCustomerState)
  const [newProduct, setNewProduct] = useState(initialProductState)
  const [newPriceTag, setNewPriceTag] = useState<Partial<PriceTag>>(initialPriceTagState)
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>(initialSupplierState)
  const [newSeller, setNewSeller] = useState<Partial<SellerDTO>>({ code: "", name: "", commissionPercentage: 0 })
  
  // Edit states
  const [editingCustomer, setEditingCustomer] = useState<Partial<Customer> | null>(null)
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null)
  const [editingPriceTag, setEditingPriceTag] = useState<Partial<PriceTag> | null>(null)
  const [editingSupplier, setEditingSupplier] = useState<Partial<Supplier> | null>(null)
  const [editingSeller, setEditingSeller] = useState<Partial<SellerDTO> | null>(null)
  
  // Delete states
  const [deletingCustomerId, setDeletingCustomerId] = useState<number | null>(null)
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null)
  const [deletingPriceTagId, setDeletingPriceTagId] = useState<number | null>(null)
  const [deletingSupplierId, setDeletingSupplierId] = useState<number | null>(null)
  const [deletingSellerId, setDeletingSellerId] = useState<number | null>(null)
  
  // Data states
  const [customers, setCustomers] = useState<CustomerListItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [sellers, setSellers] = useState<SellerDTO[]>([])
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([])
  const [priceTags, setPriceTags] = useState<PriceTag[]>([])
  
  const { toast } = useToast()

  const fetchCustomers = async () => {
    try {
      const customerData = await getCustomers(searchTerm)
      setCustomers(customerData)
    } catch (error) {
      console.error("Failed to fetch customers:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os clientes.",
        variant: "destructive",
      })
    }
  }

  const fetchProducts = async () => {
    try {
      const productData = await getProducts(productSearchTerm)
      setProducts(productData)
    } catch (error) {
      console.error("Failed to fetch products:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os produtos.",
        variant: "destructive",
      })
    }
  }

  const fetchProductGroups = async () => {
    try {
      const groupData = await getProductGroups()
      setProductGroups(groupData)
    } catch (error) {
      console.error("Failed to fetch product groups:", error)
    }
  }

  const fetchPriceTags = async () => {
    try {
      const priceTagData = await getPriceTags(priceTagSearchTerm)
      setPriceTags(priceTagData)
    } catch (error) {
      console.error("Failed to fetch price tags:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as tabelas de preço.",
        variant: "destructive",
      })
    }
  }

  const fetchSuppliers = async () => {
    try {
      const supplierData = await getSuppliers(supplierSearchTerm)
      setSuppliers(supplierData)
    } catch (error) {
      console.error("Failed to fetch suppliers:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os fornecedores.",
        variant: "destructive",
      })
    }
  }

  const fetchSellers = async () => {
    try {
      const sellerData = await getSellers(sellerSearchTerm)
      setSellers(sellerData)
    } catch (error) {
      console.error("Failed to fetch sellers:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os vendedores.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchCustomers()
    fetchProducts()
    fetchProductGroups()
    fetchPriceTags()
    fetchSuppliers()
    fetchSellers()
  }, [])

  const handleCustomerInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setNewCustomer((prev) => ({ ...prev, [id]: value }))
  }

  const handleCustomerSelectChange = (value: string) => {
    setNewCustomer((prev) => ({ ...prev, type: value }))
  }

  const handleSaveCustomer = async (customerData: Partial<Customer>) => {
    try {
      await createCustomer(customerData)
      toast({
        title: "Sucesso!",
        description: "Cliente cadastrado com sucesso.",
      })
      setShowCustomerForm(false)
      setEditingCustomer(null)
      setNewCustomer(initialCustomerState)
      fetchCustomers()
    } catch (error) {
      console.error("Failed to create customer:", error)
      toast({
        title: "Erro",
        description: "Não foi possível cadastrar o cliente. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateCustomer = async (customerData: Partial<Customer>) => {
    if (!editingCustomer || !editingCustomer.id) return
    try {
      await updateCustomer(editingCustomer.id, customerData)
      setShowCustomerForm(false)
      setEditingCustomer(null)
      toast({ title: "Sucesso!", description: "Cliente atualizado com sucesso." })
      fetchCustomers()
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
      fetchCustomers()
    } catch (error) {
      console.error("Failed to delete customer:", error)
      toast({ title: "Erro ao excluir cliente", variant: "destructive" })
    }
  }

  const openEditDialog = async (customer: CustomerListItem) => {
    try {
      const fullCustomer = await getCustomerById(customer.id!)
      setEditingCustomer(fullCustomer)
      setShowCustomerForm(true)
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível carregar os dados do cliente." })
    }
  }

  const openDeleteDialog = (id: number) => {
    setDeletingCustomerId(id)
    setIsDeleteDialogOpen(true)
  }

  // Product Handlers
  const handleProductInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setNewProduct((prev) => ({ ...prev, [id]: value }))
  }

  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      await createProduct(productData)
      toast({ title: "Sucesso!", description: "Produto cadastrado com sucesso." })
      setShowProductForm(false)
      setEditingProduct(null)
      setNewProduct(initialProductState)
      fetchProducts()
    } catch (error) {
      console.error("Failed to create product:", error)
      toast({ title: "Erro", description: "Não foi possível cadastrar o produto.", variant: "destructive" })
    }
  }

  const handleUpdateProduct = async (productData: Partial<Product>) => {
    if (!editingProduct || !editingProduct.id) return
    try {
      await updateProduct(editingProduct.id, productData)
      setShowProductForm(false)
      setEditingProduct(null)
      toast({ title: "Sucesso!", description: "Produto atualizado com sucesso." })
      fetchProducts()
    } catch (error) {
      console.error("Failed to update product:", error)
      toast({ title: "Erro ao atualizar produto", variant: "destructive" })
    }
  }

  const handleDeleteProduct = async () => {
    if (!deletingProductId) return
    try {
      await deleteProduct(deletingProductId)
      setIsDeleteProductDialogOpen(false)
      setDeletingProductId(null)
      toast({ title: "Sucesso!", description: "Produto excluído com sucesso." })
      fetchProducts()
    } catch (error) {
      console.error("Failed to delete product:", error)
      toast({ title: "Erro ao excluir produto", variant: "destructive" })
    }
  }

  const openEditProductDialog = (product: Product) => {
    setEditingProduct(product)
    setShowProductForm(true)
  }

  const openDeleteProductDialog = (id: number) => {
    setDeletingProductId(id)
    setIsDeleteProductDialogOpen(true)
  }

  // PriceTag Handlers
  const handlePriceTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setNewPriceTag((prev) => ({ ...prev, [id]: value }))
  }

  const handleSavePriceTag = async (priceTagData: Partial<PriceTag>) => {
    try {
      await createPriceTag(priceTagData)
      toast({ title: "Sucesso!", description: "Tabela de preço cadastrada com sucesso." })
      setShowPriceTagForm(false)
      setEditingPriceTag(null)
      setNewPriceTag(initialPriceTagState)
      fetchPriceTags()
    } catch (error) {
      console.error("Failed to create price tag:", error)
      toast({ title: "Erro", description: "Não foi possível cadastrar a tabela de preço.", variant: "destructive" })
    }
  }

  const handleUpdatePriceTag = async (priceTagData: Partial<PriceTag>) => {
    if (!editingPriceTag || !editingPriceTag.id) return
    try {
      await updatePriceTag(editingPriceTag.id, priceTagData)
      setShowPriceTagForm(false)
      setEditingPriceTag(null)
      toast({ title: "Sucesso!", description: "Tabela de preço atualizada com sucesso." })
      fetchPriceTags()
    } catch (error) {
      console.error("Failed to update price tag:", error)
      toast({ title: "Erro ao atualizar tabela de preço", variant: "destructive" })
    }
  }

  const handleDeletePriceTag = async () => {
    if (!deletingPriceTagId) return
    try {
      await deletePriceTag(deletingPriceTagId)
      setIsDeletePriceTagDialogOpen(false)
      setDeletingPriceTagId(null)
      toast({ title: "Sucesso!", description: "Tabela de preço excluída com sucesso." })
      fetchPriceTags()
    } catch (error) {
      console.error("Failed to delete price tag:", error)
      toast({ title: "Erro ao excluir tabela de preço", variant: "destructive" })
    }
  }

  const openEditPriceTagDialog = (priceTag: PriceTag) => {
    setEditingPriceTag(priceTag)
    setShowPriceTagForm(true)
  }

  const openDeletePriceTagDialog = (id: number) => {
    setDeletingPriceTagId(id)
    setIsDeletePriceTagDialogOpen(true)
  }

  // Supplier Handlers
  const handleSaveSupplier = async (supplierData: Partial<Supplier>) => {
    try {
      await createSupplier(supplierData)
      toast({ title: "Sucesso!", description: "Fornecedor cadastrado com sucesso." })
      setShowSupplierForm(false)
      setEditingSupplier(null)
      setNewSupplier(initialSupplierState)
      fetchSuppliers()
    } catch (error) {
      console.error("Failed to create supplier:", error)
      toast({ title: "Erro", description: "Não foi possível cadastrar o fornecedor.", variant: "destructive" })
    }
  }

  const handleUpdateSupplier = async (supplierData: Partial<Supplier>) => {
    if (!editingSupplier || !editingSupplier.id) return
    try {
      await updateSupplier(editingSupplier.id, supplierData)
      setShowSupplierForm(false)
      setEditingSupplier(null)
      toast({ title: "Sucesso!", description: "Fornecedor atualizado com sucesso." })
      fetchSuppliers()
    } catch (error) {
      console.error("Failed to update supplier:", error)
      toast({ title: "Erro ao atualizar fornecedor", variant: "destructive" })
    }
  }

  const handleDeleteSupplier = async () => {
    if (!deletingSupplierId) return
    try {
      await deleteSupplier(deletingSupplierId)
      setIsDeleteSupplierDialogOpen(false)
      setDeletingSupplierId(null)
      toast({ title: "Sucesso!", description: "Fornecedor excluído com sucesso." })
      fetchSuppliers()
    } catch (error) {
      console.error("Failed to delete supplier:", error)
      toast({ title: "Erro ao excluir fornecedor", variant: "destructive" })
    }
  }

  const openEditSupplierDialog = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setShowSupplierForm(true)
  }

  const openDeleteSupplierDialog = (id: number) => {
    setDeletingSupplierId(id)
    setIsDeleteSupplierDialogOpen(true)
  }

  // Seller Handlers
  const handleSaveSeller = async (sellerData: Partial<SellerDTO>) => {
    try {
      await createSeller(sellerData)
      toast({ title: "Sucesso!", description: "Vendedor cadastrado com sucesso." })
      setShowSellerForm(false)
      setEditingSeller(null)
      setNewSeller({ code: "", name: "", commissionPercentage: 0 })
      fetchSellers()
    } catch (error) {
      console.error("Failed to create seller:", error)
      toast({ title: "Erro", description: "Não foi possível cadastrar o vendedor.", variant: "destructive" })
    }
  }

  const handleUpdateSeller = async (sellerData: Partial<SellerDTO>) => {
    if (!editingSeller || !editingSeller.id) return
    try {
      await updateSeller(editingSeller.id, sellerData)
      setShowSellerForm(false)
      setEditingSeller(null)
      toast({ title: "Sucesso!", description: "Vendedor atualizado com sucesso." })
      fetchSellers()
    } catch (error) {
      console.error("Failed to update seller:", error)
      toast({ title: "Erro ao atualizar vendedor", variant: "destructive" })
    }
  }

  const handleDeleteSeller = async () => {
    if (!deletingSellerId) return
    try {
      await deleteSeller(deletingSellerId)
      setIsDeleteSellerDialogOpen(false)
      setDeletingSellerId(null)
      toast({ title: "Sucesso!", description: "Vendedor excluído com sucesso." })
      fetchSellers()
    } catch (error) {
      console.error("Failed to delete seller:", error)
      toast({ title: "Erro ao excluir vendedor", variant: "destructive" })
    }
  }

  const openEditSellerDialog = (seller: SellerDTO) => {
    setEditingSeller(seller)
    setShowSellerForm(true)
  }

  const openDeleteSellerDialog = (id: number) => {
    setDeletingSellerId(id)
    setIsDeleteSellerDialogOpen(true)
  }

  return (
    <SidebarInset>
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Cadastros</h1>
      </header>

      <div className="p-6">
        <Tabs defaultValue="clientes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-[750px]">
            <TabsTrigger value="clientes">
              <Users className="h-4 w-4 mr-2" />
              Clientes
            </TabsTrigger>
            <TabsTrigger value="produtos">
              <Package className="h-4 w-4 mr-2" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="fornecedores">
              <Building2 className="h-4 w-4 mr-2" />
              Fornecedores
            </TabsTrigger>
            <TabsTrigger value="vendedores">
              <UserCog className="h-4 w-4 mr-2" />
              Vendedores
            </TabsTrigger>
            <TabsTrigger value="pricetags">
              <Tag className="h-4 w-4 mr-2" />
              Tabelas de Preço
            </TabsTrigger>
          </TabsList>

          {/* Aba Clientes */}
          <TabsContent value="clientes" className="space-y-4">
            {!showCustomerForm ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Clientes</CardTitle>
                      <CardDescription>Gerencie o cadastro de clientes</CardDescription>
                    </div>
                    <Button onClick={() => {
                      setEditingCustomer(null)
                      setNewCustomer(initialCustomerState)
                      setShowCustomerForm(true)
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Cliente
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Buscar clientes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Empresa</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium">{customer.name}</TableCell>
                          <TableCell>{/* Email not available */}</TableCell>
                          <TableCell>{/* Telefone not available */}</TableCell>
                          <TableCell>{customer.companyName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{/* Tipo not available */}</Badge>
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
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => openDeleteDialog(customer.id!)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
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
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>{editingCustomer ? "Editar" : "Novo"} Cliente</CardTitle>
                  <CardDescription>
                    {editingCustomer ? "Atualize os dados do cliente" : "Cadastre um novo cliente com todos os dados"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CustomerForm
                    customer={editingCustomer || newCustomer}
                    onSave={editingCustomer ? handleUpdateCustomer : handleSaveCustomer}
                    onCancel={() => {
                      setShowCustomerForm(false)
                      setEditingCustomer(null)
                    }}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Aba Produtos */}
          <TabsContent value="produtos" className="space-y-4">
            {!showProductForm ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Produtos</CardTitle>
                      <CardDescription>Gerencie o catálogo de produtos</CardDescription>
                    </div>
                    <Button onClick={() => {
                      setEditingProduct(null)
                      setNewProduct(initialProductState)
                      setShowProductForm(true)
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Produto
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input 
                        placeholder="Buscar produtos..." 
                        className="pl-10"
                        value={productSearchTerm}
                        onChange={(e) => setProductSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead>Fornecedor</TableHead>
                        <TableHead>Preço</TableHead>
                        <TableHead>Estoque</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((produto) => (
                        <TableRow key={produto.id}>
                          <TableCell className="font-medium">{produto.name}</TableCell>
                          <TableCell>{produto.code}</TableCell>
                          <TableCell>{produto.supplier || "-"}</TableCell>
                          <TableCell>R$ {produto.price?.toFixed(2) || "0,00"}</TableCell>
                          <TableCell>
                            <Badge variant={(produto.stockQuantity || 0) > (produto.minStock || 20) ? "default" : "destructive"}>
                              {produto.stockQuantity || 0} un
                            </Badge>
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
                                <DropdownMenuItem onClick={() => openEditProductDialog(produto)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => openDeleteProductDialog(produto.id!)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
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
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>{editingProduct ? "Editar" : "Novo"} Produto</CardTitle>
                  <CardDescription>
                    {editingProduct ? "Atualize os dados do produto" : "Cadastre um novo produto no catálogo"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProductForm
                    product={editingProduct || newProduct}
                    onSave={editingProduct ? handleUpdateProduct : handleSaveProduct}
                    onCancel={() => {
                      setShowProductForm(false)
                      setEditingProduct(null)
                    }}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Aba Fornecedores */}
          <TabsContent value="fornecedores" className="space-y-4">
            {!showSupplierForm ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Fornecedores</CardTitle>
                      <CardDescription>Gerencie o cadastro de fornecedores</CardDescription>
                    </div>
                    <Button onClick={() => {
                      setEditingSupplier(null)
                      setNewSupplier(initialSupplierState)
                      setShowSupplierForm(true)
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Fornecedor
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Buscar fornecedores..."
                        value={supplierSearchTerm}
                        onChange={(e) => setSupplierSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Razão Social</TableHead>
                        <TableHead>CNPJ</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {suppliers.map((supplier) => (
                        <TableRow key={supplier.id}>
                          <TableCell className="font-medium">{supplier.name}</TableCell>
                          <TableCell>{supplier.companyName || "-"}</TableCell>
                          <TableCell>{supplier.cnpj || "-"}</TableCell>
                          <TableCell>
                            <Badge variant={supplier.active ? "default" : "secondary"}>
                              {supplier.active ? "Ativo" : "Inativo"}
                            </Badge>
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
                                <DropdownMenuItem onClick={() => openEditSupplierDialog(supplier)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => openDeleteSupplierDialog(supplier.id!)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
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
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>{editingSupplier ? "Editar" : "Novo"} Fornecedor</CardTitle>
                  <CardDescription>
                    {editingSupplier ? "Atualize os dados do fornecedor" : "Cadastre um novo fornecedor no sistema"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SupplierForm
                    supplier={editingSupplier || newSupplier}
                    onSave={editingSupplier ? handleUpdateSupplier : handleSaveSupplier}
                    onCancel={() => {
                      setShowSupplierForm(false)
                      setEditingSupplier(null)
                    }}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Aba Tabelas de Preço */}
          <TabsContent value="pricetags" className="space-y-4">
            {!showPriceTagForm ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Tabelas de Preço</CardTitle>
                      <CardDescription>Gerencie as tabelas de preço do sistema</CardDescription>
                    </div>
                    <Button onClick={() => {
                      setEditingPriceTag(null)
                      setNewPriceTag(initialPriceTagState)
                      setShowPriceTagForm(true)
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Tabela
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input 
                        placeholder="Buscar tabelas..." 
                        className="pl-10"
                        value={priceTagSearchTerm}
                        onChange={(e) => setPriceTagSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Validade</TableHead>
                        <TableHead># Produtos</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {priceTags.map((priceTag) => (
                        <TableRow key={priceTag.id}>
                          <TableCell className="font-medium">{priceTag.code}</TableCell>
                          <TableCell>{priceTag.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {priceTag.validFrom && priceTag.validTo 
                              ? `${new Date(priceTag.validFrom).toLocaleDateString()} - ${new Date(priceTag.validTo).toLocaleDateString()}`
                              : "Sem validade"}
                          </TableCell>
                          <TableCell>{priceTag.items?.length || 0}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => openEditPriceTagDialog(priceTag)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => openDeletePriceTagDialog(priceTag.id!)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
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
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>{editingPriceTag ? "Editar" : "Nova"} Tabela de Preço</CardTitle>
                  <CardDescription>
                    {editingPriceTag ? "Atualize os dados da tabela" : "Cadastre uma nova tabela com produtos"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PriceTagForm
                    priceTag={editingPriceTag || newPriceTag}
                    onSave={editingPriceTag ? handleUpdatePriceTag : handleSavePriceTag}
                    onCancel={() => {
                      setShowPriceTagForm(false)
                      setEditingPriceTag(null)
                    }}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Aba Vendedores */}
          <TabsContent value="vendedores" className="space-y-4">
            {!showSellerForm ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Vendedores</CardTitle>
                      <CardDescription>Gerencie o cadastro de vendedores</CardDescription>
                    </div>
                    <Button
                      onClick={() => {
                        setEditingSeller(null)
                        setNewSeller({ code: "", name: "", commissionPercentage: 0 })
                        setShowSellerForm(true)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Vendedor
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar vendedores..."
                      value={sellerSearchTerm}
                      onChange={(e) => setSellerSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Comissão</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sellers
                        .filter(
                          (seller) =>
                            seller.name?.toLowerCase().includes(sellerSearchTerm.toLowerCase()) ||
                            seller.code?.toLowerCase().includes(sellerSearchTerm.toLowerCase()) ||
                            seller.user?.email?.toLowerCase().includes(sellerSearchTerm.toLowerCase())
                        )
                        .map((seller) => (
                          <TableRow key={seller.id}>
                            <TableCell>{seller.code}</TableCell>
                            <TableCell>
                              <div className="font-medium">{seller.name}</div>
                              {seller.nickname && (
                                <div className="text-sm text-muted-foreground">{seller.nickname}</div>
                              )}
                            </TableCell>
                            <TableCell>
                              {seller.user
                                ? `${seller.user.firstName || ""} ${seller.user.lastName || ""}`.trim() ||
                                  seller.user.email
                                : "-"}
                            </TableCell>
                            <TableCell>
                              {seller.commissionPercentage != null
                                ? `${seller.commissionPercentage.toFixed(2)}%`
                                : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Abrir menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => openEditSellerDialog(seller)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => openDeleteSellerDialog(Number(seller.id))}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Excluir
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
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>{editingSeller ? "Editar" : "Novo"} Vendedor</CardTitle>
                  <CardDescription>
                    {editingSeller
                      ? "Atualize os dados do vendedor"
                      : "Cadastre um novo vendedor vinculando a um usuário"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SellerForm
                    seller={editingSeller || newSeller}
                    onSave={editingSeller ? handleUpdateSeller : handleSaveSeller}
                    onCancel={() => {
                      setShowSellerForm(false)
                      setEditingSeller(null)
                    }}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

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

      {/* Product Delete Dialog */}
      <AlertDialog open={isDeleteProductDialogOpen} onOpenChange={setIsDeleteProductDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente o produto.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* PriceTag Delete Dialog */}
      <AlertDialog open={isDeletePriceTagDialogOpen} onOpenChange={setIsDeletePriceTagDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente a tabela de preço.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePriceTag}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Supplier Delete Dialog */}
      <AlertDialog open={isDeleteSupplierDialogOpen} onOpenChange={setIsDeleteSupplierDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente o fornecedor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSupplier}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Seller Delete Dialog */}
      <AlertDialog open={isDeleteSellerDialogOpen} onOpenChange={setIsDeleteSellerDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente o vendedor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSeller}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarInset>
  )
}
