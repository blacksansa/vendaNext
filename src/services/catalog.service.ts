import Api from "@/lib/api"
import {
  CustomerGroup, LossReason, PaymentCondition, PaymentType, PriceTag, ProductGroup, ProductTag,
  ReceivableHolder, ReceivableStatus, ReceivableType, Unit,
} from "@/lib/types"

const customerGroupApi = new Api<CustomerGroup, number>("/customer-group")
const lossReasonApi = new Api<LossReason, number>("/loss-reason")
const paymentConditionApi = new Api<PaymentCondition, number>("/payment-condition")
const paymentTypeApi = new Api<PaymentType, number>("/payment-type")
const priceTagApi = new Api<PriceTag, number>("/price-tag")
const productGroupApi = new Api<ProductGroup, number>("/product-group")
const productTagApi = new Api<ProductTag, number>("/product-tag")
const receivableHolderApi = new Api<ReceivableHolder, number>("/receivable-holder")
const receivableStatusApi = new Api<ReceivableStatus, number>("/receivable-status")
const receivableTypeApi = new Api<ReceivableType, number>("/receivable-type")
const unitApi = new Api<Unit, number>("/unit")

export const getCustomerGroups = (t = "", p = 0, s = 20): Promise<CustomerGroup[]> => customerGroupApi.list(p, s, t)
export const createCustomerGroup = (d: Partial<CustomerGroup>) => customerGroupApi.saveOrUpdate(d)
export const updateCustomerGroup = (id: number, d: Partial<CustomerGroup>) => customerGroupApi.saveOrUpdate({ ...d, id })
export const deleteCustomerGroup = (id: number) => customerGroupApi.delete(id)

export const getLossReasons = (t = "", p = 0, s = 20): Promise<LossReason[]> => lossReasonApi.list(p, s, t)
export const createLossReason = (d: Partial<LossReason>) => lossReasonApi.saveOrUpdate(d)
export const updateLossReason = (id: number, d: Partial<LossReason>) => lossReasonApi.saveOrUpdate({ ...d, id })
export const deleteLossReason = (id: number) => lossReasonApi.delete(id)

export const getPaymentConditions = (t = "", p = 0, s = 20): Promise<PaymentCondition[]> => paymentConditionApi.list(p, s, t)
export const createPaymentCondition = (d: Partial<PaymentCondition>) => paymentConditionApi.saveOrUpdate(d)
export const updatePaymentCondition = (id: number, d: Partial<PaymentCondition>) => paymentConditionApi.saveOrUpdate({ ...d, id })
export const deletePaymentCondition = (id: number) => paymentConditionApi.delete(id)

export const getPaymentTypes = (t = "", p = 0, s = 20): Promise<PaymentType[]> => paymentTypeApi.list(p, s, t)
export const createPaymentType = (d: Partial<PaymentType>) => paymentTypeApi.saveOrUpdate(d)
export const updatePaymentType = (id: number, d: Partial<PaymentType>) => paymentTypeApi.saveOrUpdate({ ...d, id })
export const deletePaymentType = (id: number) => paymentTypeApi.delete(id)

export const getPriceTags = (t = "", p = 0, s = 20): Promise<PriceTag[]> => priceTagApi.list(p, s, t)
export const createPriceTag = (d: Partial<PriceTag>) => priceTagApi.saveOrUpdate(d)
export const updatePriceTag = (id: number, d: Partial<PriceTag>) => priceTagApi.saveOrUpdate({ ...d, id })
export const deletePriceTag = (id: number) => priceTagApi.delete(id)

export const getProductGroups = (t = "", p = 0, s = 20): Promise<ProductGroup[]> => productGroupApi.list(p, s, t)
export const createProductGroup = (d: Partial<ProductGroup>) => productGroupApi.saveOrUpdate(d)
export const updateProductGroup = (id: number, d: Partial<ProductGroup>) => productGroupApi.saveOrUpdate({ ...d, id })
export const deleteProductGroup = (id: number) => productGroupApi.delete(id)

export const getProductTags = (t = "", p = 0, s = 20): Promise<ProductTag[]> => productTagApi.list(p, s, t)
export const createProductTag = (d: Partial<ProductTag>) => productTagApi.saveOrUpdate(d)
export const updateProductTag = (id: number, d: Partial<ProductTag>) => productTagApi.saveOrUpdate({ ...d, id })
export const deleteProductTag = (id: number) => productTagApi.delete(id)

export const getReceivableHolders = (t = "", p = 0, s = 20): Promise<ReceivableHolder[]> => receivableHolderApi.list(p, s, t)
export const getReceivableStatuses = (t = "", p = 0, s = 20): Promise<ReceivableStatus[]> => receivableStatusApi.list(p, s, t)
export const getReceivableTypes = (t = "", p = 0, s = 20): Promise<ReceivableType[]> => receivableTypeApi.list(p, s, t)

export const getUnits = (t = "", p = 0, s = 20): Promise<Unit[]> => unitApi.list(p, s, t)
export const getUnitById = (id: number): Promise<Unit> => unitApi.getById(id)
export const createUnit = (d: Partial<Unit>): Promise<Unit> => unitApi.saveOrUpdate(d)
export const updateUnit = (id: number, d: Partial<Unit>): Promise<Unit> => unitApi.saveOrUpdate({ ...d, id })
export const deleteUnit = (id: number): Promise<void> => unitApi.delete(id)