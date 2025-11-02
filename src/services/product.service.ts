import Api from "@/lib/api"

export interface Product {
  id?: number
  code: string
  name: string
  
  // Campos básicos
  branch?: string
  type?: string
  itemCode?: string
  measurements?: string
  productClassification?: string
  
  // Quantidade e embalagem
  packagingQuantity?: number
  packaging?: string
  
  // Campos fiscais
  ncm?: string
  tipiSpecies?: string
  exNcm?: string
  exNbm?: string
  issServiceCode?: string
  freeZoneImport?: boolean
  
  // Alíquotas
  icmsRate?: number
  ipiRate?: number
  issRate?: number
  
  // Preços e custos
  salePrice?: number
  standardCost?: number
  price?: number
  
  // Frete e franquia
  freightCategory?: string
  franchiseLine?: string
  
  // Estoque
  stockQuantity?: number
  minStock?: number
  defaultWarehouse?: string
  addressControl?: string
  tracking?: string
  outputRequest?: string
  entryRequest?: string
  securityStockFormula?: string
  
  // Estrutura
  structureBase?: string
  appropriation?: string
  
  // Padrões fiscais
  standardTs?: string
  standardTe?: string
  
  // Datas
  flRepDate?: Date | string
  lastPurchase?: Date | string
  
  // Status e controle
  blocked?: boolean
  active?: boolean
  photo?: string
  
  // Unidades de medida
  secondUnitMeasure?: string
  
  // Pesos
  netWeight?: number
  grossWeight?: number
  
  // Conversão
  conversionFactor?: number
  conversionType?: string
  alternative?: string
  
  // Outros
  orderReturn?: boolean
  complexity?: string
  supplier?: string
  
  // Relacionamentos
  unity?: { id: number; name?: string }
  group?: { id: number; name?: string }
  tags?: Array<{ id: number }>
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
