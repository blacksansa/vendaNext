"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
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
    branch: "",
    type: "",
    itemCode: "",
    measurements: "",
    productClassification: "",
    packagingQuantity: 0,
    ncm: "",
    tipiSpecies: "",
    exNcm: "",
    exNbm: "",
    salePrice: 0,
    standardCost: 0,
    defaultWarehouse: "",
    structureBase: "",
    icmsRate: 0,
    ipiRate: 0,
    freightCategory: "",
    franchiseLine: "",
    issRate: 0,
    flRepDate: undefined,
    blocked: false,
    photo: "",
    secondUnitMeasure: "",
    active: true,
    netWeight: 0,
    grossWeight: 0,
    issServiceCode: "",
    addressControl: "",
    tracking: "",
    appropriation: "",
    standardTs: "",
    standardTe: "",
    outputRequest: "",
    lastPurchase: undefined,
    entryRequest: "",
    freeZoneImport: false,
    securityStockFormula: "",
    conversionFactor: 0,
    conversionType: "",
    alternative: "",
    orderReturn: false,
    complexity: "",
    supplier: "",
    packaging: "",
    price: 0,
    stockQuantity: 0,
    minStock: 0,
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
    console.log("[ProductForm] campo alterado:", field, value)
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  console.log("[ProductForm] formData atual:", formData)

  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="basic">Básico</TabsTrigger>
        <TabsTrigger value="fiscal">Fiscal</TabsTrigger>
        <TabsTrigger value="pricing">Preços</TabsTrigger>
        <TabsTrigger value="stock">Estoque</TabsTrigger>
        <TabsTrigger value="additional">Adicionais</TabsTrigger>
      </TabsList>

      {/* ABA BÁSICO */}
      <TabsContent value="basic" className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="branch">1. Filial</Label>
            <Input
              id="branch"
              value={formData.branch || ""}
              onChange={(e) => handleInputChange("branch", e.target.value)}
              placeholder="Filial"
              maxLength={10}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">4. Código *</Label>
            <Input
              id="code"
              value={formData.code || ""}
              onChange={(e) => handleInputChange("code", e.target.value)}
              placeholder="PRD-001"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="itemCode">5. Cod Item</Label>
            <Input
              id="itemCode"
              value={formData.itemCode || ""}
              onChange={(e) => handleInputChange("itemCode", e.target.value)}
              placeholder="Item Code"
              maxLength={50}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">6. Descrição *</Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Nome do Produto"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">3. Tipo</Label>
            <Input
              id="type"
              value={formData.type || ""}
              onChange={(e) => handleInputChange("type", e.target.value)}
              placeholder="Tipo"
              maxLength={50}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="group">2. Grupo</Label>
            <Select
              value={formData.group?.id?.toString()}
              onValueChange={(value) => handleInputChange("group", { id: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
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
            <Label htmlFor="unity">7. Unidade</Label>
            <Select
              value={formData.unity?.id?.toString()}
              onValueChange={(value) => handleInputChange("unity", { id: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
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
          <div className="space-y-2">
            <Label htmlFor="secondUnitMeasure">27. Seg. Un. Med.</Label>
            <Input
              id="secondUnitMeasure"
              value={formData.secondUnitMeasure || ""}
              onChange={(e) => handleInputChange("secondUnitMeasure", e.target.value)}
              placeholder="UN"
              maxLength={10}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="measurements">8. Medidas</Label>
            <Input
              id="measurements"
              value={formData.measurements || ""}
              onChange={(e) => handleInputChange("measurements", e.target.value)}
              placeholder="10x20x30"
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="netWeight">29. Peso Líquido</Label>
            <Input
              id="netWeight"
              type="number"
              step="0.001"
              value={formData.netWeight ?? ""}
              onChange={(e) => handleInputChange("netWeight", e.target.value === "" ? 0 : parseFloat(e.target.value))}
              placeholder="0.000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="grossWeight">30. Peso Bruto</Label>
            <Input
              id="grossWeight"
              type="number"
              step="0.001"
              value={formData.grossWeight ?? ""}
              onChange={(e) => handleInputChange("grossWeight", e.target.value === "" ? 0 : parseFloat(e.target.value))}
              placeholder="0.000"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="productClassification">9. Classif. Prod</Label>
            <Input
              id="productClassification"
              value={formData.productClassification || ""}
              onChange={(e) => handleInputChange("productClassification", e.target.value)}
              placeholder="Classificação"
              maxLength={50}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="complexity">46. Complexidade</Label>
            <Input
              id="complexity"
              value={formData.complexity || ""}
              onChange={(e) => handleInputChange("complexity", e.target.value)}
              placeholder="Complexidade"
              maxLength={50}
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => handleInputChange("active", checked)}
            />
            <Label htmlFor="active" className="cursor-pointer">
              28. Ativo
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="blocked"
              checked={formData.blocked}
              onCheckedChange={(checked) => handleInputChange("blocked", checked)}
            />
            <Label htmlFor="blocked" className="cursor-pointer">
              25. Bloqueado
            </Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="photo">26. Foto (URL)</Label>
          <Textarea
            id="photo"
            value={formData.photo || ""}
            onChange={(e) => handleInputChange("photo", e.target.value)}
            placeholder="URL da foto do produto"
            rows={2}
          />
        </div>
      </TabsContent>

      {/* ABA FISCAL */}
      <TabsContent value="fiscal" className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ncm">11. Pos. IPI/NCM</Label>
            <Input
              id="ncm"
              value={formData.ncm || ""}
              onChange={(e) => handleInputChange("ncm", e.target.value)}
              placeholder="00000000"
              maxLength={10}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exNcm">13. Ex-NCM</Label>
            <Input
              id="exNcm"
              value={formData.exNcm || ""}
              onChange={(e) => handleInputChange("exNcm", e.target.value)}
              placeholder="Ex-NCM"
              maxLength={10}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exNbm">14. Ex-NBM</Label>
            <Input
              id="exNbm"
              value={formData.exNbm || ""}
              onChange={(e) => handleInputChange("exNbm", e.target.value)}
              placeholder="Ex-NBM"
              maxLength={10}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tipiSpecies">12. Espécie TIPI</Label>
            <Input
              id="tipiSpecies"
              value={formData.tipiSpecies || ""}
              onChange={(e) => handleInputChange("tipiSpecies", e.target.value)}
              placeholder="Espécie TIPI"
              maxLength={50}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="issServiceCode">31. Cod. Serv. ISS</Label>
            <Input
              id="issServiceCode"
              value={formData.issServiceCode || ""}
              onChange={(e) => handleInputChange("issServiceCode", e.target.value)}
              placeholder="Código ISS"
              maxLength={20}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="freeZoneImport"
                checked={formData.freeZoneImport}
                onCheckedChange={(checked) => handleInputChange("freeZoneImport", checked)}
              />
              <Label htmlFor="freeZoneImport" className="cursor-pointer">
                40. Imp. Z. Franca
              </Label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="icmsRate">19. Alíq. ICMS (%)</Label>
            <Input
              id="icmsRate"
              type="number"
              step="0.01"
              value={formData.icmsRate ?? ""}
              onChange={(e) => handleInputChange("icmsRate", e.target.value === "" ? 0 : parseFloat(e.target.value))}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ipiRate">20. Alíq. IPI (%)</Label>
            <Input
              id="ipiRate"
              type="number"
              step="0.01"
              value={formData.ipiRate ?? ""}
              onChange={(e) => handleInputChange("ipiRate", e.target.value === "" ? 0 : parseFloat(e.target.value))}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="issRate">23. Alíq. ISS (%)</Label>
            <Input
              id="issRate"
              type="number"
              step="0.01"
              value={formData.issRate ?? ""}
              onChange={(e) => handleInputChange("issRate", e.target.value === "" ? 0 : parseFloat(e.target.value))}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="standardTs">35. TS Padrão</Label>
            <Input
              id="standardTs"
              value={formData.standardTs || ""}
              onChange={(e) => handleInputChange("standardTs", e.target.value)}
              placeholder="TS"
              maxLength={10}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="standardTe">36. TE Padrão</Label>
            <Input
              id="standardTe"
              value={formData.standardTe || ""}
              onChange={(e) => handleInputChange("standardTe", e.target.value)}
              placeholder="TE"
              maxLength={10}
            />
          </div>
        </div>
      </TabsContent>

      {/* ABA PREÇOS */}
      <TabsContent value="pricing" className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="salePrice">15. Preço Venda (R$)</Label>
            <Input
              id="salePrice"
              type="number"
              step="0.01"
              value={formData.salePrice ?? ""}
              onChange={(e) => handleInputChange("salePrice", e.target.value === "" ? 0 : parseFloat(e.target.value))}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="standardCost">16. Custo Stand. (R$)</Label>
            <Input
              id="standardCost"
              type="number"
              step="0.01"
              value={formData.standardCost ?? ""}
              onChange={(e) => handleInputChange("standardCost", e.target.value === "" ? 0 : parseFloat(e.target.value))}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Preço Legacy (R$)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price ?? ""}
              onChange={(e) => handleInputChange("price", e.target.value === "" ? 0 : parseFloat(e.target.value))}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="freightCategory">21. Categoria Fr.</Label>
            <Input
              id="freightCategory"
              value={formData.freightCategory || ""}
              onChange={(e) => handleInputChange("freightCategory", e.target.value)}
              placeholder="Categoria Frete"
              maxLength={50}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="franchiseLine">22. Linha Franj.</Label>
            <Input
              id="franchiseLine"
              value={formData.franchiseLine || ""}
              onChange={(e) => handleInputChange("franchiseLine", e.target.value)}
              placeholder="Linha Franquia"
              maxLength={50}
            />
          </div>
        </div>
      </TabsContent>

      {/* ABA ESTOQUE */}
      <TabsContent value="stock" className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="stockQuantity">Quantidade Estoque</Label>
            <Input
              id="stockQuantity"
              type="number"
              value={formData.stockQuantity ?? ""}
              onChange={(e) => handleInputChange("stockQuantity", e.target.value === "" ? 0 : parseInt(e.target.value))}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minStock">Estoque Mínimo</Label>
            <Input
              id="minStock"
              type="number"
              value={formData.minStock ?? ""}
              onChange={(e) => handleInputChange("minStock", e.target.value === "" ? 0 : parseInt(e.target.value))}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultWarehouse">17. Armazem Pad.</Label>
            <Input
              id="defaultWarehouse"
              value={formData.defaultWarehouse || ""}
              onChange={(e) => handleInputChange("defaultWarehouse", e.target.value)}
              placeholder="Armazém"
              maxLength={50}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="packagingQuantity">10. Qt. Embalagem</Label>
            <Input
              id="packagingQuantity"
              type="number"
              step="0.01"
              value={formData.packagingQuantity ?? ""}
              onChange={(e) => handleInputChange("packagingQuantity", e.target.value === "" ? 0 : parseFloat(e.target.value))}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="packaging">47. Embalagem</Label>
            <Input
              id="packaging"
              value={formData.packaging || ""}
              onChange={(e) => handleInputChange("packaging", e.target.value)}
              placeholder="Caixa, Unidade"
              maxLength={50}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="addressControl">32. Contr. Enderer.</Label>
            <Input
              id="addressControl"
              value={formData.addressControl || ""}
              onChange={(e) => handleInputChange("addressControl", e.target.value)}
              placeholder="Controle"
              maxLength={50}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tracking">33. Rastro</Label>
            <Input
              id="tracking"
              value={formData.tracking || ""}
              onChange={(e) => handleInputChange("tracking", e.target.value)}
              placeholder="Rastreamento"
              maxLength={50}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="outputRequest">37. Solid. Saída</Label>
            <Input
              id="outputRequest"
              value={formData.outputRequest || ""}
              onChange={(e) => handleInputChange("outputRequest", e.target.value)}
              placeholder="Solicitação"
              maxLength={50}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="entryRequest">39. Solid. Entr.</Label>
            <Input
              id="entryRequest"
              value={formData.entryRequest || ""}
              onChange={(e) => handleInputChange("entryRequest", e.target.value)}
              placeholder="Solicitação"
              maxLength={50}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="securityStockFormula">41. Form. Est. Seg.</Label>
            <Input
              id="securityStockFormula"
              value={formData.securityStockFormula || ""}
              onChange={(e) => handleInputChange("securityStockFormula", e.target.value)}
              placeholder="Fórmula"
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 pt-8">
              <Checkbox
                id="orderReturn"
                checked={formData.orderReturn}
                onCheckedChange={(checked) => handleInputChange("orderReturn", checked)}
              />
              <Label htmlFor="orderReturn" className="cursor-pointer">
                45. Retorno Pedido
              </Label>
            </div>
          </div>
        </div>
      </TabsContent>

      {/* ABA ADICIONAIS */}
      <TabsContent value="additional" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="supplier">Fornecedor</Label>
            <Input
              id="supplier"
              value={formData.supplier || ""}
              onChange={(e) => handleInputChange("supplier", e.target.value)}
              placeholder="Nome do fornecedor"
              maxLength={200}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="structureBase">18. Base Estrut.</Label>
            <Input
              id="structureBase"
              value={formData.structureBase || ""}
              onChange={(e) => handleInputChange("structureBase", e.target.value)}
              placeholder="Base"
              maxLength={50}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="appropriation">34. Apropriação</Label>
            <Input
              id="appropriation"
              value={formData.appropriation || ""}
              onChange={(e) => handleInputChange("appropriation", e.target.value)}
              placeholder="Apropriação"
              maxLength={50}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="conversionFactor">42. Fator Conv.</Label>
            <Input
              id="conversionFactor"
              type="number"
              step="0.0001"
              value={formData.conversionFactor ?? ""}
              onChange={(e) => handleInputChange("conversionFactor", e.target.value === "" ? 0 : parseFloat(e.target.value))}
              placeholder="1.0000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="conversionType">43. Tipo de Conv.</Label>
            <Input
              id="conversionType"
              value={formData.conversionType || ""}
              onChange={(e) => handleInputChange("conversionType", e.target.value)}
              placeholder="Tipo"
              maxLength={50}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="alternative">44. Alternativo</Label>
            <Input
              id="alternative"
              value={formData.alternative || ""}
              onChange={(e) => handleInputChange("alternative", e.target.value)}
              placeholder="Produto alternativo"
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="flRepDate">24. DT Rep FL</Label>
            <Input
              id="flRepDate"
              type="date"
              value={formData.flRepDate ? new Date(formData.flRepDate).toISOString().split('T')[0] : ""}
              onChange={(e) => handleInputChange("flRepDate", e.target.value ? new Date(e.target.value) : undefined)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastPurchase">38. Ult. Compra</Label>
          <Input
            id="lastPurchase"
            type="date"
            value={formData.lastPurchase ? new Date(formData.lastPurchase).toISOString().split('T')[0] : ""}
            onChange={(e) => handleInputChange("lastPurchase", e.target.value ? new Date(e.target.value) : undefined)}
          />
        </div>
      </TabsContent>

      {/* BOTÕES DE AÇÃO */}
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={() => onSave(formData)}>
          Salvar Produto
        </Button>
      </div>
    </Tabs>
  )
}
