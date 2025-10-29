import Api, { fetchData } from "@/lib/api"
import { Task, Order, Approval, Invoice } from "@/lib/types"

const taskApi = new Api<Task, number>("/task")
const orderApi = new Api<Order, number>("/order")
const approvalApi = new Api<Approval, number>("/approval")
const invoiceApi = new Api<Invoice, number>("/invoice")

// Tasks
export const getTasks = (term = "", page = 0, size = 20): Promise<Task[]> => taskApi.list(page, size, term)
export const getMyTasks = (term = "", page = 0, size = 20): Promise<Task[]> => 
  fetchData<Task[]>(`/task/my-tasks?t=${term}&page=${page}&size=${size}`, { method: "GET" })
export const createTask = (data: Partial<Task>): Promise<Task> => taskApi.saveOrUpdate(data)
export const updateTask = (id: number, data: Partial<Task>): Promise<Task> => taskApi.patch(id, data)
export const deleteTask = (id: number): Promise<void> => taskApi.delete(id)

// Orders
export const getOrders = (term = "", page = 0, size = 20): Promise<Order[]> => orderApi.list(page, size, term)
export const getOrderById = (id: number): Promise<Order> => orderApi.getById(id)
export const createOrder = (data: Partial<Order>): Promise<Order> => orderApi.saveOrUpdate(data)
export const updateOrder = (id: number, data: Partial<Order>): Promise<Order> => orderApi.saveOrUpdate({ ...data, id })
export const deleteOrder = (id: number): Promise<void> => orderApi.delete(id)

// Approval
export const getApprovals = (term = "", page = 0, size = 20): Promise<Approval[]> => approvalApi.list(page, size, term)
export const getApprovalById = (id: number): Promise<Approval> => approvalApi.getById(id)
export const createApproval = (data: Partial<Approval>): Promise<Approval> => approvalApi.saveOrUpdate(data)
export const updateApproval = (id: number, data: Partial<Approval>): Promise<Approval> => approvalApi.saveOrUpdate({ ...data, id })
export const deleteApproval = (id: number): Promise<void> => approvalApi.delete(id)
export const approvalApprove = (id: number): Promise<void> => fetchData<void>(`/approval/${id}/approve`, { method: "POST" })
export const approvalReject = (id: number): Promise<void> => fetchData<void>(`/approval/${id}/reject`, { method: "POST" })

// Invoices
export const getInvoices = (term = "", page = 0, size = 20): Promise<Invoice[]> => invoiceApi.list(page, size, term)
export const getInvoiceById = (id: number): Promise<Invoice> => invoiceApi.getById(id)
export const createInvoice = (data: Partial<Invoice>): Promise<Invoice> => invoiceApi.saveOrUpdate(data)
export const updateInvoice = (id: number, data: Partial<Invoice>): Promise<Invoice> =>
  invoiceApi.saveOrUpdate({ ...data, id })
export const deleteInvoice = (id: number): Promise<void> => invoiceApi.delete(id)