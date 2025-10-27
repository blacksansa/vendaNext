import Api, { fetchData } from "./api";
import {
  Customer,
  CustomerListItem,
  Team,
  User,
  Seller,
  Stage,
  Opportunity,
  CustomerReceivableSums,
  Receivable,
  InvoiceItem,
  AiCustomerCentral,
  Task,
  Order,
  Pipeline,
  Approval,
  Invoice,
  CustomerGroup,
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

class CustomerApi extends Api<Customer, number> {
  constructor() {
    super("/customer");
  }

  async receivableSums(
    id: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<CustomerReceivableSums> {
    const params = {
      s: startDate?.getTime(),
      e: endDate?.getTime(),
    };
    return fetchData<CustomerReceivableSums>(`/customer/${id}/receivable/sums`, { params });
  }

  async receivableCount(
    id: number,
    term: string = "",
    startDate?: Date,
    endDate?: Date
  ): Promise<number> {
    const params = {
      t: term,
      s: startDate?.getTime(),
      e: endDate?.getTime(),
    };
    return fetchData<number>(`/customer/${id}/receivable/count`, { params });
  }

  async receivableList(
    id: number,
    page: number = 0,
    size: number = 20,
    term: string = "",
    startDate?: Date,
    endDate?: Date
  ): Promise<Receivable[]> {
    const params = {
      page,
      size,
      t: term,
      s: startDate?.getTime(),
      e: endDate?.getTime(),
    };
    return fetchData<Receivable[]>(`/customer/${id}/receivable`, { params });
  }

  async invoiceItemCount(
    id: number,
    term: string = "",
    startDate?: Date,
    endDate?: Date
  ): Promise<number> {
    const params = {
      t: term,
      s: startDate?.getTime(),
      e: endDate?.getTime(),
    };
    return fetchData<number>(`/customer/${id}/invoice-item/count`, { params });
  }

  async invoiceItemList(
    id: number,
    page: number = 0,
    size: number = 20,
    term: string = "",
    startDate?: Date,
    endDate?: Date
  ): Promise<InvoiceItem[]> {
    const params = {
      page,
      size,
      t: term,
      s: startDate?.getTime(),
      e: endDate?.getTime(),
    };
    return fetchData<InvoiceItem[]>(`/customer/${id}/invoice-item`, { params });
  }

  async aiCustomerCentralLast(id: number): Promise<AiCustomerCentral> {
    return fetchData<AiCustomerCentral>(`/customer/${id}/ai-customer-central/last`);
  }

  async aiCustomerCentralCreate(id: number): Promise<AiCustomerCentral> {
    return fetchData<AiCustomerCentral>(`/customer/${id}/ai-customer-central`, { method: "POST" });
  }
}

// --- Instâncias da API (mantive as existentes) ---
const customerApi = new CustomerApi();
const teamApi = new Api<Team, number>("/team");
const userApi = new Api<User, string>("/user");
const sellerApi = new Api<Seller, number>("/seller");
const stageApi = new Api<Stage, number>("/stage");
const opportunityApi = new Api<Opportunity, number>("/opportunity");
const taskApi = new Api<Task, number>("/task");
const userGroupApi = new Api<any, string>("/user-group");

// --- Novas instâncias geradas / faltantes ---
const orderApi = new Api<Order, number>("/order");
const pipelineApi = new Api<Pipeline, number>("/pipeline");
// outros módulos simples (configs/cadastros)
const customerGroupApi = new Api<CustomerGroup, number>("/customer-group");
const lossReasonApi = new Api<LossReason, number>("/loss-reason");
const paymentConditionApi = new Api<PaymentCondition, number>("/payment-condition");
const paymentTypeApi = new Api<PaymentType, number>("/payment-type");
const priceTagApi = new Api<PriceTag, number>("/price-tag");
const productGroupApi = new Api<ProductGroup, number>("/product-group");
const productTagApi = new Api<ProductTag, number>("/product-tag");
const receivableHolderApi = new Api<ReceivableHolder, number>("/receivable-holder");
const receivableStatusApi = new Api<ReceivableStatus, number>("/receivable-status");
const receivableTypeApi = new Api<ReceivableType, number>("/receivable-type");
const unitApi = new Api<Unit, number>("/unit");
const approvalApi = new Api<Approval, number>("/approval");
const invoiceApi = new Api<Invoice, number>("/invoice");

// --------------------
// --- Clientes (Customer) --- (mantido)
export const getCustomers = (term: string = "", page: number = 0, size: number = 20): Promise<CustomerListItem[]> => {
  return customerApi.list(page, size, term) as Promise<CustomerListItem[]>;
};
export const getCustomerById = (id: number): Promise<Customer> => customerApi.getById(id);
export const createCustomer = (customerData: Partial<Customer>): Promise<Customer> => customerApi.saveOrUpdate(customerData);
export const updateCustomer = (id: number, customerData: Partial<Customer>): Promise<Customer> => customerApi.saveOrUpdate({ ...customerData, id });
export const deleteCustomer = (id: number): Promise<void> => customerApi.delete(id);
export const getCustomerReceivableSums = (id: number, startDate?: Date, endDate?: Date): Promise<CustomerReceivableSums> => customerApi.receivableSums(id, startDate, endDate);
export const getCustomerReceivableCount = (id: number, term: string = "", startDate?: Date, endDate?: Date): Promise<number> => customerApi.receivableCount(id, term, startDate, endDate);
export const getCustomerReceivableList = (id: number, page: number = 0, size: number = 20, term: string = "", startDate?: Date, endDate?: Date): Promise<Receivable[]> => customerApi.receivableList(id, page, size, term, startDate, endDate);
export const getCustomerInvoiceItemCount = (id: number, term: string = "", startDate?: Date, endDate?: Date): Promise<number> => customerApi.invoiceItemCount(id, term, startDate, endDate);
export const getCustomerInvoiceItemList = (id: number, page: number = 0, size: number = 20, term: string = "", startDate?: Date, endDate?: Date): Promise<InvoiceItem[]> => customerApi.invoiceItemList(id, page, size, term, startDate, endDate);
export const getAiCustomerCentralLast = (id: number): Promise<AiCustomerCentral> => customerApi.aiCustomerCentralLast(id);
export const createAiCustomerCentral = (id: number): Promise<AiCustomerCentral> => customerApi.aiCustomerCentralCreate(id);

// --- Teams / Groups (Team) ---
export const getTeams = (term: string = "", page: number = 0, size: number = 20): Promise<Team[]> => teamApi.list(page, size, term);
export const createTeam = (teamData: Partial<Team>): Promise<Team> => teamApi.saveOrUpdate(teamData);
export const updateTeam = (id: number, teamData: Partial<Team>): Promise<Team> => teamApi.saveOrUpdate({ ...teamData, id });
export const deleteTeam = (id: number): Promise<void> => teamApi.delete(id);

// --- Groups alias (kept) ---
export const getGroups = getTeams;
export const createGroup = createTeam;
export const updateGroup = updateTeam;
export const deleteGroup = deleteTeam;

// --- Users (User) ---
export const getUsers = (term: string = "", page: number = 0, size: number = 20): Promise<User[]> => userApi.list(page, size, term);
export const createUser = (userData: Partial<User>): Promise<User> => userApi.saveOrUpdate(userData);
export const updateUser = (userId: string, userData: Partial<User>): Promise<User> => userApi.saveOrUpdate({ ...userData, id: userId });
export const deleteUser = (userId: string): Promise<void> => userApi.delete(userId);

// --- User Groups (UserGroup) ---
export const getUserGroups = (term: string = "", page: number = 0, size: number = 20): Promise<any[]> => userGroupApi.list(page, size, term);
export const updateUserGroup = (groupId: string, groupData: Partial<any>): Promise<any> => userGroupApi.saveOrUpdate({ ...groupData, id: groupId });
export const addUserToGroup = (groupId: string, userId: string): Promise<void> =>
  fetchData<void>(`/user-group/${groupId}/user/${userId}`, { method: "POST" });

export const removeUserFromGroup = (groupId: string, userId: string): Promise<void> =>
  fetchData<void>(`/user-group/${groupId}/user/${userId}`, { method: "DELETE" });

// --- Sellers (Seller) ---
export const getSellers = (term: string = "", page: number = 0, size: number = 20): Promise<Seller[]> => sellerApi.list(page, size, term);
export const createSeller = (sellerData: Partial<Seller>): Promise<Seller> => sellerApi.saveOrUpdate(sellerData);
export const updateSeller = (sellerId: number, sellerData: Partial<Seller>): Promise<Seller> => sellerApi.saveOrUpdate({ ...sellerData, id: sellerId });
export const deleteSeller = (sellerId: number): Promise<void> => sellerApi.delete(sellerId);

// --- Pipeline (Pipeline) ---
export const getPipelines = (term: string = "", page: number = 0, size: number = 20): Promise<Pipeline[]> =>
  pipelineApi.list(page, size, term);
export const getPipelineById = (id: number): Promise<Pipeline> => pipelineApi.getById(id);
export const createPipeline = (data: Partial<Pipeline>): Promise<Pipeline> => pipelineApi.saveOrUpdate(data);
export const updatePipeline = (id: number, data: Partial<Pipeline>): Promise<Pipeline> => pipelineApi.saveOrUpdate({ ...data, id });
export const deletePipeline = (id: number): Promise<void> => pipelineApi.delete(id);

// --- Stage & Opportunity (kept existing APIs) ---
export const getPipelineStages = (term: string = "", page: number = 0, size: number = 20): Promise<Stage[]> => stageApi.list(page, size, term);
export const createPipelineStage = (stageData: Partial<Stage>): Promise<Stage> => stageApi.saveOrUpdate(stageData);
export const getDeals = (term: string = "", page: number = 0, size: number = 20): Promise<Opportunity[]> => opportunityApi.list(page, size, term);
export const createDeal = (dealData: Partial<Opportunity>): Promise<Opportunity> => opportunityApi.saveOrUpdate(dealData);
export const updateDeal = (dealId: number, dealData: Partial<Opportunity>): Promise<Opportunity> => opportunityApi.saveOrUpdate({ ...dealData, id: dealId });
export const deleteDeal = (dealId: number): Promise<void> => opportunityApi.delete(dealId);

// add generated-style aliases to avoid duplicate work / support both names
export const getOpportunities = getDeals;
export const getOpportunityById = (id: number): Promise<Opportunity> => opportunityApi.getById(id);
export const createOpportunity = createDeal;
export const updateOpportunity = updateDeal;
export const deleteOpportunity = deleteDeal;

// --- Orders (generated) ---
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

// --- Tasks (kept existing) ---
export const getTasks = (term: string = "", page: number = 0, size: number = 20): Promise<Task[]> => taskApi.list(page, size, term);
export const createTask = (taskData: Partial<Task>): Promise<Task> => taskApi.saveOrUpdate(taskData);
export const updateTask = (taskId: number, taskData: Partial<Task>): Promise<Task> => taskApi.patch(taskId, taskData);
export const deleteTask = (taskId: number): Promise<void> => taskApi.delete(taskId);

// --- Approval (generated + custom) ---
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

// --- Invoice (generated + custom) ---
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

// --- CustomerGroup, LossReason, PaymentCondition, PaymentType, PriceTag, ProductGroup, ProductTag ---
export const getCustomerGroups = (term: string = "", page: number = 0, size: number = 20): Promise<CustomerGroup[]> =>
  customerGroupApi.list(page, size, term);
export const createCustomerGroup = (data: Partial<CustomerGroup>): Promise<CustomerGroup> =>
  customerGroupApi.saveOrUpdate(data);
export const updateCustomerGroup = (id: number, data: Partial<CustomerGroup>): Promise<CustomerGroup> =>
  customerGroupApi.saveOrUpdate({ ...data, id });
export const deleteCustomerGroup = (id: number): Promise<void> => customerGroupApi.delete(id);

export const getLossReasons = (term: string = "", page: number = 0, size: number = 20): Promise<LossReason[]> =>
  lossReasonApi.list(page, size, term);
export const createLossReason = (data: Partial<LossReason>): Promise<LossReason> =>
  lossReasonApi.saveOrUpdate(data);
export const updateLossReason = (id: number, data: Partial<LossReason>): Promise<LossReason> =>
  lossReasonApi.saveOrUpdate({ ...data, id });
export const deleteLossReason = (id: number): Promise<void> => lossReasonApi.delete(id);

export const getPaymentConditions = (term: string = "", page: number = 0, size: number = 20): Promise<PaymentCondition[]> =>
  paymentConditionApi.list(page, size, term);
export const createPaymentCondition = (data: Partial<PaymentCondition>): Promise<PaymentCondition> =>
  paymentConditionApi.saveOrUpdate(data);
export const updatePaymentCondition = (id: number, data: Partial<PaymentCondition>): Promise<PaymentCondition> =>
  paymentConditionApi.saveOrUpdate({ ...data, id });
export const deletePaymentCondition = (id: number): Promise<void> => paymentConditionApi.delete(id);

export const getPaymentTypes = (term: string = "", page: number = 0, size: number = 20): Promise<PaymentType[]> =>
  paymentTypeApi.list(page, size, term);
export const createPaymentType = (data: Partial<PaymentType>): Promise<PaymentType> =>
  paymentTypeApi.saveOrUpdate(data);
export const updatePaymentType = (id: number, data: Partial<PaymentType>): Promise<PaymentType> =>
  paymentTypeApi.saveOrUpdate({ ...data, id });
export const deletePaymentType = (id: number): Promise<void> => paymentTypeApi.delete(id);

export const getPriceTags = (term: string = "", page: number = 0, size: number = 20): Promise<PriceTag[]> =>
  priceTagApi.list(page, size, term);
export const createPriceTag = (data: Partial<PriceTag>): Promise<PriceTag> =>
  priceTagApi.saveOrUpdate(data);
export const updatePriceTag = (id: number, data: Partial<PriceTag>): Promise<PriceTag> =>
  priceTagApi.saveOrUpdate({ ...data, id });
export const deletePriceTag = (id: number): Promise<void> => priceTagApi.delete(id);

export const getProductGroups = (term: string = "", page: number = 0, size: number = 20): Promise<ProductGroup[]> =>
  productGroupApi.list(page, size, term);
export const createProductGroup = (data: Partial<ProductGroup>): Promise<ProductGroup> =>
  productGroupApi.saveOrUpdate(data);
export const updateProductGroup = (id: number, data: Partial<ProductGroup>): Promise<ProductGroup> =>
  productGroupApi.saveOrUpdate({ ...data, id });
export const deleteProductGroup = (id: number): Promise<void> => productGroupApi.delete(id);

export const getProductTags = (term: string = "", page: number = 0, size: number = 20): Promise<ProductTag[]> =>
  productTagApi.list(page, size, term);
export const createProductTag = (data: Partial<ProductTag>): Promise<ProductTag> =>
  productTagApi.saveOrUpdate(data);
export const updateProductTag = (id: number, data: Partial<ProductTag>): Promise<ProductTag> =>
  productTagApi.saveOrUpdate({ ...data, id });
export const deleteProductTag = (id: number): Promise<void> => productTagApi.delete(id);

// --- Receivable helpers ---
export const getReceivableHolders = (term: string = "", page: number = 0, size: number = 20): Promise<ReceivableHolder[]> =>
  receivableHolderApi.list(page, size, term);
export const getReceivableStatuses = (term: string = "", page: number = 0, size: number = 20): Promise<ReceivableStatus[]> =>
  receivableStatusApi.list(page, size, term);
export const getReceivableTypes = (term: string = "", page: number = 0, size: number = 20): Promise<ReceivableType[]> =>
  receivableTypeApi.list(page, size, term);

// --- Units ---
export const getUnits = (term: string = "", page: number = 0, size: number = 20): Promise<Unit[]> =>
  unitApi.list(page, size, term);
export const getUnitById = (id: number): Promise<Unit> => unitApi.getById(id);
export const createUnit = (data: Partial<Unit>): Promise<Unit> => unitApi.saveOrUpdate(data);
export const updateUnit = (id: number, data: Partial<Unit>): Promise<Unit> => unitApi.saveOrUpdate({ ...data, id });
export const deleteUnit = (id: number): Promise<void> => unitApi.delete(id);

// --------------------
// Utilities / special endpoints not present anteriormente
export const resetPassword = (userId: string): Promise<void> =>
  fetchData<void>(`/user/${userId}/reset-password`, { method: "POST" });

// Helpers para filtros do backend (role / manager)
export const getUsersByRole = (role: string, term: string = "", page: number = 0, size: number = 20): Promise<User[]> =>
  fetchData<User[]>(`/user`, { params: { role, t: term, page, size } });

export const getTeamById = (id: number): Promise<Team> => teamApi.getById(id);

export const getTeamsByManager = (managerId: string, term: string = "", page: number = 0, size: number = 20): Promise<Team[]> =>
  fetchData<Team[]>(`/team`, { params: { managerId, t: term, page, size } });

// Services exports
export * from "@/services/team.service"
export * from "@/services/user.service"
export * from "@/services/user-group.service"
export * from "@/services/seller.service"
export * from "@/services/customer.service"
export * from "@/services/pipeline.service"
export * from "@/services/task-order-approval-invoice.service"
export * from "@/services/catalog.service"