"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2 } from "lucide-react"
import { Supplier, SupplierAddress, SupplierContact } from "@/services/supplier.service"
import { getContactTypes, getAddressTypes, ContactType, AddressType } from "@/services/types.service"

interface SupplierFormProps {
  supplier?: Partial<Supplier>
  onSave: (supplier: Partial<Supplier>) => void
  onCancel: () => void
}

export function SupplierForm({ supplier, onSave, onCancel }: SupplierFormProps) {
  const [formData, setFormData] = useState<Partial<Supplier>>(supplier || {
    code: "",
    name: "",
    companyName: "",
    tradeName: "",
    branch: "",
    store: "",
    municipalityCode: "",
    poBox: "",
    supplierType: "",
    cnpj: "",
    cnpj2: "",
    rg: "",
    document: "",
    ddd: "",
    ddi: "",
    phone: "",
    fax: "",
    stateRegistration: "",
    municipalRegistration: "",
    stateRegistration2: "",
    contactPerson: "",
    bank: "",
    agencyCode: "",
    agencyDvCnab: "",
    checkingAccount: "",
    accountDvCnab: "",
    swift: "",
    nature: "",
    transport: "",
    priority: "",
    risk: "",
    paymentCondition: "",
    creditLimit: 0,
    largestPurchase: 0,
    averageDelay: 0,
    largestBalance: 0,
    lastPurchaseDate: "",
    purchaseCount: 0,
    firstPurchaseDate: "",
    duplicatesBalance: 0,
    accountingAccount: "",
    observation: "",
    active: true,
    addresses: [],
    contacts: [],
  })

  const [contactTypes, setContactTypes] = useState<ContactType[]>([])
  const [addressTypes, setAddressTypes] = useState<AddressType[]>([])

  useEffect(() => {
    loadReferenceData()
  }, [])

  const loadReferenceData = async () => {
    try {
      const [contactTypesData, addressTypesData] = await Promise.all([
        getContactTypes(),
        getAddressTypes(),
      ])
      setContactTypes(contactTypesData)
      setAddressTypes(addressTypesData)
    } catch (error) {
      console.error("Failed to load reference data:", error)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addContact = () => {
    const newContact: SupplierContact = {
      type: { id: contactTypes[0]?.id || 1 },
      value: "",
      description: ""
    }
    setFormData(prev => ({
      ...prev,
      contacts: [...(prev.contacts || []), newContact]
    }))
  }

  const removeContact = (index: number) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts?.filter((_, i) => i !== index)
    }))
  }

  const updateContact = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts?.map((contact, i) => 
        i === index ? { ...contact, [field]: value } : contact
      )
    }))
  }

  const addAddress = () => {
    const newAddress: SupplierAddress = {
      type: { id: addressTypes[0]?.id || 1 },
      zipCode: "",
      address: "",
      number: "",
      neighborhood: "",
      city: "",
      state: ""
    }
    setFormData(prev => ({
      ...prev,
      addresses: [...(prev.addresses || []), newAddress]
    }))
  }

  const removeAddress = (index: number) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses?.filter((_, i) => i !== index)
    }))
  }

  const updateAddress = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses?.map((address, i) => 
        i === index ? { ...address, [field]: value } : address
      )
    }))
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="basic">
        <TabsList>
          <TabsTrigger value="basic">Dados Básicos</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="banking">Dados Bancários</TabsTrigger>
          <TabsTrigger value="commercial">Dados Comerciais</TabsTrigger>
          <TabsTrigger value="contacts">Contatos</TabsTrigger>
          <TabsTrigger value="addresses">Endereços</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleInputChange("code", e.target.value)}
                placeholder="FOR-001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch">Filial</Label>
              <Input
                id="branch"
                value={formData.branch}
                onChange={(e) => handleInputChange("branch", e.target.value)}
                placeholder="Filial"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store">Loja</Label>
              <Input
                id="store"
                value={formData.store}
                onChange={(e) => handleInputChange("store", e.target.value)}
                placeholder="Loja"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Razão Social</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => handleInputChange("companyName", e.target.value)}
                placeholder="Empresa XYZ Ltda"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tradeName">Nome Fantasia</Label>
              <Input
                id="tradeName"
                value={formData.tradeName}
                onChange={(e) => handleInputChange("tradeName", e.target.value)}
                placeholder="Nome Fantasia"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="João Silva"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplierType">Tipo</Label>
              <Input
                id="supplierType"
                value={formData.supplierType}
                onChange={(e) => handleInputChange("supplierType", e.target.value)}
                placeholder="Tipo do fornecedor"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contato</Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                placeholder="Nome do contato"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Região</Label>
              <Input
                id="region"
                value={formData.region}
                onChange={(e) => handleInputChange("region", e.target.value)}
                placeholder="Sul, Sudeste..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observation">Observações</Label>
            <Textarea
              id="observation"
              value={formData.observation}
              onChange={(e) => handleInputChange("observation", e.target.value)}
              placeholder="Informações adicionais..."
              rows={3}
            />
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ/CPF</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => handleInputChange("cnpj", e.target.value)}
                placeholder="00000000000000"
                maxLength={14}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnpj2">CNPJ/CPF - 2</Label>
              <Input
                id="cnpj2"
                value={formData.cnpj2}
                onChange={(e) => handleInputChange("cnpj2", e.target.value)}
                placeholder="00000000000000"
                maxLength={14}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rg">RG/Ced. Estr.</Label>
              <Input
                id="rg"
                value={formData.rg}
                onChange={(e) => handleInputChange("rg", e.target.value)}
                placeholder="RG ou Cédula Estrangeira"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="document">CPF / RG</Label>
              <Input
                id="document"
                value={formData.document}
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
                value={formData.stateRegistration}
                onChange={(e) => handleInputChange("stateRegistration", e.target.value)}
                placeholder="Inscrição Estadual"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="municipalRegistration">Ins. Municipal</Label>
              <Input
                id="municipalRegistration"
                value={formData.municipalRegistration}
                onChange={(e) => handleInputChange("municipalRegistration", e.target.value)}
                placeholder="Inscrição Municipal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stateRegistration2">Insc. Est. - 2</Label>
              <Input
                id="stateRegistration2"
                value={formData.stateRegistration2}
                onChange={(e) => handleInputChange("stateRegistration2", e.target.value)}
                placeholder="Inscrição Estadual 2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="municipalityCode">Cód. Município</Label>
              <Input
                id="municipalityCode"
                value={formData.municipalityCode}
                onChange={(e) => handleInputChange("municipalityCode", e.target.value)}
                placeholder="Código do município"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="poBox">Caixa Postal</Label>
              <Input
                id="poBox"
                value={formData.poBox}
                onChange={(e) => handleInputChange("poBox", e.target.value)}
                placeholder="Caixa Postal"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ddi">DDI</Label>
              <Input
                id="ddi"
                value={formData.ddi}
                onChange={(e) => handleInputChange("ddi", e.target.value)}
                placeholder="55"
                maxLength={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ddd">DDD</Label>
              <Input
                id="ddd"
                value={formData.ddd}
                onChange={(e) => handleInputChange("ddd", e.target.value)}
                placeholder="11"
                maxLength={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="999999999"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fax">FAX</Label>
              <Input
                id="fax"
                value={formData.fax}
                onChange={(e) => handleInputChange("fax", e.target.value)}
                placeholder="FAX"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="banking" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bank">Banco</Label>
              <Input
                id="bank"
                value={formData.bank}
                onChange={(e) => handleInputChange("bank", e.target.value)}
                placeholder="Nome do banco"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="swift">Swift</Label>
              <Input
                id="swift"
                value={formData.swift}
                onChange={(e) => handleInputChange("swift", e.target.value)}
                placeholder="Código SWIFT"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="agencyCode">Cód. Agência</Label>
              <Input
                id="agencyCode"
                value={formData.agencyCode}
                onChange={(e) => handleInputChange("agencyCode", e.target.value)}
                placeholder="Código da agência"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agencyDvCnab">DV Ag Cnab</Label>
              <Input
                id="agencyDvCnab"
                value={formData.agencyDvCnab}
                onChange={(e) => handleInputChange("agencyDvCnab", e.target.value)}
                placeholder="DV"
                maxLength={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkingAccount">Cta Corrente</Label>
              <Input
                id="checkingAccount"
                value={formData.checkingAccount}
                onChange={(e) => handleInputChange("checkingAccount", e.target.value)}
                placeholder="Conta corrente"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accountDvCnab">DV Cta Cnab</Label>
              <Input
                id="accountDvCnab"
                value={formData.accountDvCnab}
                onChange={(e) => handleInputChange("accountDvCnab", e.target.value)}
                placeholder="DV"
                maxLength={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountingAccount">C. Contábil</Label>
              <Input
                id="accountingAccount"
                value={formData.accountingAccount}
                onChange={(e) => handleInputChange("accountingAccount", e.target.value)}
                placeholder="Conta contábil"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="commercial" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nature">Natureza</Label>
              <Input
                id="nature"
                value={formData.nature}
                onChange={(e) => handleInputChange("nature", e.target.value)}
                placeholder="Natureza"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transport">Transp.</Label>
              <Input
                id="transport"
                value={formData.transport}
                onChange={(e) => handleInputChange("transport", e.target.value)}
                placeholder="Transportadora"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentCondition">Cond. Pagto</Label>
              <Input
                id="paymentCondition"
                value={formData.paymentCondition}
                onChange={(e) => handleInputChange("paymentCondition", e.target.value)}
                placeholder="Condição de pagamento"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Input
                id="priority"
                value={formData.priority}
                onChange={(e) => handleInputChange("priority", e.target.value)}
                placeholder="Prioridade"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="risk">Risco</Label>
              <Input
                id="risk"
                value={formData.risk}
                onChange={(e) => handleInputChange("risk", e.target.value)}
                placeholder="Risco"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="creditLimit">Lim. Crédito</Label>
              <Input
                id="creditLimit"
                type="number"
                step="0.01"
                value={formData.creditLimit}
                onChange={(e) => handleInputChange("creditLimit", parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="largestPurchase">Maior Compra</Label>
              <Input
                id="largestPurchase"
                type="number"
                step="0.01"
                value={formData.largestPurchase}
                onChange={(e) => handleInputChange("largestPurchase", parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="largestBalance">Maior Saldo</Label>
              <Input
                id="largestBalance"
                type="number"
                step="0.01"
                value={formData.largestBalance}
                onChange={(e) => handleInputChange("largestBalance", parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duplicatesBalance">Saldo de Duplicatas</Label>
              <Input
                id="duplicatesBalance"
                type="number"
                step="0.01"
                value={formData.duplicatesBalance}
                onChange={(e) => handleInputChange("duplicatesBalance", parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchaseCount">Nro Compras</Label>
              <Input
                id="purchaseCount"
                type="number"
                value={formData.purchaseCount}
                onChange={(e) => handleInputChange("purchaseCount", parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="averageDelay">Média Atraso</Label>
              <Input
                id="averageDelay"
                type="number"
                value={formData.averageDelay}
                onChange={(e) => handleInputChange("averageDelay", parseInt(e.target.value) || 0)}
                placeholder="Dias"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstPurchaseDate">Data da Primeira</Label>
              <Input
                id="firstPurchaseDate"
                type="date"
                value={formData.firstPurchaseDate}
                onChange={(e) => handleInputChange("firstPurchaseDate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastPurchaseDate">Últ. Compra</Label>
              <Input
                id="lastPurchaseDate"
                type="date"
                value={formData.lastPurchaseDate}
                onChange={(e) => handleInputChange("lastPurchaseDate", e.target.value)}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Contatos</h3>
            <Button type="button" size="sm" onClick={addContact}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>

          {formData.contacts?.map((contact, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-3 space-y-2">
                    <Label>Tipo</Label>
                    <Select
                      value={contact.type?.id?.toString()}
                      onValueChange={(value) => updateContact(index, "type", { id: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {contactTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-4 space-y-2">
                    <Label>Valor</Label>
                    <Input
                      value={contact.value}
                      onChange={(e) => updateContact(index, "value", e.target.value)}
                      placeholder="Contato"
                    />
                  </div>
                  <div className="col-span-4 space-y-2">
                    <Label>Descrição</Label>
                    <Input
                      value={contact.description}
                      onChange={(e) => updateContact(index, "description", e.target.value)}
                      placeholder="Comercial, etc."
                    />
                  </div>
                  <div className="col-span-1 flex items-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeContact(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {(!formData.contacts || formData.contacts.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum contato. Clique em "Adicionar".
            </p>
          )}
        </TabsContent>

        <TabsContent value="addresses" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Endereços</h3>
            <Button type="button" size="sm" onClick={addAddress}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>

          {formData.addresses?.map((address, index) => (
            <Card key={index}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between">
                  <Select
                    value={address.type?.id?.toString()}
                    onValueChange={(value) => updateAddress(index, "type", { id: parseInt(value) })}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {addressTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeAddress(index)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remover
                  </Button>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-1">
                    <Label>CEP</Label>
                    <Input
                      value={address.zipCode}
                      onChange={(e) => updateAddress(index, "zipCode", e.target.value)}
                      placeholder="00000000"
                      maxLength={8}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Endereço</Label>
                    <Input
                      value={address.address}
                      onChange={(e) => updateAddress(index, "address", e.target.value)}
                      placeholder="Rua..."
                    />
                  </div>
                  <div className="col-span-1">
                    <Label>Número</Label>
                    <Input
                      value={address.number}
                      onChange={(e) => updateAddress(index, "number", e.target.value)}
                      placeholder="123"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Bairro</Label>
                    <Input
                      value={address.neighborhood}
                      onChange={(e) => updateAddress(index, "neighborhood", e.target.value)}
                      placeholder="Centro"
                    />
                  </div>
                  <div>
                    <Label>Cidade</Label>
                    <Input
                      value={address.city}
                      onChange={(e) => updateAddress(index, "city", e.target.value)}
                      placeholder="São Paulo"
                    />
                  </div>
                  <div>
                    <Label>UF</Label>
                    <Input
                      value={address.state}
                      onChange={(e) => updateAddress(index, "state", e.target.value.toUpperCase())}
                      placeholder="SP"
                      maxLength={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {(!formData.addresses || formData.addresses.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum endereço. Clique em "Adicionar".
            </p>
          )}
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
