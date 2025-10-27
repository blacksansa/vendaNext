"use client"

import { useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { listOrders, createOrder, updateOrder, OrderDTO, OrderStatus } from "@/services/order.service"
import { getTeams } from "@/services/team.service"

export interface Order extends Required<Pick<OrderDTO, "id" | "status" | "total">> {
  code?: string
  sellerId?: number | string
  teamId?: number | string | null
  managerId?: number | string | null
  approverId?: number | string | null
  items: OrderDTO["items"]
  notes?: string
  createdAt?: string
  approvedAt?: string | null
  rejectedReason?: string | null
  raw?: any
}

interface OrderState {
  isLoading: boolean
  error: string | null
  minhas: Order[]
  aprovacao: Order[]
}

function slugCode(prefix = "ord"): string {
  const ts = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0,14)
  return `${prefix}-${ts}`
}

function getTeamSellerIds(raw: any): (number | string)[] {
  if (!raw) return []
  if (Array.isArray(raw.sellerIds)) return raw.sellerIds
  if (Array.isArray(raw.sellers)) return raw.sellers.map((v: any) => (typeof v === "object" ? v.id : v))
  return []
}

class OrderModel {
  private state: OrderState = { isLoading: false, error: null, minhas: [], aprovacao: [] }
  private listeners = new Set<(s: OrderState) => void>()
  private toast: any = null

  setDeps(toast: any) { this.toast = toast }
  getState() { return { ...this.state } }
  subscribe(cb: (s: OrderState) => void) { this.listeners.add(cb); return () => this.listeners.delete(cb) }
  private setState(p: Partial<OrderState>) { this.state = { ...this.state, ...p }; this.listeners.forEach(l => l(this.getState())) }

  private isAdmin(user: any): boolean {
    const role = (user?.role || user?.userRole || user?.type || "").toString().toLowerCase()
    const groups = (user?.groups || user?.userGroups || []) as any[]
    const names = groups.map((g) => (g?.name || g?.role || g?.slug || "").toString().toLowerCase())
    return role === "admin" || role === "administrator" || names.includes("admin") || names.includes("administrator")
  }

  async carregar(userId?: number | string, isGerente?: boolean) {
    this.setState({ isLoading: true, error: null })
    try {
      const [orders] = await Promise.all([listOrders(0, 200, "")])
      const todas = (orders || []).map((o) => ({
        id: Number(o.id!),
        code: o.code,
        sellerId: o.sellerId,
        teamId: o.teamId ?? null,
        managerId: o.managerId ?? null,
        approverId: o.approverId ?? null,
        status: (o.status ?? "pending_approval") as OrderStatus,
        items: o.items ?? [],
        total: Number(o.total ?? 0),
        notes: o.notes,
        createdAt: o.createdAt,
        approvedAt: o.approvedAt ?? null,
        rejectedReason: o.rejectedReason ?? null,
        raw: o,
      })) as Order[]

      const minhas = userId ? todas.filter((o) => String(o.sellerId) === String(userId)) : []
      const aprovacao = isGerente
        ? todas.filter((o) => o.status === "pending_approval" && (o.managerId ? String(o.managerId) === String(userId) : true))
        : []

      this.setState({ isLoading: false, minhas, aprovacao })
    } catch (e: any) {
      this.setState({ isLoading: false, error: e?.message ?? String(e) })
    }
  }

  async criarOrdem(params: {
    user: any
    items: { productId?: number | string; description?: string; quantity: number; unitPrice: number }[]
    notes?: string
  }) {
    try {
      const { user, items, notes } = params
      if (!user?.id) throw new Error("Usuário não identificado")

      // Descobrir time e gerente do vendedor
      const teams = await getTeams("", 0, 200)
      const meuTime = (teams || []).find((t: any) =>
        getTeamSellerIds(t).map(String).includes(String(user.id))
      )
      const managerId = meuTime?.managerId ?? null
      const teamId = meuTime?.id ?? null

      const total = items.reduce((acc, it) => acc + Number(it.quantity * it.unitPrice), 0)
      const admin = this.isAdmin(user)

      const body: OrderDTO = {
        code: slugCode("ord"),
        sellerId: user.id,
        teamId,
        managerId,
        approverId: admin ? user.id : null,
        status: admin ? "approved" : "pending_approval",
        items: items.map((i) => ({
          productId: i.productId,
          description: i.description,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
          total: Number(i.quantity) * Number(i.unitPrice),
        })),
        total,
        notes,
        approvedAt: admin ? new Date().toISOString() : null,
      }

      const res = await createOrder(body)
      this.toast?.({ title: admin ? "Ordem aprovada" : "Ordem enviada para aprovação" })

      // Atualiza listas locais
      await this.carregar(user.id, false)
      return res
    } catch (e: any) {
      this.toast?.({ title: "Erro ao criar ordem", variant: "destructive" })
      throw e
    }
  }

  async decidirOrdem(params: {
    approver: any
    orderId: number | string
    aprovar: boolean
    motivo?: string
  }) {
    try {
      const { approver, orderId, aprovar, motivo } = params
      if (!approver?.id) throw new Error("Aprovador não identificado")
      const body: Partial<OrderDTO> = {
        approverId: approver.id,
        status: aprovar ? "approved" : "rejected",
        approvedAt: aprovar ? new Date().toISOString() : null,
        rejectedReason: aprovar ? null : (motivo ?? "Sem motivo informado"),
      }
      await updateOrder(Number(orderId), body)
      this.toast?.({ title: aprovar ? "Ordem aprovada" : "Ordem rejeitada" })
      await this.carregar(approver.id, true)
    } catch (e: any) {
      this.toast?.({ title: "Erro ao decidir ordem", variant: "destructive" })
      throw e
    }
  }
}

// Singleton + Hook
export const orderModel = new OrderModel()

export function useOrderModel(user?: any, isGerente?: boolean) {
  const qc = useQueryClient()
  const { toast } = useToast()
  const [state, setState] = useState<OrderState>(orderModel.getState())

  useEffect(() => { orderModel.setDeps(toast) }, [toast, qc])

  useEffect(() => {
    const unsub = orderModel.subscribe((s) => setState(s))
    return unsub
  }, [])

  useEffect(() => {
    orderModel.carregar(user?.id, Boolean(isGerente)).catch(console.error)
  }, [user?.id, isGerente])

  return {
    ...state,
    criarOrdem: orderModel.criarOrdem.bind(orderModel),
    decidirOrdem: orderModel.decidirOrdem.bind(orderModel),
    recarregar: orderModel.carregar.bind(orderModel),
  }
}