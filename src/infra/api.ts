
import {
  AnalyticsOverview,
  Customer,
  CustomerListItem,
  Deal,
  Group,
  LeaderDashboard,
  Pipeline, // Assuming Pipeline is the model for a list of pipelines
  PipelineStage,
  ReportMetrics,
  Seller,
  SellerGroup,
  SellerPerformance,
  SellerRanking,
  Task,
  TaskMetrics,
  TaskResponsible,
  User,
  Role,
  Permission,
  AuditLog,
  AvailableReport,
  Team,
  Opportunity,
  Stage
} from "./types";

import { userSession } from "./session";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

/**
 * Função genérica para realizar requisições à API.
 * Utiliza o singleton userSession para obter o token de autenticação.
 */
async function fetchData<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = userSession.getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Tenta extrair uma mensagem de erro mais detalhada do backend
    let errorMessage = "Erro na requisição à API";
    try {
        const errorBody = await response.json();
        errorMessage = errorBody.message || errorBody.error || JSON.stringify(errorBody);
    } catch (e) {
        // O corpo do erro não é JSON ou está vazio
        errorMessage = `${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

// ====================================================================================
// Funções da API por Página
// ====================================================================================

// --- analytics/page.tsx ---

// TODO: Backend não possui um endpoint para buscar todos os dados de analytics de uma vez.
export const getAnalyticsOverview = (period: string): Promise<AnalyticsOverview> => {
  console.warn("Endpoint não implementado no backend: getAnalyticsOverview");
  return Promise.resolve({} as AnalyticsOverview);
};

// TODO: Backend não possui um endpoint específico para a tendência de receita.
export const getRevenueTrend = (period: string): Promise<any> => {
  console.warn("Endpoint não implementado no backend: getRevenueTrend");
  return Promise.resolve([]);
};

// TODO: Backend não possui um endpoint específico para a distribuição de clientes.
export const getCustomerDistribution = (period: string): Promise<any> => {
  console.warn("Endpoint não implementado no backend: getCustomerDistribution");
  return Promise.resolve([]);
};

// TODO: Backend não possui um endpoint específico para o funil de vendas.
export const getSalesFunnel = (period: string): Promise<any> => {
  console.warn("Endpoint não implementado no backend: getSalesFunnel");
  return Promise.resolve([]);
};

// TODO: Backend não possui um endpoint específico para top performers.
export const getTopPerformers = (period: string): Promise<any> => {
  console.warn("Endpoint não implementado no backend: getTopPerformers");
  return Promise.resolve([]);
};

// --- customers/page.tsx ---

export const getCustomers = (
  term: string = "",
  page: number = 0,
  size: number = 20
): Promise<CustomerListItem[]> => {
  const params = new URLSearchParams({ t: term, page: page.toString(), size: size.toString() });
  return fetchData(`/customer?${params.toString()}`);
};

export const createCustomer = (customerData: Partial<Customer>): Promise<Customer> => {
  return fetchData("/customer", { method: "POST", body: JSON.stringify(customerData) });
};

export const updateCustomer = (id: number, customerData: Partial<Customer>): Promise<Customer> => {
  return fetchData(`/customer/${id}`, { method: "PUT", body: JSON.stringify(customerData) });
};

export const deleteCustomer = (id: number): Promise<void> => {
  return fetchData(`/customer/${id}`, { method: "DELETE" });
};

// --- grupos/page.tsx (Mapeado para 'Team' no backend) ---

export const getGroups = (term: string = "", page: number = 0, size: number = 20): Promise<Team[]> => {
    const params = new URLSearchParams({ t: term, page: page.toString(), size: size.toString() });
    return fetchData(`/team?${params.toString()}`);
};

export const createGroup = (groupData: Partial<Team>): Promise<Team> => {
    return fetchData("/team", { method: "POST", body: JSON.stringify(groupData) });
};

export const updateGroup = (id: number, groupData: Partial<Team>): Promise<Team> => {
    return fetchData(`/team/${id}`, { method: "PUT", body: JSON.stringify(groupData) });
};

export const deleteGroup = (id: number): Promise<void> => {
    return fetchData(`/team/${id}`, { method: "DELETE" });
};

// TODO: O endpoint de Team não parece ter um método para adicionar/remover um membro diretamente.
// A atualização é feita no objeto Team completo.
export const addMemberToGroup = (groupId: number, userId: string): Promise<Team> => {
    console.warn("Ação não implementada via endpoint específico: addMemberToGroup. Use updateGroup.");
    return Promise.reject("Use updateGroup para modificar a lista de membros.");
};

export const removeMemberFromGroup = (groupId: number, userId: string): Promise<Team> => {
    console.warn("Ação não implementada via endpoint específico: removeMemberFromGroup. Use updateGroup.");
    return Promise.reject("Use updateGroup para modificar a lista de membros.");
};


// --- lideres/page.tsx ---

// TODO: Backend não possui um endpoint para o dashboard do líder.
export const getLeaderDashboard = (leaderId: string, period: string): Promise<LeaderDashboard> => {
  console.warn("Endpoint não implementado no backend: getLeaderDashboard");
  return Promise.resolve({} as LeaderDashboard);
};

// --- pipeline/page.tsx ---

export const getPipelineStages = (term: string = "", page: number = 0, size: number = 20): Promise<Stage[]> => {
    const params = new URLSearchParams({ t: term, page: page.toString(), size: size.toString() });
    return fetchData(`/stage?${params.toString()}`);
};

export const createPipelineStage = (stageData: Partial<Stage>): Promise<Stage> => {
    return fetchData("/stage", { method: "POST", body: JSON.stringify(stageData) });
};

export const getDeals = (stageId: string, term: string = "", page: number = 0, size: number = 20): Promise<Opportunity[]> => {
    // TODO: O backend não parece filtrar oportunidades por stageId via query param.
    // A lógica de filtro precisaria ser feita no frontend ou o backend ajustado.
    console.warn("Filtro de getDeals por stageId não implementado no backend.");
    const params = new URLSearchParams({ t: term, page: page.toString(), size: size.toString() });
    return fetchData(`/opportunity?${params.toString()}`);
};

export const createDeal = (dealData: Partial<Opportunity>): Promise<Opportunity> => {
    return fetchData("/opportunity", { method: "POST", body: JSON.stringify(dealData) });
};

export const updateDeal = (dealId: number, dealData: Partial<Opportunity>): Promise<Opportunity> => {
    return fetchData(`/opportunity/${dealId}`, { method: "PUT", body: JSON.stringify(dealData) });
};

export const deleteDeal = (dealId: number): Promise<void> => {
    return fetchData(`/opportunity/${dealId}`, { method: "DELETE" });
};

// --- relatorios/page.tsx ---

// TODO: Backend não possui um endpoint para listar relatórios disponíveis.
export const getAvailableReports = (): Promise<AvailableReport[]> => {
  console.warn("Endpoint não implementado no backend: getAvailableReports");
  return Promise.resolve([]);
};

// TODO: Backend não possui um endpoint para gerar relatórios.
export const generateReport = (reportId: string, period: string): Promise<any> => {
  console.warn("Endpoint não implementado no backend: generateReport");
  return Promise.resolve(null);
};

// TODO: Backend não possui um endpoint para as métricas da página de relatórios.
export const getReportMetrics = (period: string): Promise<ReportMetrics> => {
  console.warn("Endpoint não implementado no backend: getReportMetrics");
  return Promise.resolve({} as ReportMetrics);
};

// --- tarefas/page.tsx ---

// TODO: Não há uma entidade ou resource para 'Task' no backend.
export const getTasks = (filters: any): Promise<Task[]> => {
  console.warn("Endpoint não implementado no backend: getTasks");
  return Promise.resolve([]);
};

export const createTask = (taskData: Partial<Task>): Promise<Task> => {
  console.warn("Endpoint não implementado no backend: createTask");
  return Promise.resolve({} as Task);
};

export const updateTask = (taskId: string, taskData: Partial<Task>): Promise<Task> => {
  console.warn("Endpoint não implementado no backend: updateTask");
  return Promise.resolve({} as Task);
};

export const deleteTask = (taskId: string): Promise<void> => {
  console.warn("Endpoint não implementado no backend: deleteTask");
  return Promise.resolve();
};

export const getTaskMetrics = (): Promise<TaskMetrics> => {
  console.warn("Endpoint não implementado no backend: getTaskMetrics");
  return Promise.resolve({} as TaskMetrics);
};

export const getTaskResponsibles = (): Promise<TaskResponsible[]> => {
  console.warn("Endpoint não implementado no backend: getTaskResponsibles");
  return Promise.resolve([]);
};

// --- usuarios/page.tsx ---

export const getUsers = (term: string = "", page: number = 0, size: number = 20): Promise<User[]> => {
  const params = new URLSearchParams({ t: term, page: page.toString(), size: size.toString() });
  return fetchData(`/user?${params.toString()}`);
};

export const createUser = (userData: Partial<User>): Promise<User> => {
  return fetchData("/user", { method: "POST", body: JSON.stringify(userData) });
};

export const updateUser = (userId: string, userData: Partial<User>): Promise<User> => {
  return fetchData(`/user/${userId}`, { method: "PUT", body: JSON.stringify(userData) });
};

export const deleteUser = (userId: string): Promise<void> => {
  return fetchData(`/user/${userId}`, { method: "DELETE" });
};

export const resetPassword = (userId: string): Promise<void> => {
    // O endpoint do backend é /common/recovery-password e espera um objeto User no corpo
    return fetchData(`/common/recovery-password`, { method: "POST", body: JSON.stringify({ id: userId }) });
};

// TODO: Não há uma entidade ou resource para 'AuditLog' no backend.
export const getAuditLogs = (): Promise<AuditLog[]> => {
  console.warn("Endpoint não implementado no backend: getAuditLogs");
  return Promise.resolve([]);
};

// --- vendedores/page.tsx ---

export const getSellers = (term: string = "", page: number = 0, size: number = 20): Promise<Seller[]> => {
  const params = new URLSearchParams({ t: term, page: page.toString(), size: size.toString() });
  return fetchData(`/seller?${params.toString()}`);
};

export const createSeller = (sellerData: Partial<Seller>): Promise<Seller> => {
  return fetchData("/seller", { method: "POST", body: JSON.stringify(sellerData) });
};

export const updateSeller = (sellerId: number, sellerData: Partial<Seller>): Promise<Seller> => {
  return fetchData(`/seller/${sellerId}`, { method: "PUT", body: JSON.stringify(sellerData) });
};

export const deleteSeller = (sellerId: number): Promise<void> => {
  return fetchData(`/seller/${sellerId}`, { method: "DELETE" });
};

// O backend usa /team para grupos de vendedores (SellerGroup)
export const getSellerGroups = (term: string = "", page: number = 0, size: number = 20): Promise<Team[]> => {
    return getGroups(term, page, size);
};

export const createSellerGroup = (groupData: Partial<Team>): Promise<Team> => {
    return createGroup(groupData);
};

// TODO: Backend não possui um endpoint específico para performance de um vendedor.
export const getSellerPerformance = (sellerId: string, period: string): Promise<SellerPerformance[]> => {
  console.warn("Endpoint não implementado no backend: getSellerPerformance");
  return Promise.resolve([]);
};

// TODO: Backend não possui um endpoint específico para ranking de vendedores.
export const getSellersRanking = (period: string): Promise<SellerRanking[]> => {
  console.warn("Endpoint não implementado no backend: getSellersRanking");
  return Promise.resolve([]);
};
