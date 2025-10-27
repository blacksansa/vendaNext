import { apiClient } from "@/lib/api-client"

export async function addSellerToTeamService(teamId: string | number, sellerId: string | number) {
  const response = await apiClient.post(`/teams/${teamId}/sellers`, {
    sellerId,
  })
  return response.data
}

export async function removeSellerFromTeamService(teamId: string | number, sellerId: string | number) {
  const response = await apiClient.delete(`/teams/${teamId}/sellers/${sellerId}`)
  return response.data
}

export async function updateTeamSellerService(teamId: string | number, sellerId: string | number, data: any) {
  const response = await apiClient.patch(`/teams/${teamId}/sellers/${sellerId}`, data)
  return response.data
}