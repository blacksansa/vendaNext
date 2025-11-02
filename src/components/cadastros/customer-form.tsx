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
import { Customer, CustomerAddress, CustomerContact } from "@/lib/types"
import { getContactTypes, getAddressTypes, ContactType, AddressType } from "@/services/types.service"

interface CustomerFormProps {
  customer?: Partial<Customer>
  onSave: (customer: Partial<Customer>) => void
  onCancel: () => void
}

export function CustomerForm({ customer, onSave, onCancel }: CustomerFormProps) {
  const [formData, setFormData] = useState<Partial<Customer>>(customer || {
    code: "",
    name: "",
    companyName: "",
    cnpj: "",
    document: "",
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
    const newContact = {
      type: { id: contactTypes[0]?.id || 1 },
      value: "",
      description: ""
    } as unknown as CustomerContact
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
    const newAddress = {
      type: { id: addressTypes[0]?.id || 1 },
      zipCode: "",
      address: "",
      number: "",
      neighborhood: "",
      city: "",
      state: ""
    } as unknown as CustomerAddress
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
          <TabsTrigger value="contacts">Contatos</TabsTrigger>
          <TabsTrigger value="addresses">Endereços</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleInputChange("code", e.target.value)}
                placeholder="CLI-001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="João Silva"
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
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => handleInputChange("cnpj", e.target.value)}
                placeholder="00000000000000"
                maxLength={14}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="document">CPF / RG</Label>
              <Input
                id="document"
                value={formData.document}
                onChange={(e) => handleInputChange("document", e.target.value)}
                placeholder="00000000000"
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
                      value={(contact as any).type?.id?.toString()}
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
                      value={(contact as any).value || ""}
                      onChange={(e) => updateContact(index, "value", e.target.value)}
                      placeholder="Contato"
                    />
                  </div>
                  <div className="col-span-4 space-y-2">
                    <Label>Descrição</Label>
                    <Input
                      value={(contact as any).description || ""}
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
                    value={(address as any).type?.id?.toString()}
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
                      value={(address as any).zipCode || ""}
                      onChange={(e) => updateAddress(index, "zipCode", e.target.value)}
                      placeholder="00000000"
                      maxLength={8}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Endereço</Label>
                    <Input
                      value={(address as any).address || ""}
                      onChange={(e) => updateAddress(index, "address", e.target.value)}
                      placeholder="Rua..."
                    />
                  </div>
                  <div className="col-span-1">
                    <Label>Número</Label>
                    <Input
                      value={(address as any).number || ""}
                      onChange={(e) => updateAddress(index, "number", e.target.value)}
                      placeholder="123"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Bairro</Label>
                    <Input
                      value={(address as any).neighborhood || ""}
                      onChange={(e) => updateAddress(index, "neighborhood", e.target.value)}
                      placeholder="Centro"
                    />
                  </div>
                  <div>
                    <Label>Cidade</Label>
                    <Input
                      value={(address as any).city || ""}
                      onChange={(e) => updateAddress(index, "city", e.target.value)}
                      placeholder="São Paulo"
                    />
                  </div>
                  <div>
                    <Label>UF</Label>
                    <Input
                      value={(address as any).state || ""}
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
