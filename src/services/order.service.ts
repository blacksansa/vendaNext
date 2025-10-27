import Api from "@/lib/api"

export type OrderStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "canceled"

export interface OrderItemDTO {
  productId?: number | string
  description?: string
  quantity: number
  unitPrice: number
  total: number
}

export interface OrderDTO {
  id?: number
  code?: string
  sellerId?: number | string
  teamId?: number | string | null
  managerId?: number | string | null
  approverId?: number | string | null
  status?: OrderStatus
  items?: OrderItemDTO[]
  total?: number
  notes?: string
  createdAt?: string
  approvedAt?: string | null
  rejectedReason?: string | null
}

const orderApi = new Api<OrderDTO, number>("/order")

export const listOrders = (page = 0, size = 50, term = "") =>
  orderApi.list(page, size, term)

export const getOrderById = (id: number) => orderApi.getById(id)

export const createOrder = (data: Partial<OrderDTO>) =>
  orderApi.saveOrUpdate(data)

export const updateOrder = (id: number, data: Partial<OrderDTO>) =>
  orderApi.saveOrUpdate({ ...data, id })