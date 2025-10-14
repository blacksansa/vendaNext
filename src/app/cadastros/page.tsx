"use client"

import { useState } from "react"
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
import { Search, Plus, MoreHorizontal, Edit, Trash2, Package, Users, Building2 } from "lucide-react"

// Mock data
const mockClientes = [
  {
    id: 1,
    nome: "João Silva",
    email: "joao@email.com",
    telefone: "(11) 98765-4321",
    empresa: "Tech Corp",
    tipo: "Pessoa Física",
  },
  {
    id: 2,
    nome: "Maria Santos",
    email: "maria@email.com",
    telefone: "(11) 97654-3210",
    empresa: "Design Studio",
    tipo: "Pessoa Jurídica",
  },
  {
    id: 3,
    nome: "Pedro Costa",
    email: "pedro@email.com",
    telefone: "(11) 96543-2109",
    empresa: "Marketing Plus",
    tipo: "Pessoa Física",
  },
]

const mockProdutos = [
  { id: 1, nome: "Produto A", codigo: "PRD-001", categoria: "Eletrônicos", preco: "R$ 1.500,00", estoque: 45 },
  { id: 2, nome: "Produto B", codigo: "PRD-002", categoria: "Móveis", preco: "R$ 2.800,00", estoque: 12 },
  { id: 3, nome: "Produto C", codigo: "PRD-003", categoria: "Decoração", preco: "R$ 450,00", estoque: 78 },
]

const mockFornecedores = [
  {
    id: 1,
    nome: "Fornecedor Alpha",
    cnpj: "12.345.678/0001-90",
    contato: "Carlos Lima",
    telefone: "(11) 3456-7890",
    email: "contato@alpha.com",
  },
  {
    id: 2,
    nome: "Fornecedor Beta",
    cnpj: "98.765.432/0001-10",
    contato: "Ana Paula",
    telefone: "(11) 3456-7891",
    email: "contato@beta.com",
  },
]

export default function CadastrosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isClienteDialogOpen, setIsClienteDialogOpen] = useState(false)
  const [isProdutoDialogOpen, setIsProdutoDialogOpen] = useState(false)
  const [isFornecedorDialogOpen, setIsFornecedorDialogOpen] = useState(false)

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
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
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
          </TabsList>

          {/* Aba Clientes */}
          <TabsContent value="clientes" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Clientes</CardTitle>
                    <CardDescription>Gerencie o cadastro de clientes</CardDescription>
                  </div>
                  <Dialog open={isClienteDialogOpen} onOpenChange={setIsClienteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Cliente
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Novo Cliente</DialogTitle>
                        <DialogDescription>Cadastre um novo cliente no sistema</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="nome">Nome Completo</Label>
                          <Input id="nome" placeholder="João Silva" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="tipo">Tipo</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pf">Pessoa Física</SelectItem>
                              <SelectItem value="pj">Pessoa Jurídica</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" placeholder="joao@email.com" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="telefone">Telefone</Label>
                          <Input id="telefone" placeholder="(11) 98765-4321" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="empresa">Empresa</Label>
                          <Input id="empresa" placeholder="Nome da empresa" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="observacoes">Observações</Label>
                          <Textarea id="observacoes" placeholder="Informações adicionais..." />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsClienteDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={() => setIsClienteDialogOpen(false)}>Salvar Cliente</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
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
                    {mockClientes.map((cliente) => (
                      <TableRow key={cliente.id}>
                        <TableCell className="font-medium">{cliente.nome}</TableCell>
                        <TableCell>{cliente.email}</TableCell>
                        <TableCell>{cliente.telefone}</TableCell>
                        <TableCell>{cliente.empresa}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{cliente.tipo}</Badge>
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
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
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
          </TabsContent>

          {/* Aba Produtos */}
          <TabsContent value="produtos" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Produtos</CardTitle>
                    <CardDescription>Gerencie o catálogo de produtos</CardDescription>
                  </div>
                  <Dialog open={isProdutoDialogOpen} onOpenChange={setIsProdutoDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Produto
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Novo Produto</DialogTitle>
                        <DialogDescription>Cadastre um novo produto no catálogo</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="nome-produto">Nome do Produto</Label>
                          <Input id="nome-produto" placeholder="Produto A" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="codigo">Código</Label>
                          <Input id="codigo" placeholder="PRD-001" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="categoria">Categoria</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a categoria" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="eletronicos">Eletrônicos</SelectItem>
                              <SelectItem value="moveis">Móveis</SelectItem>
                              <SelectItem value="decoracao">Decoração</SelectItem>
                              <SelectItem value="outros">Outros</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="preco">Preço</Label>
                            <Input id="preco" placeholder="R$ 0,00" />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="estoque">Estoque</Label>
                            <Input id="estoque" type="number" placeholder="0" />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="descricao">Descrição</Label>
                          <Textarea id="descricao" placeholder="Descrição do produto..." />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsProdutoDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={() => setIsProdutoDialogOpen(false)}>Salvar Produto</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Buscar produtos..." className="pl-10" />
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Estoque</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockProdutos.map((produto) => (
                      <TableRow key={produto.id}>
                        <TableCell className="font-medium">{produto.nome}</TableCell>
                        <TableCell>{produto.codigo}</TableCell>
                        <TableCell>{produto.categoria}</TableCell>
                        <TableCell>{produto.preco}</TableCell>
                        <TableCell>
                          <Badge variant={produto.estoque > 20 ? "default" : "destructive"}>{produto.estoque} un</Badge>
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
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
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
          </TabsContent>

          {/* Aba Fornecedores */}
          <TabsContent value="fornecedores" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Fornecedores</CardTitle>
                    <CardDescription>Gerencie o cadastro de fornecedores</CardDescription>
                  </div>
                  <Dialog open={isFornecedorDialogOpen} onOpenChange={setIsFornecedorDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Fornecedor
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Novo Fornecedor</DialogTitle>
                        <DialogDescription>Cadastre um novo fornecedor no sistema</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="nome-fornecedor">Nome do Fornecedor</Label>
                          <Input id="nome-fornecedor" placeholder="Fornecedor Alpha" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="cnpj">CNPJ</Label>
                          <Input id="cnpj" placeholder="12.345.678/0001-90" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="contato">Nome do Contato</Label>
                          <Input id="contato" placeholder="Carlos Lima" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="telefone-fornecedor">Telefone</Label>
                          <Input id="telefone-fornecedor" placeholder="(11) 3456-7890" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="email-fornecedor">Email</Label>
                          <Input id="email-fornecedor" type="email" placeholder="contato@fornecedor.com" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="endereco">Endereço</Label>
                          <Textarea id="endereco" placeholder="Endereço completo..." />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsFornecedorDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={() => setIsFornecedorDialogOpen(false)}>Salvar Fornecedor</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Buscar fornecedores..." className="pl-10" />
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockFornecedores.map((fornecedor) => (
                      <TableRow key={fornecedor.id}>
                        <TableCell className="font-medium">{fornecedor.nome}</TableCell>
                        <TableCell>{fornecedor.cnpj}</TableCell>
                        <TableCell>{fornecedor.contato}</TableCell>
                        <TableCell>{fornecedor.telefone}</TableCell>
                        <TableCell>{fornecedor.email}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-.2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
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
          </TabsContent>
        </Tabs>
      </div>
    </SidebarInset>
  )
}
