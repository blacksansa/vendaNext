import { getSession } from "next-auth/react";
import {
  Customer,
  CustomerListItem,
  Team,
  User,
  Seller,
  Stage,
  Opportunity
} from "./types";

const API_BASE_URL = "/api";

async function fetchData<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const session = await getSession();
  const token = session?.accessToken;
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
    let errorMessage = "Erro na requisição à API";
    try {
        const errorBody = await response.json();
        errorMessage = errorBody.message || errorBody.error || JSON.stringify(errorBody);
    } catch (e) {
        errorMessage = `${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

// --- Clientes (Customer) ---

export const getCustomers = (
  term: string = "",
  page: number = 0,
  size: number = 20
): Promise<CustomerListItem[]> => {
  const params = new URLSearchParams({ t: term, page: page.toString(), size: size.toString() });
  return fetchData(`/customer?${params.toString()}`);
};

export const getCustomerById = (id: number): Promise<Customer> => {
  return fetchData(`/customer/${id}`);
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

// --- Times / Grupos (Team) ---

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

// --- Usuários (User) ---

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

/**
 * Inicia o fluxo de recuperação de senha para um usuário.
 * @param email O email do usuário para o qual a senha será recuperada.
 */
export const resetPassword = (email: string): Promise<void> => {
    return fetchData(`/common/recovery-password`, { method: "POST", body: JSON.stringify({ email: email }) });
};

// --- Vendedores (Seller) ---

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

// --- Pipeline (Stage & Opportunity) ---

export const getPipelineStages = (term: string = "", page: number = 0, size: number = 20): Promise<Stage[]> => {
    const params = new URLSearchParams({ t: term, page: page.toString(), size: size.toString() });
    return fetchData(`/stage?${params.toString()}`);
};

export const createPipelineStage = (stageData: Partial<Stage>): Promise<Stage> => {
    return fetchData("/stage", { method: "POST", body: JSON.stringify(stageData) });
};

export const getDeals = (term: string = "", page: number = 0, size: number = 20): Promise<Opportunity[]> => {
    // ATENÇÃO: O filtro por stageId ainda não foi implementado no backend.
    // Esta função, por enquanto, busca todas as oportunidades.
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
