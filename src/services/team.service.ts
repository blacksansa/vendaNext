import { apiClient } from "@/lib/api.client"

export async function fetchTeams(search: string = "", skip: number = 0, take: number = 100) {
  try {
    const response = await apiClient.get("/teams", {
      params: { search, skip, take },
    })
    return response.data || []
  } catch (error) {
    console.error("Erro ao buscar grupos:", error)
    throw error
  }
}

export async function fetchTeamById(id: string | number) {
  try {
    const response = await apiClient.get(`/teams/${id}`)
    return response.data
  } catch (error) {
    console.error(`Erro ao buscar grupo ${id}:`, error)
    throw error
  }
}

export async function createTeamService(data: any) {
  try {
    const response = await apiClient.post("/teams", data)
    return response.data
  } catch (error) {
    console.error("Erro ao criar grupo:", error)
    throw error
  }
}

export async function updateTeamService(id: string | number, data: any) {
  try {
    const response = await apiClient.patch(`/teams/${id}`, data)
    return response.data
  } catch (error) {
    console.error(`Erro ao atualizar grupo ${id}:`, error)
    throw error
  }
}

export async function deleteTeamService(id: string | number) {
  try {
    const response = await apiClient.delete(`/teams/${id}`)
    return response.data
  } catch (error) {
    console.error(`Erro ao deletar grupo ${id}:`, error)
    throw error
  }
}