// filepath: /home/brunodxd/repo/venda+/venda-next-front/src/lib/api.client.generated.ts
/**
 * ESTE ARQUIVO FOI GERADO AUTOMATICAMENTE
 * Não edite manualmente - use api-generator.ts para regenerar
 * Data: 2025-10-23T10:59:29.256Z
 */

import Api, { fetchData } from "./api";
import {
  Order,
  Opportunity,
  Pipeline,
  Stage,
  Task,
  Team,
  Seller,
  Campaign,
  Receivable,
  Approval,
  Invoice,
  AddressType,
  ContactType,
  CustomerGroup,
  CustomerTag,
  LossReason,
  PaymentCondition,
  PaymentType,
  PriceTag,
  ProductGroup,
  ProductTag,
  ReceivableHolder,
  ReceivableStatus,
  ReceivableType,
  Unit,
} from "./types";

// --- Orders (Order) ---
const orderApi = new Api<Order, number>('/order');

export const getOrders = (term: string = "", page: number = 0, size: number = 20): Promise<Order[]> =>
  orderApi.list(page, size, term);

export const getOrderById = (id: number): Promise<Order> =>
  orderApi.getById(id);

export const createOrder = (data: Partial<Order>): Promise<Order> =>
  orderApi.saveOrUpdate(data);

export const updateOrder = (id: number, data: Partial<Order>): Promise<Order> =>
  orderApi.saveOrUpdate({ ...data, id });

export const deleteOrder = (id: number): Promise<void> =>
  orderApi.delete(id);


// --- Opportunitys (Opportunity) ---
const opportunityApi = new Api<Opportunity, number>('/opportunity');

export const getOpportunitys = (term: string = "", page: number = 0, size: number = 20): Promise<Opportunity[]> =>
  opportunityApi.list(page, size, term);

export const getOpportunityById = (id: number): Promise<Opportunity> =>
  opportunityApi.getById(id);

export const createOpportunity = (data: Partial<Opportunity>): Promise<Opportunity> =>
  opportunityApi.saveOrUpdate(data);

export const updateOpportunity = (id: number, data: Partial<Opportunity>): Promise<Opportunity> =>
  opportunityApi.saveOrUpdate({ ...data, id });

export const deleteOpportunity = (id: number): Promise<void> =>
  opportunityApi.delete(id);


// --- Pipelines (Pipeline) ---
const pipelineApi = new Api<Pipeline, number>('/pipeline');

export const getPipelines = (term: string = "", page: number = 0, size: number = 20): Promise<Pipeline[]> =>
  pipelineApi.list(page, size, term);

export const getPipelineById = (id: number): Promise<Pipeline> =>
  pipelineApi.getById(id);

export const createPipeline = (data: Partial<Pipeline>): Promise<Pipeline> =>
  pipelineApi.saveOrUpdate(data);

export const updatePipeline = (id: number, data: Partial<Pipeline>): Promise<Pipeline> =>
  pipelineApi.saveOrUpdate({ ...data, id });

export const deletePipeline = (id: number): Promise<void> =>
  pipelineApi.delete(id);


// --- Stages (Stage) ---
const stageApi = new Api<Stage, number>('/stage');

export const getStages = (term: string = "", page: number = 0, size: number = 20): Promise<Stage[]> =>
  stageApi.list(page, size, term);

export const getStageById = (id: number): Promise<Stage> =>
  stageApi.getById(id);

export const createStage = (data: Partial<Stage>): Promise<Stage> =>
  stageApi.saveOrUpdate(data);

export const updateStage = (id: number, data: Partial<Stage>): Promise<Stage> =>
  stageApi.saveOrUpdate({ ...data, id });

export const deleteStage = (id: number): Promise<void> =>
  stageApi.delete(id);


// --- Tasks (Task) ---
const taskApi = new Api<Task, number>('/task');

export const getTasks = (term: string = "", page: number = 0, size: number = 20): Promise<Task[]> =>
  taskApi.list(page, size, term);

export const getTaskById = (id: number): Promise<Task> =>
  taskApi.getById(id);

export const createTask = (data: Partial<Task>): Promise<Task> =>
  taskApi.saveOrUpdate(data);

export const updateTask = (id: number, data: Partial<Task>): Promise<Task> =>
  taskApi.saveOrUpdate({ ...data, id });

export const deleteTask = (id: number): Promise<void> =>
  taskApi.delete(id);


// --- Teams (Team) ---
const teamApi = new Api<Team, number>('/team');

export const getTeams = (term: string = "", page: number = 0, size: number = 20): Promise<Team[]> =>
  teamApi.list(page, size, term);

export const getTeamById = (id: number): Promise<Team> =>
  teamApi.getById(id);

export const createTeam = (data: Partial<Team>): Promise<Team> =>
  teamApi.saveOrUpdate(data);

export const updateTeam = (id: number, data: Partial<Team>): Promise<Team> =>
  teamApi.saveOrUpdate({ ...data, id });

export const deleteTeam = (id: number): Promise<void> =>
  teamApi.delete(id);


// --- Sellers (Seller) ---
const sellerApi = new Api<Seller, number>('/seller');

export const getSellers = (term: string = "", page: number = 0, size: number = 20): Promise<Seller[]> =>
  sellerApi.list(page, size, term);

export const getSellerById = (id: number): Promise<Seller> =>
  sellerApi.getById(id);

export const createSeller = (data: Partial<Seller>): Promise<Seller> =>
  sellerApi.saveOrUpdate(data);

export const updateSeller = (id: number, data: Partial<Seller>): Promise<Seller> =>
  sellerApi.saveOrUpdate({ ...data, id });

export const deleteSeller = (id: number): Promise<void> =>
  sellerApi.delete(id);


// --- Campaigns (Campaign) ---
const campaignApi = new Api<Campaign, number>('/campaign');

export const getCampaigns = (term: string = "", page: number = 0, size: number = 20): Promise<Campaign[]> =>
  campaignApi.list(page, size, term);

export const getCampaignById = (id: number): Promise<Campaign> =>
  campaignApi.getById(id);

export const createCampaign = (data: Partial<Campaign>): Promise<Campaign> =>
  campaignApi.saveOrUpdate(data);

export const updateCampaign = (id: number, data: Partial<Campaign>): Promise<Campaign> =>
  campaignApi.saveOrUpdate({ ...data, id });

export const deleteCampaign = (id: number): Promise<void> =>
  campaignApi.delete(id);


// --- Receivables (Receivable) ---
const receivableApi = new Api<Receivable, number>('/receivable');

export const getReceivables = (term: string = "", page: number = 0, size: number = 20): Promise<Receivable[]> =>
  receivableApi.list(page, size, term);

export const getReceivableById = (id: number): Promise<Receivable> =>
  receivableApi.getById(id);

export const createReceivable = (data: Partial<Receivable>): Promise<Receivable> =>
  receivableApi.saveOrUpdate(data);

export const updateReceivable = (id: number, data: Partial<Receivable>): Promise<Receivable> =>
  receivableApi.saveOrUpdate({ ...data, id });

export const deleteReceivable = (id: number): Promise<void> =>
  receivableApi.delete(id);


// --- Approvals (Approval) ---
const approvalApi = new Api<Approval, number>('/approval');

export const getApprovals = (term: string = "", page: number = 0, size: number = 20): Promise<Approval[]> =>
  approvalApi.list(page, size, term);

export const getApprovalById = (id: number): Promise<Approval> =>
  approvalApi.getById(id);

export const createApproval = (data: Partial<Approval>): Promise<Approval> =>
  approvalApi.saveOrUpdate(data);

export const updateApproval = (id: number, data: Partial<Approval>): Promise<Approval> =>
  approvalApi.saveOrUpdate({ ...data, id });

export const deleteApproval = (id: number): Promise<void> =>
  approvalApi.delete(id);

export const approvalApprove = (id: number): Promise<void> =>
  fetchData<void>(`/approval/${id}/approve`, { method: "POST" });

export const approvalReject = (id: number): Promise<void> =>
  fetchData<void>(`/approval/${id}/reject`, { method: "POST" });


// --- Invoices (Invoice) ---
const invoiceApi = new Api<Invoice, number>('/invoice');

export const getInvoices = (term: string = "", page: number = 0, size: number = 20): Promise<Invoice[]> =>
  invoiceApi.list(page, size, term);

export const getInvoiceById = (id: number): Promise<Invoice> =>
  invoiceApi.getById(id);

export const createInvoice = (data: Partial<Invoice>): Promise<Invoice> =>
  invoiceApi.saveOrUpdate(data);

export const updateInvoice = (id: number, data: Partial<Invoice>): Promise<Invoice> =>
  invoiceApi.saveOrUpdate({ ...data, id });

export const deleteInvoice = (id: number): Promise<void> =>
  invoiceApi.delete(id);


// --- AddressTypes (AddressType) ---
const addresstypeApi = new Api<AddressType, number>('/address-type');

export const getAddressTypes = (term: string = "", page: number = 0, size: number = 20): Promise<AddressType[]> =>
  addresstypeApi.list(page, size, term);

export const getAddressTypeById = (id: number): Promise<AddressType> =>
  addresstypeApi.getById(id);

export const createAddressType = (data: Partial<AddressType>): Promise<AddressType> =>
  addresstypeApi.saveOrUpdate(data);

export const updateAddressType = (id: number, data: Partial<AddressType>): Promise<AddressType> =>
  addresstypeApi.saveOrUpdate({ ...data, id });

export const deleteAddressType = (id: number): Promise<void> =>
  addresstypeApi.delete(id);


// --- ContactTypes (ContactType) ---
const contacttypeApi = new Api<ContactType, number>('/contact-type');

export const getContactTypes = (term: string = "", page: number = 0, size: number = 20): Promise<ContactType[]> =>
  contacttypeApi.list(page, size, term);

export const getContactTypeById = (id: number): Promise<ContactType> =>
  contacttypeApi.getById(id);

export const createContactType = (data: Partial<ContactType>): Promise<ContactType> =>
  contacttypeApi.saveOrUpdate(data);

export const updateContactType = (id: number, data: Partial<ContactType>): Promise<ContactType> =>
  contacttypeApi.saveOrUpdate({ ...data, id });

export const deleteContactType = (id: number): Promise<void> =>
  contacttypeApi.delete(id);


// --- CustomerGroups (CustomerGroup) ---
const customergroupApi = new Api<CustomerGroup, number>('/customer-group');

export const getCustomerGroups = (term: string = "", page: number = 0, size: number = 20): Promise<CustomerGroup[]> =>
  customergroupApi.list(page, size, term);

export const getCustomerGroupById = (id: number): Promise<CustomerGroup> =>
  customergroupApi.getById(id);

export const createCustomerGroup = (data: Partial<CustomerGroup>): Promise<CustomerGroup> =>
  customergroupApi.saveOrUpdate(data);

export const updateCustomerGroup = (id: number, data: Partial<CustomerGroup>): Promise<CustomerGroup> =>
  customergroupApi.saveOrUpdate({ ...data, id });

export const deleteCustomerGroup = (id: number): Promise<void> =>
  customergroupApi.delete(id);


// --- CustomerTags (CustomerTag) ---
const customertagApi = new Api<CustomerTag, number>('/customer-tag');

export const getCustomerTags = (term: string = "", page: number = 0, size: number = 20): Promise<CustomerTag[]> =>
  customertagApi.list(page, size, term);

export const getCustomerTagById = (id: number): Promise<CustomerTag> =>
  customertagApi.getById(id);

export const createCustomerTag = (data: Partial<CustomerTag>): Promise<CustomerTag> =>
  customertagApi.saveOrUpdate(data);

export const updateCustomerTag = (id: number, data: Partial<CustomerTag>): Promise<CustomerTag> =>
  customertagApi.saveOrUpdate({ ...data, id });

export const deleteCustomerTag = (id: number): Promise<void> =>
  customertagApi.delete(id);


// --- LossReasons (LossReason) ---
const lossreasonApi = new Api<LossReason, number>('/loss-reason');

export const getLossReasons = (term: string = "", page: number = 0, size: number = 20): Promise<LossReason[]> =>
  lossreasonApi.list(page, size, term);

export const getLossReasonById = (id: number): Promise<LossReason> =>
  lossreasonApi.getById(id);

export const createLossReason = (data: Partial<LossReason>): Promise<LossReason> =>
  lossreasonApi.saveOrUpdate(data);

export const updateLossReason = (id: number, data: Partial<LossReason>): Promise<LossReason> =>
  lossreasonApi.saveOrUpdate({ ...data, id });

export const deleteLossReason = (id: number): Promise<void> =>
  lossreasonApi.delete(id);


// --- PaymentConditions (PaymentCondition) ---
const paymentconditionApi = new Api<PaymentCondition, number>('/payment-condition');

export const getPaymentConditions = (term: string = "", page: number = 0, size: number = 20): Promise<PaymentCondition[]> =>
  paymentconditionApi.list(page, size, term);

export const getPaymentConditionById = (id: number): Promise<PaymentCondition> =>
  paymentconditionApi.getById(id);

export const createPaymentCondition = (data: Partial<PaymentCondition>): Promise<PaymentCondition> =>
  paymentconditionApi.saveOrUpdate(data);

export const updatePaymentCondition = (id: number, data: Partial<PaymentCondition>): Promise<PaymentCondition> =>
  paymentconditionApi.saveOrUpdate({ ...data, id });

export const deletePaymentCondition = (id: number): Promise<void> =>
  paymentconditionApi.delete(id);


// --- PaymentTypes (PaymentType) ---
const paymenttypeApi = new Api<PaymentType, number>('/payment-type');

export const getPaymentTypes = (term: string = "", page: number = 0, size: number = 20): Promise<PaymentType[]> =>
  paymenttypeApi.list(page, size, term);

export const getPaymentTypeById = (id: number): Promise<PaymentType> =>
  paymenttypeApi.getById(id);

export const createPaymentType = (data: Partial<PaymentType>): Promise<PaymentType> =>
  paymenttypeApi.saveOrUpdate(data);

export const updatePaymentType = (id: number, data: Partial<PaymentType>): Promise<PaymentType> =>
  paymenttypeApi.saveOrUpdate({ ...data, id });

export const deletePaymentType = (id: number): Promise<void> =>
  paymenttypeApi.delete(id);


// --- PriceTags (PriceTag) ---
const pricetagApi = new Api<PriceTag, number>('/price-tag');

export const getPriceTags = (term: string = "", page: number = 0, size: number = 20): Promise<PriceTag[]> =>
  pricetagApi.list(page, size, term);

export const getPriceTagById = (id: number): Promise<PriceTag> =>
  pricetagApi.getById(id);

export const createPriceTag = (data: Partial<PriceTag>): Promise<PriceTag> =>
  pricetagApi.saveOrUpdate(data);

export const updatePriceTag = (id: number, data: Partial<PriceTag>): Promise<PriceTag> =>
  pricetagApi.saveOrUpdate({ ...data, id });

export const deletePriceTag = (id: number): Promise<void> =>
  pricetagApi.delete(id);


// --- ProductGroups (ProductGroup) ---
const productgroupApi = new Api<ProductGroup, number>('/product-group');

export const getProductGroups = (term: string = "", page: number = 0, size: number = 20): Promise<ProductGroup[]> =>
  productgroupApi.list(page, size, term);

export const getProductGroupById = (id: number): Promise<ProductGroup> =>
  productgroupApi.getById(id);

export const createProductGroup = (data: Partial<ProductGroup>): Promise<ProductGroup> =>
  productgroupApi.saveOrUpdate(data);

export const updateProductGroup = (id: number, data: Partial<ProductGroup>): Promise<ProductGroup> =>
  productgroupApi.saveOrUpdate({ ...data, id });

export const deleteProductGroup = (id: number): Promise<void> =>
  productgroupApi.delete(id);


// --- ProductTags (ProductTag) ---
const producttagApi = new Api<ProductTag, number>('/product-tag');

export const getProductTags = (term: string = "", page: number = 0, size: number = 20): Promise<ProductTag[]> =>
  producttagApi.list(page, size, term);

export const getProductTagById = (id: number): Promise<ProductTag> =>
  producttagApi.getById(id);

export const createProductTag = (data: Partial<ProductTag>): Promise<ProductTag> =>
  producttagApi.saveOrUpdate(data);

export const updateProductTag = (id: number, data: Partial<ProductTag>): Promise<ProductTag> =>
  producttagApi.saveOrUpdate({ ...data, id });

export const deleteProductTag = (id: number): Promise<void> =>
  producttagApi.delete(id);


// --- ReceivableHolders (ReceivableHolder) ---
const receivableholderApi = new Api<ReceivableHolder, number>('/receivable-holder');

export const getReceivableHolders = (term: string = "", page: number = 0, size: number = 20): Promise<ReceivableHolder[]> =>
  receivableholderApi.list(page, size, term);

export const getReceivableHolderById = (id: number): Promise<ReceivableHolder> =>
  receivableholderApi.getById(id);

export const createReceivableHolder = (data: Partial<ReceivableHolder>): Promise<ReceivableHolder> =>
  receivableholderApi.saveOrUpdate(data);

export const updateReceivableHolder = (id: number, data: Partial<ReceivableHolder>): Promise<ReceivableHolder> =>
  receivableholderApi.saveOrUpdate({ ...data, id });

export const deleteReceivableHolder = (id: number): Promise<void> =>
  receivableholderApi.delete(id);


// --- ReceivableStatuss (ReceivableStatus) ---
const receivablestatusApi = new Api<ReceivableStatus, number>('/receivable-status');

export const getReceivableStatuss = (term: string = "", page: number = 0, size: number = 20): Promise<ReceivableStatus[]> =>
  receivablestatusApi.list(page, size, term);

export const getReceivableStatusById = (id: number): Promise<ReceivableStatus> =>
  receivablestatusApi.getById(id);

export const createReceivableStatus = (data: Partial<ReceivableStatus>): Promise<ReceivableStatus> =>
  receivablestatusApi.saveOrUpdate(data);

export const updateReceivableStatus = (id: number, data: Partial<ReceivableStatus>): Promise<ReceivableStatus> =>
  receivablestatusApi.saveOrUpdate({ ...data, id });

export const deleteReceivableStatus = (id: number): Promise<void> =>
  receivablestatusApi.delete(id);


// --- ReceivableTypes (ReceivableType) ---
const receivabletypeApi = new Api<ReceivableType, number>('/receivable-type');

export const getReceivableTypes = (term: string = "", page: number = 0, size: number = 20): Promise<ReceivableType[]> =>
  receivabletypeApi.list(page, size, term);

export const getReceivableTypeById = (id: number): Promise<ReceivableType> =>
  receivabletypeApi.getById(id);

export const createReceivableType = (data: Partial<ReceivableType>): Promise<ReceivableType> =>
  receivabletypeApi.saveOrUpdate(data);

export const updateReceivableType = (id: number, data: Partial<ReceivableType>): Promise<ReceivableType> =>
  receivabletypeApi.saveOrUpdate({ ...data, id });

export const deleteReceivableType = (id: number): Promise<void> =>
  receivabletypeApi.delete(id);


// --- Units (Unit) ---
const unitApi = new Api<Unit, number>('/unit');

export const getUnits = (term: string = "", page: number = 0, size: number = 20): Promise<Unit[]> =>
  unitApi.list(page, size, term);

export const getUnitById = (id: number): Promise<Unit> =>
  unitApi.getById(id);

export const createUnit = (data: Partial<Unit>): Promise<Unit> =>
  unitApi.saveOrUpdate(data);

export const updateUnit = (id: number, data: Partial<Unit>): Promise<Unit> =>
  unitApi.saveOrUpdate({ ...data, id });

export const deleteUnit = (id: number): Promise<void> =>
  unitApi.delete(id);

