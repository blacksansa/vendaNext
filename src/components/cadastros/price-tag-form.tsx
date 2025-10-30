"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Search } from "lucide-react"
import { PriceTag, PriceTagItem } from "@/services/price-tag.service"
import { getProducts, Product } from "@/services/product.service"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface PriceTagFormProps {
  priceTag?: Partial<PriceTag>
  onSave: (priceTag: Partial<PriceTag>) => void
  onCancel: () => void
}

export function PriceTagForm({ priceTag, onSave, onCancel }: PriceTagFormProps) {
  const [formData, setFormData] = useState<Partial<PriceTag>>(priceTag || {
    code: "",
    name: "",
    description: "",
    validFrom: undefined,
    validTo: undefined,
    items: [],
  })

  const [products, setProducts] = useState<Product[]>([])
  const [productSearchTerm, setProductSearchTerm] = useState("")
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const productsData = await getProducts()
      setProducts(productsData)
    } catch (error) {
      console.error("Failed to load products:", error)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addItem = (product: Product) => {
    const newItem: PriceTagItem = {
      product: { id: product.id! },
      basePrice: product.price || 0,
      salePrice: product.price || 0,
      discountPercentage: 0
    }
    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }))
    setIsProductDialogOpen(false)
    setProductSearchTerm("")
  }

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items?.filter((_, i) => i !== index)
    }))
  }

  const updateItem = (index: number, field: keyof PriceTagItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items?.map((item, i) => {
        if (i !== index) return item
        
        const updated = { ...item, [field]: value }
        
        // Auto-calculate based on changes
        if (field === 'discountPercentage' && updated.basePrice) {
          updated.salePrice = updated.basePrice * (1 - (Number(value) || 0) / 100)
        } else if (field === 'salePrice' && updated.basePrice) {
          updated.discountPercentage = ((updated.basePrice - Number(value)) / updated.basePrice) * 100
        } else if (field === 'basePrice') {
          if (updated.discountPercentage) {
            updated.salePrice = Number(value) * (1 - (updated.discountPercentage || 0) / 100)
          } else {
            updated.salePrice = Number(value)
          }
        }
        
        return updated
      })
    }))
  }

  const handleSubmit = () => {
    onSave(formData)
  }

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    p.code?.toLowerCase().includes(productSearchTerm.toLowerCase())
  )

  const getProductName = (productId?: number) => {
    if (productId === undefined || productId === null) return "Produto não encontrado"
    const product = products.find(p => p.id === productId)
    return product?.name || "Produto não encontrado"
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <Card>
        <CardHeader>
          <CardTitle>Dados da Tabela</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleInputChange("code", e.target.value)}
                placeholder="TAB-001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Descrição *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Tabela de Preços Padrão"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Observações</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Informações adicionais sobre a tabela"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="validFrom">Válido De</Label>
              <Input
                id="validFrom"
                type="date"
                value={formData.validFrom ? new Date(formData.validFrom).toISOString().split('T')[0] : ""}
                onChange={(e) => handleInputChange("validFrom", new Date(e.target.value).getTime())}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="validTo">Válido Até</Label>
              <Input
                id="validTo"
                type="date"
                value={formData.validTo ? new Date(formData.validTo).toISOString().split('T')[0] : ""}
                onChange={(e) => handleInputChange("validTo", new Date(e.target.value).getTime())}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Produtos</CardTitle>
            <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Produto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Selecionar Produto</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar produtos..."
                      value={productSearchTerm}
                      onChange={(e) => setProductSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="max-h-[400px] overflow-y-auto border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Código</TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead>Preço</TableHead>
                          <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>{product.code}</TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>R$ {product.price?.toFixed(2)}</TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                onClick={() => addItem(product)}
                              >
                                Adicionar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Preço Base</TableHead>
                <TableHead>% Desconto</TableHead>
                <TableHead>Preço Venda</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formData.items?.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {typeof item.product === 'object' && 'id' in item.product
                      ? getProductName(item.product.id)
                      : "Produto"}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.basePrice || 0}
                      onChange={(e) => updateItem(index, 'basePrice', parseFloat(e.target.value))}
                      className="w-32"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.discountPercentage || 0}
                      onChange={(e) => updateItem(index, 'discountPercentage', parseFloat(e.target.value))}
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.salePrice || 0}
                      onChange={(e) => updateItem(index, 'salePrice', parseFloat(e.target.value))}
                      className="w-32"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!formData.items || formData.items.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhum produto adicionado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit}>
          Salvar Tabela
        </Button>
      </div>
    </div>
  )
}
