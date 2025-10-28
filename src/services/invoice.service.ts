import Api from "@/lib/api"

/**
 * Tipos públicos do service (ajuste conforme o DTO real do backend)
 */
export interface InvoiceItemDTO {
  id?: number
  productId?: number | string
  description?: string
  quantity?: number
  unitPrice?: number
  total?: number
}

export interface InvoiceHistoryDTO {
  id?: number
  action?: string
  user?: string
  date?: string
  description?: string
}

export interface InvoiceDTO {
  id?: number
  code?: string
  status?: string
  documentType?: string
  sellerId?: number
  sellerName?: string
  customerId?: number
  customerName?: string
  createdAt?: string
  invoiceDate?: string
  dueDate?: string
  currency?: string
  subtotal?: number
  taxTotal?: number
  total?: number
  items?: InvoiceItemDTO[]
  notes?: string
  history?: InvoiceHistoryDTO[]
  approverId?: string | null // managerId do grupo ou admin
  approverIds?: string[] // múltiplos aprovadores (se suportado)
  approvedAt?: string | null
  teamId?: number | null
  externalReference?: string | null
}

/**
 * Instância do Api wrapper apontando para /invoice (backend já existente)
 */
const invoiceApi = new Api<InvoiceDTO, number>("/invoice")

/**
 * List invoices (pageable)
 */
export const listInvoices = (page = 0, size = 50, term = "") =>
  invoiceApi.list(page, size, term)

/**
 * Get single invoice by id
 */
export const getInvoiceById = (id: number) => invoiceApi.getById(id)

/**
 * Create invoice (backend save/update pattern handled by Api.saveOrUpdate)
 */
export const createInvoice = (payload: Partial<InvoiceDTO>) =>
  invoiceApi.saveOrUpdate(payload)

/**
 * Update invoice (uses saveOrUpdate with id)
 */
export const updateInvoice = (id: number | string, payload: Partial<InvoiceDTO>) =>
  invoiceApi.saveOrUpdate({ ...payload, id })

/**
 * Approve invoice.
 * Preferred approach: update status/approver via saveOrUpdate.
 * If you have a dedicated approve endpoint (/invoice/{id}/approve) you can call it instead.
 */
export const approveInvoice = async (id: number | string, approverId?: string) => {
  // Try to mark approved via update payload (backend should accept status + approverId)
  const payload: Partial<InvoiceDTO> = {
    status: "ISSUED", // ajustar conforme valor real do backend (ex.: "APPROVED"/"FATURADA")
  }
  if (approverId !== undefined) payload.approverId = approverId
  return updateInvoice(Number(id), payload)
}

/**
 * Get possible approvers for an invoice (optional endpoint).
 * If your backend exposes GET /api/invoice/{id}/approvers, this will work.
 * Otherwise adapt to your user service.
 */
export const getApprovers = async (id: number | string): Promise<any[]> => {
  try {
    const res = await fetch(`/api/invoice/${id}/approvers`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
    if (!res.ok) {
      // fallback to empty
      return []
    }
    return await res.json()
  } catch (e) {
    return []
  }
}

/**
 * Basic analytics helper (delegates to invoice resource if present)
 * Example: GET /api/invoice/analytics?s=from&t=to
 */
export const invoicesAnalytics = async (from?: string, to?: string): Promise<any> => {
  try {
    const qs = new URLSearchParams()
    if (from) qs.set("from", from)
    if (to) qs.set("to", to)
    const res = await fetch(`/api/invoice/analytics?${qs.toString()}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
    if (!res.ok) throw new Error(`status ${res.status}`)
    return await res.json()
  } catch (e) {
    return null
  }
}

export default {
  listInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  approveInvoice,
  getApprovers,
  invoicesAnalytics,
}