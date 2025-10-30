import apiInstance from "@/lib/api-instance"

export async function addSellerToTeamService(teamId: string | number, sellerId: string | number) {
  const response = await apiInstance.post(`/teams/${teamId}/sellers`, {
    sellerId,
  })
  return response.data
}

export async function removeSellerFromTeamService(teamId: string | number, sellerId: string | number) {
  const response = await apiInstance.delete(`/teams/${teamId}/sellers/${sellerId}`)
  return response.data
}

export async function updateTeamSellerService(teamId: string | number, sellerId: string | number, data: any) {
  const response = await apiInstance.patch(`/teams/${teamId}/sellers/${sellerId}`, data)
  return response.data
}