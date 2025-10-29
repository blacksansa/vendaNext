import Api from "@/lib/api"

export interface SupplierAddress {
  id?: number
  type: { id: number; name?: string }
  zipCode?: string
  address?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  referencePoint?: string
}

export interface SupplierContact {
  id?: number
  type: { id: number; name?: string }
  value: string
  description?: string
}

export interface Supplier {
  id?: number
  code: string
  name: string
  companyName?: string
  cnpj?: string
  document?: string
  observation?: string
  region?: string
  latitude?: number
  longitude?: number
  active?: boolean
  addresses?: SupplierAddress[]
  contacts?: SupplierContact[]
}

const supplierApi = new Api<Supplier, number>("/supplier")

export const getSuppliers = (term = "", page = 0, size = 100): Promise<Supplier[]> =>
  supplierApi.list(page, size, term)

export const getSupplierById = (id: number): Promise<Supplier> =>
  supplierApi.getById(id)

export const createSupplier = (data: Partial<Supplier>): Promise<Supplier> =>
  supplierApi.saveOrUpdate(data)

export const updateSupplier = (id: number, data: Partial<Supplier>): Promise<Supplier> =>
  supplierApi.saveOrUpdate({ ...data, id })

export const deleteSupplier = (id: number): Promise<void> =>
  supplierApi.delete(id)

export const countSuppliers = (term = ""): Promise<number> =>
  supplierApi.count(term)
