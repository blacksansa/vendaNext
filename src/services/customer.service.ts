import Api, { fetchData } from "@/lib/api"
import {
  Customer, CustomerListItem, AiCustomerCentral, Receivable, InvoiceItem, CustomerReceivableSums,
} from "@/lib/types"

class CustomerApi extends Api<Customer, number> {
  constructor() { super("/customer") }

  receivableSums(id: number, startDate?: Date, endDate?: Date) {
    const params = { s: startDate?.getTime(), e: endDate?.getTime() }
    return fetchData<CustomerReceivableSums>(`/customer/${id}/receivable/sums`, { params })
  }

  receivableCount(id: number, term = "", startDate?: Date, endDate?: Date) {
    const params = { t: term, s: startDate?.getTime(), e: endDate?.getTime() }
    return fetchData<number>(`/customer/${id}/receivable/count`, { params })
  }

  receivableList(id: number, page = 0, size = 20, term = "", startDate?: Date, endDate?: Date) {
    const params = { page, size, t: term, s: startDate?.getTime(), e: endDate?.getTime() }
    return fetchData<Receivable[]>(`/customer/${id}/receivable`, { params })
  }

  invoiceItemCount(id: number, term = "", startDate?: Date, endDate?: Date) {
    const params = { t: term, s: startDate?.getTime(), e: endDate?.getTime() }
    return fetchData<number>(`/customer/${id}/invoice-item/count`, { params })
  }

  invoiceItemList(id: number, page = 0, size = 20, term = "", startDate?: Date, endDate?: Date) {
    const params = { page, size, t: term, s: startDate?.getTime(), e: endDate?.getTime() }
    return fetchData<InvoiceItem[]>(`/customer/${id}/invoice-item`, { params })
  }

  aiCustomerCentralLast(id: number) {
    return fetchData<AiCustomerCentral>(`/customer/${id}/ai-customer-central/last`)
  }

  aiCustomerCentralCreate(id: number) {
    return fetchData<AiCustomerCentral>(`/customer/${id}/ai-customer-central`, { method: "POST" })
  }
}

const api = new CustomerApi()

export const getCustomers = (term = "", page = 0, size = 20): Promise<CustomerListItem[]> =>
  api.list(page, size, term) as Promise<CustomerListItem[]>
export const getCustomerById = (id: number): Promise<Customer> => api.getById(id)
export const createCustomer = (data: Partial<Customer>): Promise<Customer> => api.saveOrUpdate(data)
export const updateCustomer = (id: number, data: Partial<Customer>): Promise<Customer> =>
  api.saveOrUpdate({ ...data, id })
export const deleteCustomer = (id: number): Promise<void> => api.delete(id)

export const getCustomerReceivableSums = api.receivableSums.bind(api)
export const getCustomerReceivableCount = api.receivableCount.bind(api)
export const getCustomerReceivableList = api.receivableList.bind(api)
export const getCustomerInvoiceItemCount = api.invoiceItemCount.bind(api)
export const getCustomerInvoiceItemList = api.invoiceItemList.bind(api)
export const getAiCustomerCentralLast = api.aiCustomerCentralLast.bind(api)
export const createAiCustomerCentral = api.aiCustomerCentralCreate.bind(api)