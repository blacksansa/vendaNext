import { apiClient } from "@/lib/api.client"

export async function addSellerToTeamService(teamId: string | number, sellerId: string | number) {
  try {
    const response = await apiClient.post(`/teams/${teamId}/sellers`, {
      sellerId,
    })
    return response.data
  } catch (error) {
    console.error(`Erro ao adicionar vendedor ao grupo ${teamId}:`, error)
    throw error
  }
}

export async function removeSellerFromTeamService(teamId: string | number, sellerId: string | number) {
  try {
    const response = await apiClient.delete(`/teams/${teamId}/sellers/${sellerId}`)
    return response.data
  } catch (error) {
    console.error(`Erro ao remover vendedor do grupo ${teamId}:`, error)
    throw error
  }
}

export async function updateTeamSellerService(teamId: string | number, sellerId: string | number, data: any) {
  try {
    const response = await apiClient.patch(`/teams/${teamId}/sellers/${sellerId}`, data)
    return response.data
  } catch (error) {
    console.error(`Erro ao atualizar vendedor no grupo ${teamId}:`, error)
    throw error
  }
}