import type {
  InvoiceDTO,
  InvoiceItemDTO as ServiceInvoiceItemDTO,
} from "@/services/invoice.service"
import {
  listInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  approveInvoice,
  getApprovers,
  invoicesAnalytics,
} from "@/services/invoice.service"

/** UI-facing item/history types */
export interface InvoiceItemUI {
  id: string
  productId?: string | number
  description?: string
  quantity: number
  unitPrice: number
  total: number
}

export interface InvoiceHistoryUI {
  id: string
  action?: string
  user?: string
  date?: string
  description?: string
}

/** UI invoice shape */
export type InvoiceStatusUI = "em_aberto" | "aprovada" | "faturada" | "cancelada"

export interface InvoiceUI {
  id: string
  code?: string
  customer?: string
  seller?: string
  sellerId?: number | string
  date?: string
  total?: number
  status: InvoiceStatusUI
  items: InvoiceItemUI[]
  notes?: string
  history: InvoiceHistoryUI[]
  approverIds?: string[] | null // manager IDs (strings)
  raw?: InvoiceDTO
}

/** InvoiceModel: mapping + helpers */
export class InvoiceModel {
  private cache: InvoiceUI[] | null = null

  // map backend status to UI status
  private mapStatus(status?: string): InvoiceStatusUI {
    const s = (status ?? "").toString().toLowerCase()
    if (s.includes("fatur") || s.includes("paid")) return "faturada"
    if (s.includes("aprov") || s.includes("issued") || s.includes("approved")) return "aprovada"
    if (s.includes("cancel")) return "cancelada"
    return "em_aberto"
  }

  // map single InvoiceDTO -> InvoiceUI
  mapDtoToUi(inv: InvoiceDTO): InvoiceUI {
    console.log("[InvoiceModel] mapDtoToUi - invoice recebida:", {
      id: inv.id,
      approverId: inv.approverId,
      approverIds: (inv as any).approverIds,
      status: inv.status
    })
    
    const items = (inv.items ?? []).map((it: ServiceInvoiceItemDTO | any, idx) => ({
      id: String(it?.id ?? idx + 1),
      productId: it?.productId,
      description: it?.description ?? it?.name,
      quantity: Number(it?.quantity ?? 1),
      unitPrice: Number(it?.unitPrice ?? it?.price ?? 0),
      total: Number(it?.total ?? (it?.quantity ?? 1) * (it?.unitPrice ?? it?.price ?? 0)),
    }))

    const history = (inv.history ?? []).map((h: any, idx: number) => ({
      id: String(h?.id ?? idx + 1),
      action: h?.action ?? h?.status ?? "",
      user: h?.user ?? h?.by ?? "",
      date: h?.date ?? h?.createdAt ?? "",
      description: h?.description ?? "",
    }))

    // Sempre retornar approverId como array para compatibilidade
    const approverIds = (inv as any).approverIds
      ? (inv as any).approverIds
      : inv.approverId 
      ? [String(inv.approverId)] 
      : undefined
    
    console.log("[InvoiceModel] approverIds final:", approverIds)

    return {
      id: String(inv.id ?? inv.code ?? Math.random().toString(36).slice(2, 9)),
      code: inv.code,
      customer: inv.customerName ?? inv.customerName ?? inv.customerId ? String(inv.customerId) : undefined,
      seller: inv.sellerName ?? (inv as any).seller ?? undefined,
      sellerId: inv.sellerId,
      date: inv.createdAt ?? inv.invoiceDate ?? undefined,
      total: Number(inv.total ?? inv.netAmount ?? 0),
      status: this.mapStatus(inv.status),
      items,
      notes: inv.notes ?? undefined,
      history,
      approverIds,
      raw: inv,
    }
  }

  // map UI -> payload for create/update
  mapUiToPayload(ui: Partial<InvoiceUI>): Partial<InvoiceDTO> {
    console.log("[InvoiceModel] mapUiToPayload input:", ui)
    
    const payload: Partial<InvoiceDTO> = {}
    if (ui.code !== undefined) payload.code = ui.code
    if (ui.notes !== undefined) payload.notes = ui.notes
    if (ui.total !== undefined) {
      payload.total = ui.total
      payload.netAmount = ui.total // backend usa netAmount como valor principal
    }
    if (ui.customer !== undefined) payload.customerName = ui.customer
    if (ui.seller !== undefined) payload.sellerName = ui.seller
    if (ui.sellerId !== undefined) payload.sellerId = Number(ui.sellerId)
    if (ui.date !== undefined) payload.issuanceDate = ui.date
    
    // map items
    if (ui.items) {
      payload.items = ui.items.map((it) => ({
        productId: it.productId,
        description: it.description,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        total: it.total,
      }))
    }
    // status mapping (UI -> backend)
    if (ui.status) {
      if (ui.status === "faturada") payload.status = "FATURADA"
      else if (ui.status === "aprovada") payload.status = "ISSUED"
      else if (ui.status === "cancelada") payload.status = "CANCELLED"
      else payload.status = "DRAFT"
    }
    // approver handling: backend usa approverId (singular)
    if (ui.approverIds !== undefined) {
      console.log("[InvoiceModel] approverIds recebido:", ui.approverIds)
      if (Array.isArray(ui.approverIds) && ui.approverIds.length > 0) {
        payload.approverId = ui.approverIds[0] // backend aceita apenas um approverId
        console.log("[InvoiceModel] approverId setado:", payload.approverId)
      } else {
        payload.approverId = null
        console.log("[InvoiceModel] approverId null - array vazio ou não é array")
      }
    } else {
      console.log("[InvoiceModel] approverIds é undefined, não será enviado")
    }
    
    console.log("[InvoiceModel] payload final:", payload)
    return payload
  }

  // list invoices (with mapping)
  async list(page = 0, size = 50, term = ""): Promise<InvoiceUI[]> {
    const invoices = await listInvoices(page, size, term)
    if (!Array.isArray(invoices)) {
      this.cache = []
      return []
    }
    const mapped = invoices.map((inv) => this.mapDtoToUi(inv))
    this.cache = mapped
    return mapped
  }

  // get single invoice (tries cache first)
  async get(id: string | number): Promise<InvoiceUI | null> {
    const idStr = String(id)
    const fromCache = this.cache?.find((x) => x.id === idStr)
    if (fromCache) return fromCache
    try {
      const dto = await getInvoiceById(Number(id))
      if (!dto) return null
      const ui = this.mapDtoToUi(dto)
      // keep cache
      this.cache = this.cache ?? []
      this.cache = [ui, ...this.cache.filter((c) => c.id !== ui.id)]
      return ui
    } catch (e) {
      return null
    }
  }

  async create(ui: Partial<InvoiceUI>) {
    const payload = this.mapUiToPayload(ui)
    return createInvoice(payload)
  }

  async update(id: string | number, partialUi: Partial<InvoiceUI>) {
    const payload = this.mapUiToPayload(partialUi)
    return updateInvoice(Number(id), payload)
  }

  async approve(id: string | number, approverId?: string) {
    // try dedicated approve endpoint first
    try {
      return await approveInvoice(Number(id), approverId)
    } catch (e) {
      // fallback to update
      const payload: Partial<InvoiceDTO> = { status: "ISSUED" }
      if (approverId !== undefined) {
        ;(payload as any).approverId = approverId
      }
      return updateInvoice(Number(id), payload)
    }
  }

  async delete(id: string | number) {
    console.log('[InvoiceModel] deletando invoice:', id)
    try {
      await deleteInvoice(Number(id))
      console.log('[InvoiceModel] invoice deletada com sucesso')
      return true
    } catch (e) {
      console.error('[InvoiceModel] delete failed:', e)
      throw e
    }
  }

  async approvers(id: string | number) {
    return getApprovers(Number(id))
  }

  async analytics(from?: string, to?: string) {
    return invoicesAnalytics(from, to)
  }

  clearCache() {
    this.cache = null
  }
}

export const invoiceModel = new InvoiceModel()
export default invoiceModel