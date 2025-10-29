import Api from "@/lib/api"

export interface Product {
  id?: number
  code: string
  name: string
  ncm?: string
  unity?: { id: number; name?: string }
  group?: { id: number; name?: string }
  supplier?: string
  packaging?: string
  active?: boolean
  tags?: Array<{ id: number }>
  // Campos adicionais (podem não existir no backend ainda)
  price?: number
  stockQuantity?: number
  minStock?: number
}

const productApi = new Api<Product, number>("/product")

export const getProducts = (term = "", page = 0, size = 100): Promise<Product[]> =>
  productApi.list(page, size, term)

export const getProductById = (id: number): Promise<Product> =>
  productApi.getById(id)

export const createProduct = (data: Partial<Product>): Promise<Product> =>
  productApi.saveOrUpdate(data)

export const updateProduct = (id: number, data: Partial<Product>): Promise<Product> =>
  productApi.saveOrUpdate({ ...data, id })

export const deleteProduct = (id: number): Promise<void> =>
  productApi.delete(id)

export const countProducts = (term = ""): Promise<number> =>
  productApi.count(term)
