import Api from "@/lib/api"

export interface TeamDTO {
  id?: number
  name?: string
  description?: string
  quota?: number
  managerId?: number | string | null
  active?: boolean
  sellerIds?: Array<number | string>
}

const teamApi = new Api<TeamDTO, number>("/team")

export const getTeams = (term = "", page = 0, size = 100): Promise<TeamDTO[]> =>
  teamApi.list(page, size, term)

export const getTeamById = (id: number): Promise<TeamDTO> =>
  teamApi.getById(id)

export const createTeam = (data: Partial<TeamDTO>): Promise<TeamDTO> =>
  teamApi.saveOrUpdate(data)

export const updateTeam = (id: number, data: Partial<TeamDTO>): Promise<TeamDTO> =>
  teamApi.saveOrUpdate({ ...data, id })

export const deleteTeam = (id: number): Promise<void> =>
  teamApi.delete(id)