import { useQuery } from "@tanstack/react-query"
import { fetchSellers } from "../services/seller.service"

export function useSellersModel() {
  const { data: sellers = [], isLoading, isError } = useQuery({
    queryKey: ["sellers"],
    queryFn: () => fetchSellers("", 0, 100),
  })

  const getSellerName = (seller: any): string => {
    if (seller.user) {
      return `${seller.user.firstName ?? ""} ${seller.user.lastName ?? ""}`.trim()
    }
    return seller.name ?? seller.user?.email ?? String(seller.id)
  }

  const getSellerById = (id: string | number) => {
    return (sellers || []).find((s: any) => String(s.id) === String(id))
  }

  const getSellersByIds = (ids: (string | number)[]): any[] => {
    return (sellers || []).filter((s: any) => ids.map(String).includes(String(s.id)))
  }

  const getSellersNotInGroup = (groupSellerIds: (string | number)[]): any[] => {
    const groupIds = groupSellerIds.map(String)
    return (sellers || []).filter((s: any) => !groupIds.includes(String(s.id)))
  }

  return {
    sellers,
    isLoading,
    isError,
    getSellerName,
    getSellerById,
    getSellersByIds,
    getSellersNotInGroup,
  }
}