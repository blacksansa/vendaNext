"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Customer } from "@/lib/types"

interface CustomerFormProps {
  customer?: Partial<Customer>
  onSave: (customer: Partial<Customer>) => void
  onCancel: () => void
}

export function CustomerForm({ customer, onSave, onCancel }: CustomerFormProps) {
  const [formData, setFormData] = useState<Partial<Customer>>({
    code: customer?.code || "",
    name: customer?.name || "",
    companyName: customer?.companyName || "",
    cnpj: customer?.cnpj || "",
    document: customer?.document || "",
    observation: customer?.observation || "",
    region: customer?.region || "",
    active: customer?.active ?? true,
    addresses: customer?.addresses || [],
    contacts: customer?.contacts || [],
    branch: customer?.branch || "",
    store: customer?.store || "",
    personType: customer?.personType || "",
    tradeName: customer?.tradeName || "",
    stateRegistration: customer?.stateRegistration || "",
    municipalRegistration: customer?.municipalRegistration || "",
    nature: customer?.nature || "",
    phone: customer?.phone || "",
    phone2: customer?.phone2 || "",
    phone3: customer?.phone3 || "",
    fax: customer?.fax || "",
    telex: customer?.telex || "",
    ddd: customer?.ddd || "",
    ddi: customer?.ddi || "",
    street: customer?.street || "",
    streetComplement: customer?.streetComplement || "",
    neighborhood: customer?.neighborhood || "",
    city: customer?.city || "",
    cityCode: customer?.cityCode || "",
    state: customer?.state || "",
    stateName: customer?.stateName || "",
    zipCode: customer?.zipCode || "",
    country: customer?.country || "",
    countryBacen: customer?.countryBacen || "",
    locality: customer?.locality || "",
    billingAddress: customer?.billingAddress || "",
    billingCity: customer?.billingCity || "",
    billingNeighborhood: customer?.billingNeighborhood || "",
    billingZipCode: customer?.billingZipCode || "",
    billingState: customer?.billingState || "",
    salesGroup: customer?.salesGroup || "",
    taxGroup: customer?.taxGroup || "",
    commercialPartner: customer?.commercialPartner || "",
    mainSegment: customer?.mainSegment || "",
    route: customer?.route || "",
    customerNiche: customer?.customerNiche || "",
    contractType: customer?.contractType || "",
    commissionPercentage: customer?.commissionPercentage || 0,
    accountingAccount: customer?.accountingAccount || "",
    addressType: customer?.addressType || "",
  })

  // Helper para garantir que valores nunca sejam undefined
  const getValue = (value: any): string => value ?? ""

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="basic">
        <TabsList>
          <TabsTrigger value="basic">Dados Básicos</TabsTrigger>
          <TabsTrigger value="address">Endereços</TabsTrigger>
          <TabsTrigger value="commercial">Comercial</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código *</Label>
              <Input
                id="code"
                value={getValue(formData.code)}
                onChange={(e) => handleInputChange("code", e.target.value)}
                placeholder="CLI-001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch">Filial</Label>
              <Input
                id="branch"
                value={getValue(formData.branch)}
                onChange={(e) => handleInputChange("branch", e.target.value)}
                placeholder="01"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store">Loja</Label>
              <Input
                id="store"
                value={getValue(formData.store)}
                onChange={(e) => handleInputChange("store", e.target.value)}
                placeholder="01"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="personType">Física/Jurídica</Label>
              <Select
                value={getValue(formData.personType)}
                onValueChange={(value) => handleInputChange("personType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="F">Física</SelectItem>
                  <SelectItem value="J">Jurídica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={getValue(formData.name)}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="João Silva"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Razão Social / Compl. Razão</Label>
              <Input
                id="companyName"
                value={getValue(formData.companyName)}
                onChange={(e) => handleInputChange("companyName", e.target.value)}
                placeholder="Empresa XYZ Ltda"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tradeName">Nome Fantasia</Label>
              <Input
                id="tradeName"
                value={getValue(formData.tradeName)}
                onChange={(e) => handleInputChange("tradeName", e.target.value)}
                placeholder="XYZ"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ/CPF</Label>
              <Input
                id="cnpj"
                value={getValue(formData.cnpj)}
                onChange={(e) => handleInputChange("cnpj", e.target.value)}
                placeholder="00000000000000"
                maxLength={14}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="document">CPF / RG</Label>
              <Input
                id="document"
                value={getValue(formData.document)}
                onChange={(e) => handleInputChange("document", e.target.value)}
                placeholder="00000000000"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stateRegistration">Ins. Estadual</Label>
              <Input
                id="stateRegistration"
                value={getValue(formData.stateRegistration)}
                onChange={(e) => handleInputChange("stateRegistration", e.target.value)}
                placeholder="000000000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="municipalRegistration">Ins. Municipal</Label>
              <Input
                id="municipalRegistration"
                value={getValue(formData.municipalRegistration)}
                onChange={(e) => handleInputChange("municipalRegistration", e.target.value)}
                placeholder="000000000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nature">Natureza</Label>
              <Input
                id="nature"
                value={getValue(formData.nature)}
                onChange={(e) => handleInputChange("nature", e.target.value)}
                placeholder="Comercial"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ddi">DDI</Label>
              <Input
                id="ddi"
                value={getValue(formData.ddi)}
                onChange={(e) => handleInputChange("ddi", e.target.value)}
                placeholder="+55"
                maxLength={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ddd">DDD</Label>
              <Input
                id="ddd"
                value={getValue(formData.ddd)}
                onChange={(e) => handleInputChange("ddd", e.target.value)}
                placeholder="11"
                maxLength={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={getValue(formData.phone)}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="999999999"
                maxLength={20}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone2">Telefone 2</Label>
              <Input
                id="phone2"
                value={getValue(formData.phone2)}
                onChange={(e) => handleInputChange("phone2", e.target.value)}
                placeholder="999999999"
                maxLength={20}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone3">Telefone 3</Label>
              <Input
                id="phone3"
                value={getValue(formData.phone3)}
                onChange={(e) => handleInputChange("phone3", e.target.value)}
                placeholder="999999999"
                maxLength={20}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fax">FAX</Label>
              <Input
                id="fax"
                value={getValue(formData.fax)}
                onChange={(e) => handleInputChange("fax", e.target.value)}
                placeholder="999999999"
                maxLength={20}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telex">Telex</Label>
              <Input
                id="telex"
                value={getValue(formData.telex)}
                onChange={(e) => handleInputChange("telex", e.target.value)}
                placeholder="000000"
                maxLength={20}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observation">Observações</Label>
            <Textarea
              id="observation"
              value={getValue(formData.observation)}
              onChange={(e) => handleInputChange("observation", e.target.value)}
              placeholder="Informações adicionais..."
              rows={3}
            />
          </div>
        </TabsContent>

        <TabsContent value="address" className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-4 space-y-2">
              <Label htmlFor="addressType">Tipo de Endereço</Label>
              <Select
                value={getValue(formData.addressType)}
                onValueChange={(value) => handleInputChange("addressType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Principal">Principal</SelectItem>
                  <SelectItem value="Cobrança">Cobrança</SelectItem>
                  <SelectItem value="Comercial">Comercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Campos para Endereço Principal */}
          {formData.addressType === "Principal" && (
            <>
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1 space-y-2">
                  <Label htmlFor="zipCode">CEP</Label>
                  <Input
                    id="zipCode"
                    value={getValue(formData.zipCode)}
                    onChange={(e) => handleInputChange("zipCode", e.target.value)}
                    placeholder="00000000"
                    maxLength={10}
                  />
                </div>
                <div className="col-span-3 space-y-2">
                  <Label htmlFor="street">Endereço</Label>
                  <Input
                    id="street"
                    value={getValue(formData.street)}
                    onChange={(e) => handleInputChange("street", e.target.value)}
                    placeholder="Rua..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="streetComplement">Comp. Endereço</Label>
                  <Input
                    id="streetComplement"
                    value={getValue(formData.streetComplement)}
                    onChange={(e) => handleInputChange("streetComplement", e.target.value)}
                    placeholder="Apto 101"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={getValue(formData.neighborhood)}
                    onChange={(e) => handleInputChange("neighborhood", e.target.value)}
                    placeholder="Centro"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="city">Município</Label>
                  <Input
                    id="city"
                    value={getValue(formData.city)}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="São Paulo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cityCode">Cód. Município</Label>
                  <Input
                    id="cityCode"
                    value={getValue(formData.cityCode)}
                    onChange={(e) => handleInputChange("cityCode", e.target.value)}
                    placeholder="3550308"
                    maxLength={10}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="locality">Localidade</Label>
                  <Input
                    id="locality"
                    value={getValue(formData.locality)}
                    onChange={(e) => handleInputChange("locality", e.target.value)}
                    placeholder="Zona Sul"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">Estado (UF)</Label>
                  <Input
                    id="state"
                    value={getValue(formData.state)}
                    onChange={(e) => handleInputChange("state", e.target.value.toUpperCase())}
                    placeholder="SP"
                    maxLength={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stateName">Nome Estado</Label>
                  <Input
                    id="stateName"
                    value={getValue(formData.stateName)}
                    onChange={(e) => handleInputChange("stateName", e.target.value)}
                    placeholder="São Paulo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Região</Label>
                  <Input
                    id="region"
                    value={getValue(formData.region)}
                    onChange={(e) => handleInputChange("region", e.target.value)}
                    placeholder="Sudeste"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">País</Label>
                  <Input
                    id="country"
                    value={getValue(formData.country)}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    placeholder="Brasil"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="countryBacen">País Bacen</Label>
                  <Input
                    id="countryBacen"
                    value={getValue(formData.countryBacen)}
                    onChange={(e) => handleInputChange("countryBacen", e.target.value)}
                    placeholder="1058"
                    maxLength={10}
                  />
                </div>
              </div>
            </>
          )}

          {/* Campos para Endereço de Cobrança */}
          {formData.addressType === "Cobrança" && (
            <>
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1 space-y-2">
                  <Label htmlFor="billingZipCode">CEP de Cob.</Label>
                  <Input
                    id="billingZipCode"
                    value={getValue(formData.billingZipCode)}
                    onChange={(e) => handleInputChange("billingZipCode", e.target.value)}
                    placeholder="00000000"
                    maxLength={10}
                  />
                </div>
                <div className="col-span-3 space-y-2">
                  <Label htmlFor="billingAddress">End. Cobrança</Label>
                  <Input
                    id="billingAddress"
                    value={getValue(formData.billingAddress)}
                    onChange={(e) => handleInputChange("billingAddress", e.target.value)}
                    placeholder="Rua..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="billingNeighborhood">Bairro Cob.</Label>
                  <Input
                    id="billingNeighborhood"
                    value={getValue(formData.billingNeighborhood)}
                    onChange={(e) => handleInputChange("billingNeighborhood", e.target.value)}
                    placeholder="Centro"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingCity">Mun. Cob.</Label>
                  <Input
                    id="billingCity"
                    value={getValue(formData.billingCity)}
                    onChange={(e) => handleInputChange("billingCity", e.target.value)}
                    placeholder="São Paulo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingState">Uf de Cobrança</Label>
                  <Input
                    id="billingState"
                    value={getValue(formData.billingState)}
                    onChange={(e) => handleInputChange("billingState", e.target.value.toUpperCase())}
                    placeholder="SP"
                    maxLength={2}
                  />
                </div>
              </div>
            </>
          )}

          {/* Campos para Endereço Comercial */}
          {formData.addressType === "Comercial" && (
            <>
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1 space-y-2">
                  <Label htmlFor="zipCode">CEP</Label>
                  <Input
                    id="zipCode"
                    value={getValue(formData.zipCode)}
                    onChange={(e) => handleInputChange("zipCode", e.target.value)}
                    placeholder="00000000"
                    maxLength={10}
                  />
                </div>
                <div className="col-span-3 space-y-2">
                  <Label htmlFor="street">Endereço Comercial</Label>
                  <Input
                    id="street"
                    value={getValue(formData.street)}
                    onChange={(e) => handleInputChange("street", e.target.value)}
                    placeholder="Rua..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="streetComplement">Complemento</Label>
                  <Input
                    id="streetComplement"
                    value={getValue(formData.streetComplement)}
                    onChange={(e) => handleInputChange("streetComplement", e.target.value)}
                    placeholder="Sala 101"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={getValue(formData.neighborhood)}
                    onChange={(e) => handleInputChange("neighborhood", e.target.value)}
                    placeholder="Centro"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Município</Label>
                  <Input
                    id="city"
                    value={getValue(formData.city)}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="São Paulo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">UF</Label>
                  <Input
                    id="state"
                    value={getValue(formData.state)}
                    onChange={(e) => handleInputChange("state", e.target.value.toUpperCase())}
                    placeholder="SP"
                    maxLength={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Região</Label>
                  <Input
                    id="region"
                    value={getValue(formData.region)}
                    onChange={(e) => handleInputChange("region", e.target.value)}
                    placeholder="Sudeste"
                  />
                </div>
              </div>
            </>
          )}

          {!formData.addressType && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                Selecione um tipo de endereço para visualizar os campos
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="commercial" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salesGroup">Grp. Vendas</Label>
              <Input
                id="salesGroup"
                value={getValue(formData.salesGroup)}
                onChange={(e) => handleInputChange("salesGroup", e.target.value)}
                placeholder="Grupo A"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxGroup">Grp. Tributac</Label>
              <Input
                id="taxGroup"
                value={getValue(formData.taxGroup)}
                onChange={(e) => handleInputChange("taxGroup", e.target.value)}
                placeholder="Tributação Normal"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="commercialPartner">Parceiro Com</Label>
              <Input
                id="commercialPartner"
                value={getValue(formData.commercialPartner)}
                onChange={(e) => handleInputChange("commercialPartner", e.target.value)}
                placeholder="Parceiro"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mainSegment">Seg. Princ.</Label>
              <Input
                id="mainSegment"
                value={getValue(formData.mainSegment)}
                onChange={(e) => handleInputChange("mainSegment", e.target.value)}
                placeholder="Varejo"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="route">Rota</Label>
              <Input
                id="route"
                value={getValue(formData.route)}
                onChange={(e) => handleInputChange("route", e.target.value)}
                placeholder="Rota 01"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerNiche">Nicho Client</Label>
              <Input
                id="customerNiche"
                value={getValue(formData.customerNiche)}
                onChange={(e) => handleInputChange("customerNiche", e.target.value)}
                placeholder="Premium"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contractType">Tp. Contrato</Label>
              <Input
                id="contractType"
                value={getValue(formData.contractType)}
                onChange={(e) => handleInputChange("contractType", e.target.value)}
                placeholder="Anual"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="commissionPercentage">% Comissão</Label>
              <Input
                id="commissionPercentage"
                type="number"
                step="0.01"
                value={formData.commissionPercentage}
                onChange={(e) => handleInputChange("commissionPercentage", parseFloat(e.target.value))}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountingAccount">C. Contabil</Label>
              <Input
                id="accountingAccount"
                value={getValue(formData.accountingAccount)}
                onChange={(e) => handleInputChange("accountingAccount", e.target.value)}
                placeholder="1.1.01.001"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={() => onSave(formData)}>
          Salvar
        </Button>
      </div>
    </div>
  )
}
