// Camada de serviço: centraliza chamadas à API de teams, users e sellers.
// Mantém um ponto único para evoluir payloads e rotas sem tocar na UI.

import { getTeams, createTeam, updateTeam, getSellers, getUsers } from "@/lib/api.client"

export const fetchTeams = (term: string = "", page = 0, size = 100) => getTeams(term, page, size)
export const fetchSellers = (term: string = "", page = 0, size = 100) => getSellers(term, page, size)
export const fetchUsers = (term: string = "", page = 0, size = 100) => getUsers(term, page, size)

export const createTeamService = (payload: any) => createTeam(payload)
export const updateTeamService = (id: number | string, payload: any) => updateTeam(id, payload)