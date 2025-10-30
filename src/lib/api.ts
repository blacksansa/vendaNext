
import apiInstance from "./api-instance";
import {
  Customer,
  CustomerListItem,
  Team,
  User,
  Seller,
  Stage,
  Opportunity
} from "./types";

export { default as api } from "./api-instance";

export async function fetchData<T>(
  endpoint: string,
  options: { method?: string; body?: any; params?: any } = {}
): Promise<T> {
  console.log(`[API] ${options.method || 'GET'} ${endpoint}`);
  if (options.body) {
    console.log('[API] Request body:', options.body);
  }
  if (options.params) {
    console.log('[API] Request params:', options.params);
  }
  
  try {
    const response = await apiInstance.request<T>({
      url: endpoint,
      method: options.method || 'GET',
      data: options.body,
      params: options.params,
    });
    console.log(`[API] ${options.method || 'GET'} ${endpoint} - Success:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`[API] ${options.method || 'GET'} ${endpoint} - Error:`, error);
    let errorMessage = "Erro na requisição à API";
    if (error.response && error.response.data) {
      console.error('[API] Error response data:', error.response.data);
      errorMessage = error.response.data.message || error.response.data.error || JSON.stringify(error.response.data);
    } else if (error.message) {
      errorMessage = error.message;
    }
    throw new Error(errorMessage);
  }
}

class Api<T, T_ID> {
  private path: string;

  constructor(path: string) {
    this.path = path;
  }

  async count(term: string = ""): Promise<number> {
    const params = { t: term };
    return fetchData<number>(`${this.path}/count`, { params });
  }

  async list(
    page: number = 0,
    size: number = 20,
    term: string = ""
  ): Promise<T[]> {
    const params = { page, size, t: term };
    return fetchData<T[]>(this.path, { params });
  }

  async getById(id: T_ID): Promise<T> {
    return fetchData<T>(`${this.path}/${id}`);
  }

  async saveOrUpdate(entity: Partial<T> & { id?: T_ID }): Promise<T> {
    if (entity.id) {
      return fetchData<T>(`${this.path}/${entity.id}`, {
        method: "PUT",
        body: entity,
      });
    } else {
      return fetchData<T>(this.path, { method: "POST", body: entity });
    }
  }

  async patch(id: T_ID, data: Partial<T>): Promise<T> {
    return fetchData<T>(`${this.path}/${id}`, {
      method: "PATCH",
      body: data,
    });
  }

  async delete(id: T_ID): Promise<void> {
    return fetchData<void>(`${this.path}/${id}`, { method: "DELETE" });
  }
}

export default Api;
