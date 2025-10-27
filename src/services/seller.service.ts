import { apiClient } from "@/lib/api.client"

export async function fetchSellers(search: string = "", skip: number = 0, take: number = 100) {
  try {
    const response = await apiClient.get("/sellers", {
      params: { search, skip, take },
    })
    return response.data || []
  } catch (error) {
    console.error("Erro ao buscar vendedores:", error)
    throw error
  }
}

export async function fetchSellerById(id: string | number) {
  try {
    const response = await apiClient.get(`/sellers/${id}`)
    return response.data
  } catch (error) {
    console.error(`Erro ao buscar vendedor ${id}:`, error)
    throw error
  }
}

export async function updateSeller(id: string | number, data: any) {
  try {
    const response = await apiClient.patch(`/sellers/${id}`, data)
    return response.data
  } catch (error) {
    console.error(`Erro ao atualizar vendedor ${id}:`, error)
    throw error
  }
}

export async function deleteSeller(id: string | number) {
  try {
    const response = await apiClient.delete(`/sellers/${id}`)
    return response.data
  } catch (error) {
    console.error(`Erro ao deletar vendedor ${id}:`, error)
    throw error
  }
}