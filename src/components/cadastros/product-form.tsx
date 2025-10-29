"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Product } from "@/services/product.service"
import { getProductGroups, ProductGroup } from "@/services/product-group.service"
import { getUnities, Unity } from "@/services/types.service"

interface ProductFormProps {
  product?: Partial<Product>
  onSave: (product: Partial<Product>) => void
  onCancel: () => void
}

export function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState<Partial<Product>>(product || {
    code: "",
    name: "",
    ncm: "",
    supplier: "",
    packaging: "",
    price: 0,
    stockQuantity: 0,
    minStock: 0,
    active: true,
  })

  const [productGroups, setProductGroups] = useState<ProductGroup[]>([])
  const [unities, setUnities] = useState<Unity[]>([])

  useEffect(() => {
    loadReferenceData()
  }, [])

  const loadReferenceData = async () => {
    try {
      const [groupsData, unitiesData] = await Promise.all([
        getProductGroups(),
        getUnities(),
      ])
      setProductGroups(groupsData)
      setUnities(unitiesData)
    } catch (error) {
      console.error("Failed to load reference data:", error)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="code">Código *</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => handleInputChange("code", e.target.value)}
            placeholder="PRD-001"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Produto *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Produto A"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ncm">NCM</Label>
          <Input
            id="ncm"
            value={formData.ncm}
            onChange={(e) => handleInputChange("ncm", e.target.value)}
            placeholder="00000000"
            maxLength={10}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="supplier">Fornecedor</Label>
          <Input
            id="supplier"
            value={formData.supplier}
            onChange={(e) => handleInputChange("supplier", e.target.value)}
            placeholder="Nome do fornecedor"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="group">Grupo de Produto</Label>
          <Select
            value={formData.group?.id?.toString()}
            onValueChange={(value) => handleInputChange("group", { id: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um grupo..." />
            </SelectTrigger>
            <SelectContent>
              {productGroups.map((group) => (
                <SelectItem key={group.id} value={group.id!.toString()}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="unity">Unidade</Label>
          <Select
            value={formData.unity?.id?.toString()}
            onValueChange={(value) => handleInputChange("unity", { id: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma unidade..." />
            </SelectTrigger>
            <SelectContent>
              {unities.map((unity) => (
                <SelectItem key={unity.id} value={unity.id.toString()}>
                  {unity.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="packaging">Embalagem</Label>
          <Input
            id="packaging"
            value={formData.packaging}
            onChange={(e) => handleInputChange("packaging", e.target.value)}
            placeholder="Caixa, Unidade, etc."
            maxLength={50}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Preço (R$)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price || ""}
            onChange={(e) => handleInputChange("price", parseFloat(e.target.value))}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="stockQuantity">Quantidade em Estoque</Label>
          <Input
            id="stockQuantity"
            type="number"
            value={formData.stockQuantity || ""}
            onChange={(e) => handleInputChange("stockQuantity", parseInt(e.target.value))}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minStock">Estoque Mínimo</Label>
          <Input
            id="minStock"
            type="number"
            value={formData.minStock || ""}
            onChange={(e) => handleInputChange("minStock", parseInt(e.target.value))}
            placeholder="0"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="active"
          checked={formData.active}
          onCheckedChange={(checked) => handleInputChange("active", checked)}
        />
        <Label htmlFor="active" className="cursor-pointer">
          Produto Ativo
        </Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={() => onSave(formData)}>
          Salvar Produto
        </Button>
      </div>
    </div>
  )
}
