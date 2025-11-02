import Api from "@/lib/api"

export interface ProductGroup {
  id?: number
  code: string
  name: string
  
  // Identificação
  branch?: string
  groupStatus?: string
  
  // Imagem e Origem
  defaultPicture?: string
  origin?: string
  
  // Marca
  brandCode?: string
  brandDescription?: string
  
  // Relacionamentos
  relatedGroup?: string
  groupType?: string
  groupType2?: string
  tableRef?: string
  
  // Descrição
  description?: string
  
  // Chaves e Segmentos
  keyRelationTm?: string
  segment?: string
  segmentType?: string
  movementType?: string
  
  // Financeiro
  markupPercentage?: number
  marginPercentage?: number
  individualCommission?: number
  commercialCommission?: number
  toleranceDiscountIncrease?: number
  interestGl?: string
  
  // Hierarquia
  highLow?: string
  subGroup?: string
  subGroupDescription?: string
  groupClassification?: string
  
  // Produto
  productPrefix?: string
  productSequenceNumber?: number
  
  // Controles Booleanos
  aggregateChildPv?: boolean
  lackSupply?: boolean
  doNotReplenish?: boolean
  outOfLine?: boolean
  
  // Compras e Estoque
  purchaseDays?: number
  
  // QNC
  qncLevel1?: string
  qncLevel2?: string
  
  // Densidade
  commercialDensity?: number
  commercialDensity2?: number
  
  // Ordenação
  pvMixOrder?: number
  groupOrder?: number
  
  // Logs
  changeLog?: string
  
  // Fórmula
  formula?: string
  
  // Datas
  lastUpdateTime?: Date | string
  transferDate?: Date | string
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
