import Api, { fetchData } from "@/lib/api"

export interface UserGroupDTO {
  id: number | string
  name?: string
  slug?: string
  role?: string
}

const userGroupApi = new Api<UserGroupDTO, number | string>("/user-group")

export const getUserGroups = (term = "", page = 0, size = 100): Promise<UserGroupDTO[]> =>
  userGroupApi.list(page, size, term)

export const getUserGroupById = (id: number | string): Promise<UserGroupDTO> =>
  userGroupApi.getById(id)

export const addUserToGroup = (groupId: number | string, userId: number | string): Promise<void> =>
  fetchData<void>(`/user-group/${groupId}/user/${userId}`, { method: "POST" })

export const removeUserFromGroup = (groupId: number | string, userId: number | string): Promise<void> =>
  fetchData<void>(`/user-group/${groupId}/user/${userId}`, { method: "DELETE" })