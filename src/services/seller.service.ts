import Api from "@/lib/api"

export interface SellerDTO {
  id: number | string
  name?: string
  salesAmount?: number
  active?: boolean
  email?: string
}

const sellerApi = new Api<SellerDTO, number | string>("/seller")

export const getSellers = (term = "", page = 0, size = 100): Promise<SellerDTO[]> =>
  sellerApi.list(page, size, term)

export const getSellerById = (id: number | string): Promise<SellerDTO> =>
  sellerApi.getById(id)

export const createSeller = (data: Partial<SellerDTO>): Promise<SellerDTO> =>
  sellerApi.saveOrUpdate(data)

export const updateSeller = (id: number | string, data: Partial<SellerDTO>): Promise<SellerDTO> =>
  sellerApi.saveOrUpdate({ ...data, id })

export const deleteSeller = (id: number | string): Promise<void> =>
  sellerApi.delete(id)