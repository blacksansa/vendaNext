import Api from "@/lib/api"

export interface ProductGroup {
  id?: number
  code: string
  name: string
}

const productGroupApi = new Api<ProductGroup, number>("/product-group")

export const getProductGroups = (term = "", page = 0, size = 100): Promise<ProductGroup[]> =>
  productGroupApi.list(page, size, term)

export const getProductGroupById = (id: number): Promise<ProductGroup> =>
  productGroupApi.getById(id)

export const createProductGroup = (data: Partial<ProductGroup>): Promise<ProductGroup> =>
  productGroupApi.saveOrUpdate(data)

export const updateProductGroup = (id: number, data: Partial<ProductGroup>): Promise<ProductGroup> =>
  productGroupApi.saveOrUpdate({ ...data, id })

export const deleteProductGroup = (id: number): Promise<void> =>
  productGroupApi.delete(id)
