"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SellerDTO } from "@/services/seller.service"
import { UserDTO, getUsers } from "@/services/user.service"

interface SellerFormProps {
  seller?: Partial<SellerDTO>
  onSave: (seller: Partial<SellerDTO>) => void
  onCancel: () => void
}

export function SellerForm({ seller, onSave, onCancel }: SellerFormProps) {
  const [formData, setFormData] = useState<Partial<SellerDTO>>({
    code: "",
    name: "",
    nickname: "",
    userId: "",
    commissionPercentage: 0,
  })
  const [users, setUsers] = useState<UserDTO[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  useEffect(() => {
    if (seller) {
      setFormData({
        id: seller.id,
        code: seller.code || "",
        name: seller.name || "",
        nickname: seller.nickname || "",
        userId: seller.userId || seller.user?.id || "",
        commissionPercentage: seller.commissionPercentage || 0,
      })
    }
  }, [seller])

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true)
      try {
        const data = await getUsers("", 0, 200)
        setUsers(data)
      } catch (error) {
        console.error("Error loading users:", error)
      } finally {
        setLoadingUsers(false)
      }
    }
    fetchUsers()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[SellerForm] submetendo seller:", formData)
    onSave(formData)
  }

  const handleChange = (field: keyof SellerDTO, value: any) => {
    console.log("[SellerForm] campo alterado:", field, "=", value)
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="code">Código *</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => handleChange("code", e.target.value)}
            placeholder="Código do vendedor"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Nome *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Nome do vendedor"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nickname">Apelido</Label>
          <Input
            id="nickname"
            value={formData.nickname}
            onChange={(e) => handleChange("nickname", e.target.value)}
            placeholder="Apelido"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="user">Usuário *</Label>
          <Select
            value={formData.userId || ""}
            onValueChange={(value) => handleChange("userId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={loadingUsers ? "Carregando..." : "Selecione um usuário"} />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={String(user.id)}>
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.email || String(user.id)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="commission">Comissão (%)</Label>
          <Input
            id="commission"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={formData.commissionPercentage || 0}
            onChange={(e) => handleChange("commissionPercentage", parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  )
}
