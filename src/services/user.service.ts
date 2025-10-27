import { apiClient } from "@/lib/api.client"

export async function fetchUsers(search: string = "", skip: number = 0, take: number = 100) {
  try {
    const response = await apiClient.get("/users", {
      params: { search, skip, take },
    })
    return response.data || []
  } catch (error) {
    console.error("Erro ao buscar usuários:", error)
    throw error
  }
}

export async function fetchUserById(id: string | number) {
  try {
    const response = await apiClient.get(`/users/${id}`)
    return response.data
  } catch (error) {
    console.error(`Erro ao buscar usuário ${id}:`, error)
    throw error
  }
}

export async function updateUser(id: string | number, data: any) {
  try {
    const response = await apiClient.patch(`/users/${id}`, data)
    return response.data
  } catch (error) {
    console.error(`Erro ao atualizar usuário ${id}:`, error)
    throw error
  }
}

export async function deleteUser(id: string | number) {
  try {
    const response = await apiClient.delete(`/users/${id}`)
    return response.data
  } catch (error) {
    console.error(`Erro ao deletar usuário ${id}:`, error)
    throw error
  }
}