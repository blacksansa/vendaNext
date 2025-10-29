import Api from "@/lib/api"
import { Product } from "./product.service"

export interface PriceTagItem {
  id?: number
  product: Product | { id: number }
  basePrice?: number
  salePrice?: number
  discountPercentage?: number
}

export interface PriceTag {
  id?: number
  code: string
  name: string
  description?: string
  validFrom?: number
  validTo?: number
  items?: PriceTagItem[]
}

const priceTagApi = new Api<PriceTag, number>("/price-tag")

export const getPriceTags = (term = "", page = 0, size = 100): Promise<PriceTag[]> =>
  priceTagApi.list(page, size, term)

export const getPriceTagById = (id: number): Promise<PriceTag> =>
  priceTagApi.getById(id)

export const createPriceTag = (data: Partial<PriceTag>): Promise<PriceTag> =>
  priceTagApi.saveOrUpdate(data)

export const updatePriceTag = (id: number, data: Partial<PriceTag>): Promise<PriceTag> =>
  priceTagApi.saveOrUpdate({ ...data, id })

export const deletePriceTag = (id: number): Promise<void> =>
  priceTagApi.delete(id)
