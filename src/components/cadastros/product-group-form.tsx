"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ProductGroup } from "@/services/product-group.service"

interface ProductGroupFormProps {
  productGroup?: Partial<ProductGroup>
  onSave: (productGroup: Partial<ProductGroup>) => void
  onCancel: () => void
}

export function ProductGroupForm({ productGroup, onSave, onCancel }: ProductGroupFormProps) {
  const [formData, setFormData] = useState<Partial<ProductGroup>>(productGroup || {
    code: "",
    name: "",
    branch: "",
    groupStatus: "",
    defaultPicture: "",
    origin: "",
    brandCode: "",
    brandDescription: "",
    relatedGroup: "",
    groupType: "",
    groupType2: "",
    tableRef: "",
    description: "",
    keyRelationTm: "",
    segment: "",
    segmentType: "",
    movementType: "",
    markupPercentage: 0,
    marginPercentage: 0,
    individualCommission: 0,
    commercialCommission: 0,
    toleranceDiscountIncrease: 0,
    interestGl: "",
    highLow: "",
    subGroup: "",
    subGroupDescription: "",
    groupClassification: "",
    productPrefix: "",
    productSequenceNumber: 0,
    aggregateChildPv: false,
    lackSupply: false,
    doNotReplenish: false,
    outOfLine: false,
    purchaseDays: 0,
    qncLevel1: "",
    qncLevel2: "",
    commercialDensity: 0,
    commercialDensity2: 0,
    pvMixOrder: 0,
    groupOrder: 0,
    changeLog: "",
    formula: "",
    lastUpdateTime: undefined,
    transferDate: undefined,
  })

  const handleInputChange = (field: string, value: any) => {
    console.log("[ProductGroupForm] campo alterado:", field, value)
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  console.log("[ProductGroupForm] formData atual:", formData)

  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="basic">Básico</TabsTrigger>
        <TabsTrigger value="brand">Marca</TabsTrigger>
        <TabsTrigger value="hierarchy">Hierarquia</TabsTrigger>
        <TabsTrigger value="financial">Financeiro</TabsTrigger>
        <TabsTrigger value="controls">Controles</TabsTrigger>
        <TabsTrigger value="technical">Técnico</TabsTrigger>
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
            <Label htmlFor="code">2. Código *</Label>
            <Input
              id="code"
              value={formData.code || ""}
              onChange={(e) => handleInputChange("code", e.target.value)}
              placeholder="GRP-001"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="groupStatus">4. Status Grupo</Label>
            <Input
              id="groupStatus"
              value={formData.groupStatus || ""}
              onChange={(e) => handleInputChange("groupStatus", e.target.value)}
              placeholder="Ativo, Inativo..."
              maxLength={20}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">3. Nome do Grupo *</Label>
          <Input
            id="name"
            value={formData.name || ""}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Nome do Grupo"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">12. Descrição</Label>
          <Textarea
            id="description"
            value={formData.description || ""}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Descrição detalhada do grupo"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="groupType">10. Tipo Grupo</Label>
            <Input
              id="groupType"
              value={formData.groupType || ""}
              onChange={(e) => handleInputChange("groupType", e.target.value)}
              placeholder="Tipo"
              maxLength={50}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="groupType2">38. Tipo Grupo 2</Label>
            <Input
              id="groupType2"
              value={formData.groupType2 || ""}
              onChange={(e) => handleInputChange("groupType2", e.target.value)}
              placeholder="Tipo 2"
              maxLength={50}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="defaultPicture">5. Foto Padrão (URL)</Label>
          <Textarea
            id="defaultPicture"
            value={formData.defaultPicture || ""}
            onChange={(e) => handleInputChange("defaultPicture", e.target.value)}
            placeholder="URL da imagem padrão"
            rows={2}
          />
        </div>
      </TabsContent>

      {/* ABA MARCA E ORIGEM */}
      <TabsContent value="brand" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="brandCode">7. Código Marca</Label>
            <Input
              id="brandCode"
              value={formData.brandCode || ""}
              onChange={(e) => handleInputChange("brandCode", e.target.value)}
              placeholder="MRC-001"
              maxLength={50}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="origin">6. Procedência</Label>
            <Input
              id="origin"
              value={formData.origin || ""}
              onChange={(e) => handleInputChange("origin", e.target.value)}
              placeholder="Nacional, Importado..."
              maxLength={100}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="brandDescription">8. Descrição Marca</Label>
          <Input
            id="brandDescription"
            value={formData.brandDescription || ""}
            onChange={(e) => handleInputChange("brandDescription", e.target.value)}
            placeholder="Nome completo da marca"
            maxLength={200}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="segment">14. Segmento</Label>
            <Input
              id="segment"
              value={formData.segment || ""}
              onChange={(e) => handleInputChange("segment", e.target.value)}
              placeholder="Segmento"
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="segmentType">43. Tipo Segmento</Label>
            <Input
              id="segmentType"
              value={formData.segmentType || ""}
              onChange={(e) => handleInputChange("segmentType", e.target.value)}
              placeholder="Tipo"
              maxLength={50}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="movementType">15. Tipo Movimento</Label>
            <Input
              id="movementType"
              value={formData.movementType || ""}
              onChange={(e) => handleInputChange("movementType", e.target.value)}
              placeholder="Tipo"
              maxLength={50}
            />
          </div>
        </div>
      </TabsContent>

      {/* ABA HIERARQUIA */}
      <TabsContent value="hierarchy" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="relatedGroup">9. Grupo Relacionado</Label>
            <Input
              id="relatedGroup"
              value={formData.relatedGroup || ""}
              onChange={(e) => handleInputChange("relatedGroup", e.target.value)}
              placeholder="Código do grupo pai"
              maxLength={50}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="groupClassification">41. Classificação Grupo</Label>
            <Input
              id="groupClassification"
              value={formData.groupClassification || ""}
              onChange={(e) => handleInputChange("groupClassification", e.target.value)}
              placeholder="Classificação"
              maxLength={50}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="subGroup">18. Sub-Grupo</Label>
            <Input
              id="subGroup"
              value={formData.subGroup || ""}
              onChange={(e) => handleInputChange("subGroup", e.target.value)}
              placeholder="Sub-Grupo"
              maxLength={50}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="highLow">17. Alta/Baixa</Label>
            <Input
              id="highLow"
              value={formData.highLow || ""}
              onChange={(e) => handleInputChange("highLow", e.target.value)}
              placeholder="Alta, Baixa..."
              maxLength={20}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subGroupDescription">19. Descrição Sub-Grupo</Label>
          <Input
            id="subGroupDescription"
            value={formData.subGroupDescription || ""}
            onChange={(e) => handleInputChange("subGroupDescription", e.target.value)}
            placeholder="Descrição do sub-grupo"
            maxLength={200}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="productPrefix">20. Prefixo Produto</Label>
            <Input
              id="productPrefix"
              value={formData.productPrefix || ""}
              onChange={(e) => handleInputChange("productPrefix", e.target.value)}
              placeholder="PRD"
              maxLength={20}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="productSequenceNumber">21. Núm. Seq. Produto</Label>
            <Input
              id="productSequenceNumber"
              type="number"
              value={formData.productSequenceNumber ?? ""}
              onChange={(e) => handleInputChange("productSequenceNumber", e.target.value === "" ? 0 : parseInt(e.target.value))}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 pt-8">
              <Checkbox
                id="outOfLine"
                checked={formData.outOfLine}
                onCheckedChange={(checked) => handleInputChange("outOfLine", checked)}
              />
              <Label htmlFor="outOfLine" className="cursor-pointer">
                30. Fora de Linha
              </Label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pvMixOrder">33. Ordem PV Mix</Label>
            <Input
              id="pvMixOrder"
              type="number"
              value={formData.pvMixOrder ?? ""}
              onChange={(e) => handleInputChange("pvMixOrder", e.target.value === "" ? 0 : parseInt(e.target.value))}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="groupOrder">34. Ordem Grupo</Label>
            <Input
              id="groupOrder"
              type="number"
              value={formData.groupOrder ?? ""}
              onChange={(e) => handleInputChange("groupOrder", e.target.value === "" ? 0 : parseInt(e.target.value))}
              placeholder="0"
            />
          </div>
        </div>
      </TabsContent>

      {/* ABA FINANCEIRO */}
      <TabsContent value="financial" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="markupPercentage">16. Mark-Up (%)</Label>
            <Input
              id="markupPercentage"
              type="number"
              step="0.01"
              value={formData.markupPercentage ?? ""}
              onChange={(e) => handleInputChange("markupPercentage", e.target.value === "" ? 0 : parseFloat(e.target.value))}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="marginPercentage">39. Margem (%)</Label>
            <Input
              id="marginPercentage"
              type="number"
              step="0.01"
              value={formData.marginPercentage ?? ""}
              onChange={(e) => handleInputChange("marginPercentage", e.target.value === "" ? 0 : parseFloat(e.target.value))}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="individualCommission">25. Comissão Individual (%)</Label>
            <Input
              id="individualCommission"
              type="number"
              step="0.01"
              value={formData.individualCommission ?? ""}
              onChange={(e) => handleInputChange("individualCommission", e.target.value === "" ? 0 : parseFloat(e.target.value))}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="commercialCommission">26. Comissão Comercial (%)</Label>
            <Input
              id="commercialCommission"
              type="number"
              step="0.01"
              value={formData.commercialCommission ?? ""}
              onChange={(e) => handleInputChange("commercialCommission", e.target.value === "" ? 0 : parseFloat(e.target.value))}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="toleranceDiscountIncrease">37. Tolerância Desc./Acrés.</Label>
            <Input
              id="toleranceDiscountIncrease"
              type="number"
              step="0.01"
              value={formData.toleranceDiscountIncrease ?? ""}
              onChange={(e) => handleInputChange("toleranceDiscountIncrease", e.target.value === "" ? 0 : parseFloat(e.target.value))}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interestGl">36. GL Sem Juros</Label>
            <Input
              id="interestGl"
              value={formData.interestGl || ""}
              onChange={(e) => handleInputChange("interestGl", e.target.value)}
              placeholder="GL"
              maxLength={50}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="commercialDensity">31. Densidade Comercial</Label>
            <Input
              id="commercialDensity"
              type="number"
              step="0.01"
              value={formData.commercialDensity ?? ""}
              onChange={(e) => handleInputChange("commercialDensity", e.target.value === "" ? 0 : parseFloat(e.target.value))}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="commercialDensity2">32. Densidade Comercial 2</Label>
            <Input
              id="commercialDensity2"
              type="number"
              step="0.01"
              value={formData.commercialDensity2 ?? ""}
              onChange={(e) => handleInputChange("commercialDensity2", e.target.value === "" ? 0 : parseFloat(e.target.value))}
              placeholder="0.00"
            />
          </div>
        </div>
      </TabsContent>

      {/* ABA CONTROLES */}
      <TabsContent value="controls" className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="aggregateChildPv"
              checked={formData.aggregateChildPv}
              onCheckedChange={(checked) => handleInputChange("aggregateChildPv", checked)}
            />
            <Label htmlFor="aggregateChildPv" className="cursor-pointer">
              22. Agregar PV Filho
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="lackSupply"
              checked={formData.lackSupply}
              onCheckedChange={(checked) => handleInputChange("lackSupply", checked)}
            />
            <Label htmlFor="lackSupply" className="cursor-pointer">
              23. Falta Insumo
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="doNotReplenish"
              checked={formData.doNotReplenish}
              onCheckedChange={(checked) => handleInputChange("doNotReplenish", checked)}
            />
            <Label htmlFor="doNotReplenish" className="cursor-pointer">
              24. Não Repor
            </Label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="purchaseDays">27. Dias Compra</Label>
            <Input
              id="purchaseDays"
              type="number"
              value={formData.purchaseDays ?? ""}
              onChange={(e) => handleInputChange("purchaseDays", e.target.value === "" ? 0 : parseInt(e.target.value))}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tableRef">11. Tabela Referência</Label>
            <Input
              id="tableRef"
              value={formData.tableRef || ""}
              onChange={(e) => handleInputChange("tableRef", e.target.value)}
              placeholder="Tabela"
              maxLength={50}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="qncLevel1">29. Nível 1 QNC</Label>
            <Input
              id="qncLevel1"
              value={formData.qncLevel1 || ""}
              onChange={(e) => handleInputChange("qncLevel1", e.target.value)}
              placeholder="Nível 1"
              maxLength={50}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="qncLevel2">28. Nível 2 QNC</Label>
            <Input
              id="qncLevel2"
              value={formData.qncLevel2 || ""}
              onChange={(e) => handleInputChange("qncLevel2", e.target.value)}
              placeholder="Nível 2"
              maxLength={50}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="keyRelationTm">13. Chave Relação TM</Label>
          <Input
            id="keyRelationTm"
            value={formData.keyRelationTm || ""}
            onChange={(e) => handleInputChange("keyRelationTm", e.target.value)}
            placeholder="TM"
            maxLength={50}
          />
        </div>
      </TabsContent>

      {/* ABA TÉCNICO */}
      <TabsContent value="technical" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="formula">42. Fórmula</Label>
          <Textarea
            id="formula"
            value={formData.formula || ""}
            onChange={(e) => handleInputChange("formula", e.target.value)}
            placeholder="Fórmula de cálculo"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="changeLog">35. Log de Alterações</Label>
          <Textarea
            id="changeLog"
            value={formData.changeLog || ""}
            onChange={(e) => handleInputChange("changeLog", e.target.value)}
            placeholder="Histórico de alterações"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="lastUpdateTime">44. Última Atualização</Label>
            <Input
              id="lastUpdateTime"
              type="datetime-local"
              value={formData.lastUpdateTime ? new Date(formData.lastUpdateTime).toISOString().slice(0, 16) : ""}
              onChange={(e) => handleInputChange("lastUpdateTime", e.target.value ? new Date(e.target.value) : undefined)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="transferDate">45. Data Transferência</Label>
            <Input
              id="transferDate"
              type="datetime-local"
              value={formData.transferDate ? new Date(formData.transferDate).toISOString().slice(0, 16) : ""}
              onChange={(e) => handleInputChange("transferDate", e.target.value ? new Date(e.target.value) : undefined)}
            />
          </div>
        </div>
      </TabsContent>

      {/* BOTÕES DE AÇÃO */}
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={() => onSave(formData)}>
          Salvar Grupo
        </Button>
      </div>
    </Tabs>
  )
}
