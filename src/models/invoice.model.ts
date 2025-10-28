import type {
  InvoiceDTO,
  InvoiceItemDTO as ServiceInvoiceItemDTO,
} from "@/services/invoice.service"
import {
  listInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
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
  date?: string
  total?: number
  status: InvoiceStatusUI
  items: InvoiceItemUI[]
  notes?: string
  history: InvoiceHistoryUI[]
  approverIds?: number[] | null
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

    return {
      id: String(inv.id ?? inv.code ?? Math.random().toString(36).slice(2, 9)),
      code: inv.code,
      customer: inv.customerName ?? inv.customerName ?? inv.customerId ? String(inv.customerId) : undefined,
      seller: inv.sellerName ?? (inv as any).seller ?? undefined,
      date: inv.createdAt ?? inv.invoiceDate ?? undefined,
      total: Number(inv.total ?? 0),
      status: this.mapStatus(inv.status),
      items,
      notes: inv.notes ?? undefined,
      history,
      approverIds: Array.isArray(inv.approverIds) ? inv.approverIds : inv.approverId ? [Number(inv.approverId)] : undefined,
      raw: inv,
    }
  }

  // map UI -> payload for create/update
  mapUiToPayload(ui: Partial<InvoiceUI>): Partial<InvoiceDTO> {
    const payload: Partial<InvoiceDTO> = {}
    if (ui.code !== undefined) payload.code = ui.code
    if (ui.notes !== undefined) payload.notes = ui.notes
    if (ui.total !== undefined) payload.total = ui.total
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
    if (ui.approverIds !== undefined) {
      // backend may accept approverIds or approverId; prefer approverIds if supported
      ;(payload as any).approverIds = ui.approverIds
      if (!Array.isArray(ui.approverIds) || ui.approverIds.length === 0) {
        // nothing
      } else {
        // keep single approver for legacy endpoints
        payload.approverId = ui.approverIds[0]
      }
    }
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

  async approve(id: string | number, approverId?: number) {
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