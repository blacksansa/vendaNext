import Api, { fetchData } from "@/lib/api"

export interface UserDTO {
  id: number | string
  name?: string
  firstName?: string
  lastName?: string
  email?: string
  role?: string
  groups?: Array<{ id?: number | string; name?: string; slug?: string; role?: string }>
  userGroups?: Array<{ id?: number | string; name?: string; slug?: string; role?: string }>
  userGroup?: Array<{ id?: number | string; name?: string; slug?: string; role?: string }>
}

const userApi = new Api<UserDTO, string | number>("/user")

export const getUsers = (term = "", page = 0, size = 100): Promise<UserDTO[]> =>
  userApi.list(page, size, term)

export const getUserById = (id: string | number): Promise<UserDTO> =>
  userApi.getById(id)

export const createUser = (data: Partial<UserDTO>): Promise<UserDTO> =>
  userApi.saveOrUpdate(data)

export const updateUser = (id: string | number, data: Partial<UserDTO>): Promise<UserDTO> =>
  userApi.saveOrUpdate({ ...data, id })

export const deleteUser = (id: string | number): Promise<void> =>
  userApi.delete(id)

// Utilitários opcionais
export const getUsersByGroup = (group: string, term = "", page = 0, size = 100): Promise<UserDTO[]> =>
  fetchData<UserDTO[]>("/user", { params: { group, t: term, page, size } })

export const getManagers = (term = "", page = 0, size = 100): Promise<UserDTO[]> =>
  fetchData<UserDTO[]>("/user", { params: { role: "manager", t: term, page, size } })