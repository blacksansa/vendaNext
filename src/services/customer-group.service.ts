import Api from "@/lib/api"

export interface CustomerGroup {
  id?: number
  code: string
  name: string
}

const customerGroupApi = new Api<CustomerGroup, number>("/customer-group")

export const getCustomerGroups = (term = "", page = 0, size = 100): Promise<CustomerGroup[]> =>
  customerGroupApi.list(page, size, term)

export const getCustomerGroupById = (id: number): Promise<CustomerGroup> =>
  customerGroupApi.getById(id)

export const createCustomerGroup = (data: Partial<CustomerGroup>): Promise<CustomerGroup> =>
  customerGroupApi.saveOrUpdate(data)

export const updateCustomerGroup = (id: number, data: Partial<CustomerGroup>): Promise<CustomerGroup> =>
  customerGroupApi.saveOrUpdate({ ...data, id })

export const deleteCustomerGroup = (id: number): Promise<void> =>
  customerGroupApi.delete(id)
