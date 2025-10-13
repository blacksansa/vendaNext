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
  Task
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
    return fetchData<CustomerReceivableSums>(`${this.path}/${id}/receivable/sums`, { params });
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
    return fetchData<number>(`${this.path}/${id}/receivable/count`, { params });
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
    return fetchData<Receivable[]>(`${this.path}/${id}/receivable`, { params });
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
    return fetchData<number>(`${this.path}/${id}/invoice-item/count`, { params });
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
    return fetchData<InvoiceItem[]>(`${this.path}/${id}/invoice-item`, { params });
  }

  async aiCustomerCentralLast(id: number): Promise<AiCustomerCentral> {
    return fetchData<AiCustomerCentral>(`${this.path}/${id}/ai-customer-central/last`);
  }

  async aiCustomerCentralCreate(id: number): Promise<AiCustomerCentral> {
    return fetchData<AiCustomerCentral>(`${this.path}/${id}/ai-customer-central`, { method: "POST" });
  }
}

// --- Instâncias da API ---
const customerApi = new CustomerApi();
const teamApi = new Api<Team, number>("/team");
const userApi = new Api<User, string>("/user");
const sellerApi = new Api<Seller, number>("/seller");
const stageApi = new Api<Stage, number>("/stage");
const opportunityApi = new Api<Opportunity, number>("/opportunity");
const taskApi = new Api<Task, number>("/task");

// --- Clientes (Customer) ---
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


// --- Times / Grupos (Team) ---
export const getTeams = (term: string = "", page: number = 0, size: number = 20): Promise<Team[]> => teamApi.list(page, size, term);
export const createTeam = (teamData: Partial<Team>): Promise<Team> => teamApi.saveOrUpdate(teamData);
export const updateTeam = (id: number, teamData: Partial<Team>): Promise<Team> => teamApi.saveOrUpdate({ ...teamData, id });
export const deleteTeam = (id: number): Promise<void> => teamApi.delete(id);



// --- Times / Grupos (Team) ---
export const getGroups = (term: string = "", page: number = 0, size: number = 20): Promise<Team[]> => teamApi.list(page, size, term);
export const createGroup = (groupData: Partial<Team>): Promise<Team> => teamApi.saveOrUpdate(groupData);
export const updateGroup = (id: number, groupData: Partial<Team>): Promise<Team> => teamApi.saveOrUpdate({ ...groupData, id });
export const deleteGroup = (id: number): Promise<void> => teamApi.delete(id);

// --- Usuários (User) ---
export const getUsers = (term: string = "", page: number = 0, size: number = 20): Promise<User[]> => userApi.list(page, size, term);
export const createUser = (userData: Partial<User>): Promise<User> => userApi.saveOrUpdate(userData);
export const updateUser = (userId: string, userData: Partial<User>): Promise<User> => userApi.saveOrUpdate({ ...userData, id: userId });
export const deleteUser = (userId: string): Promise<void> => userApi.delete(userId);

// --- Vendedores (Seller) ---
export const getSellers = (term: string = "", page: number = 0, size: number = 20): Promise<Seller[]> => sellerApi.list(page, size, term);
export const createSeller = (sellerData: Partial<Seller>): Promise<Seller> => sellerApi.saveOrUpdate(sellerData);
export const updateSeller = (sellerId: number, sellerData: Partial<Seller>): Promise<Seller> => sellerApi.saveOrUpdate({ ...sellerData, id: sellerId });
export const deleteSeller = (sellerId: number): Promise<void> => sellerApi.delete(sellerId);

// --- Pipeline (Stage & Opportunity) ---
export const getPipelineStages = (term: string = "", page: number = 0, size: number = 20): Promise<Stage[]> => stageApi.list(page, size, term);
export const createPipelineStage = (stageData: Partial<Stage>): Promise<Stage> => stageApi.saveOrUpdate(stageData);
export const getDeals = (term: string = "", page: number = 0, size: number = 20): Promise<Opportunity[]> => opportunityApi.list(page, size, term);
export const createDeal = (dealData: Partial<Opportunity>): Promise<Opportunity> => opportunityApi.saveOrUpdate(dealData);
export const updateDeal = (dealId: number, dealData: Partial<Opportunity>): Promise<Opportunity> => opportunityApi.saveOrUpdate({ ...dealData, id: dealId });
export const deleteDeal = (dealId: number): Promise<void> => opportunityApi.delete(dealId);

// --- Tarefas (Task) ---
export const getTasks = (term: string = "", page: number = 0, size: number = 20): Promise<Task[]> => taskApi.list(page, size, term);
export const createTask = (taskData: Partial<Task>): Promise<Task> => taskApi.saveOrUpdate(taskData);
export const updateTask = (taskId: number, taskData: Partial<Task>): Promise<Task> => taskApi.patch(taskId, taskData);
export const deleteTask = (taskId: number): Promise<void> => taskApi.delete(taskId);