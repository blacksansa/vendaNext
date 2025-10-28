import { getTeams } from "@/services/team.service"
import { getUsers } from "@/services/user.service"
import { getSellers } from "@/services/seller.service"

/**
 * Busca o aprovador (managerId) para um vendedor (seller).
 * 
 * Lógica:
 * 1. Busca todos os teams
 * 2. Encontra o team que contém o sellerId
 * 3. Retorna o managerId desse team
 * 4. Se não encontrar team, retorna um admin
 * 
 * @param sellerId - ID do vendedor
 * @returns managerId (string) ou null
 */
export async function getApproverForSeller(sellerId: string | number): Promise<string | null> {
  try {
    console.log("[approval-helper] buscando aprovador para seller", sellerId)
    
    // 1. Buscar todos os teams
    const teams = await getTeams("", 0, 100)
    
    // 2. Encontrar team que contém o seller
    const sellerTeam = teams.find((team) => {
      const sellerIds = Array.isArray(team.sellers)
        ? team.sellers.map((s: any) => String(s?.id ?? s))
        : Array.isArray(team.sellerIds)
        ? team.sellerIds.map((id) => String(id))
        : []
      
      return sellerIds.includes(String(sellerId))
    })
    
    if (sellerTeam?.managerId) {
      console.log("[approval-helper] seller pertence ao team", {
        teamId: sellerTeam.id,
        teamName: sellerTeam.name,
        managerId: sellerTeam.managerId,
      })
      return String(sellerTeam.managerId)
    }
    
    // 3. Se não encontrou team, busca um admin
    console.log("[approval-helper] seller não pertence a nenhum team, buscando admin")
    const users = await getUsers("", 0, 100)
    const admin = users.find((u: any) => {
      const groups = u.groups || u.userGroups || []
      return Array.isArray(groups) && groups.some((g: any) => 
        String(g?.name || g?.slug || "").toLowerCase().includes("admin")
      )
    })
    
    if (admin?.id) {
      console.log("[approval-helper] admin encontrado", { adminId: admin.id, adminName: admin.name })
      return String(admin.id)
    }
    
    console.warn("[approval-helper] nenhum aprovador encontrado")
    return null
  } catch (error) {
    console.error("[approval-helper] erro ao buscar aprovador", error)
    return null
  }
}

/**
 * Busca o sellerId a partir do userId logado.
 * 
 * @param userId - ID do usuário logado
 * @returns sellerId (number) ou null
 */
export async function getSellerIdFromUserId(userId: string | number): Promise<number | null> {
  try {
    const sellers = await getSellers("", 0, 100)
    const seller = sellers.find((s: any) => String(s.user?.id ?? s.userId) === String(userId))
    return seller?.id ? Number(seller.id) : null
  } catch (error) {
    console.error("[approval-helper] erro ao buscar seller", error)
    return null
  }
}
