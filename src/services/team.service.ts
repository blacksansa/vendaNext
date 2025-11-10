import Api, { api } from "@/lib/api"

export interface TeamDTO {
  id?: number
  name?: string
  description?: string
  quota?: number
  managerId?: string | null
  active?: boolean
  sellerIds?: Array<number | string>
  code?: string
  sellers?: Array<number | string>
}

const teamApi = new Api<TeamDTO, number>("/team")

// Debug simples por env
const TEAM_DEBUG = process.env.NEXT_PUBLIC_DEBUG_TEAMS === "1"

// normaliza IDs de sellers a partir de vários formatos e remove vazios
function normalizeSellerIds(src: any): Array<number | string> {
  const raw: any[] = [
    ...(Array.isArray(src?.sellers) ? src.sellers : []),
    ...(Array.isArray(src?.sellerIds) ? src.sellerIds : []),
    ...(Array.isArray(src?.members) ? src.members.map((m: any) => m?.sellerId ?? m?.id) : []),
    ...(Array.isArray(src?.vendedores) ? src.vendedores.map((v: any) => v?.id ?? v?.sellerId ?? v?.userId) : []),
  ]
  return Array.from(new Set(
    raw
      .map((v) => (typeof v === "object" ? (v?.id ?? v?.sellerId ?? v?.userId ?? v?.usuarioId) : v))
      .filter((v) => v !== null && v !== undefined)
      .map((v) => (typeof v === "string" ? v.trim() : v))
      .filter((v) => v !== "" && v !== "null" && v !== "undefined")
      .map((v) => (typeof v === "string" && /^\d+$/.test(v) ? Number(v) : v))
  ))
}

function normalizeManagerId(v: any): string | null {
  if (v === null || v === undefined || v === "") return null
  if (typeof v === "string") {
    const t = v.trim()
    if (!t) return null
    return t
  }
  // Convert numbers to strings since backend expects String
  return String(v)
}

// monta payload com campos requeridos (name, code, sellers) e mapeia líder
function buildTeamPayload(data: Partial<TeamDTO>, existing?: Partial<TeamDTO>) {
  const name =
    (data as any)?.name ??
    (data as any)?.nome ??
    existing?.name

  const code =
    (data as any)?.code ??
    existing?.code ??
    (name ? String(name).trim() : undefined)

  const sellersFromData = normalizeSellerIds(data)
  const sellersFromExisting = existing ? normalizeSellerIds(existing) : []
  const sellerIds = sellersFromData.length > 0 ? sellersFromData : sellersFromExisting

  // backend espera objetos { id }
  const sellersPayload = Array.isArray(sellerIds)
    ? sellerIds.map((id) => ({ id }))
    : []

  // líder (manager) — envia id e aliases por compatibilidade
  const mId = normalizeManagerId(
    (data as any)?.managerId ??
    (data as any)?.liderUserId ??
    (data as any)?.lider ??
    (existing as any)?.managerId ??
    null
  )
  const managerObj = mId != null ? { id: mId } : undefined

  const payload: any = {
    name: String(name ?? "").trim(),
    code: String(code ?? "").trim(),
    description: (data as any)?.description ?? (data as any)?.descricao ?? existing?.description,
    quota: (data as any)?.quota ?? (existing as any)?.quota,
    active:
      typeof (data as any)?.active === "boolean"
        ? (data as any)?.active
        : (existing as any)?.active,
    sellers: sellersPayload, // sempre [{ id }]
    managerId: mId, // backend espera apenas managerId
  }

  // valida mínimos para create
  if (!existing) {
    if (!payload.name) throw new Error("Nome do grupo é obrigatório")
    if (!payload.code) payload.code = payload.name // fallback para create
    if (!Array.isArray(payload.sellers)) payload.sellers = []
  }

  return payload
}

export const getTeams = (term = "", page = 0, size = 100): Promise<TeamDTO[]> =>
  teamApi.list(page, size, term)

export const getTeamById = (id: number): Promise<TeamDTO> =>
  teamApi.getById(id)

export const createTeam = async (data: Partial<TeamDTO>): Promise<TeamDTO> => {
  const payload = buildTeamPayload(data)
  try {
    return await teamApi.saveOrUpdate(payload as TeamDTO)
  } catch (err: any) {
    console.error("[team] create error", {
      status: err?.response?.status ?? null,
      message: err?.message,
      id: payload?.id,
      managerId: payload?.managerId,
      sellersCount: Array.isArray(payload?.sellers) ? payload.sellers.length : 0,
    })
    throw err
  }
}

export const updateTeam = async (id: number, data: Partial<TeamDTO>): Promise<TeamDTO> => {
  const needsExisting =
    (data as any)?.name == null && (data as any)?.nome == null ||
    (data as any)?.code == null ||
    (data as any)?.sellers == null

  const existing = needsExisting ? await teamApi.getById(id) : ({} as TeamDTO)
  const base: any = { id, ...(buildTeamPayload(data, existing) as any) }
  // segurança extra: nunca envie item null em sellers
  if (!Array.isArray(base.sellers)) base.sellers = []
  base.sellers = base.sellers.filter((s: any) => s && s.id !== null && s.id !== undefined)

  // logs simples do que será enviado
  console.log("[team] update send", {
    id,
    name: base?.name,
    code: base?.code,
    managerId: base?.managerId ?? null,
    sellersCount: Array.isArray(base?.sellers) ? base.sellers.length : 0,
  })

  // Envia diretamente - backend aceita managerId
  const saved = await teamApi.saveOrUpdate(base as TeamDTO)
  console.log("[team] update response", {
    id,
    managerId: saved?.managerId ?? null,
  })
  return saved
}

export const deleteTeam = (id: number): Promise<void> =>
  teamApi.delete(id)

export const setDefaultPipeline = async (teamId: number, pipelineId: number | null): Promise<TeamDTO> => {
  return (await api.request<TeamDTO>({
    url: `/team/${teamId}/default-pipeline`,
    method: "PATCH",
    data: { pipelineId },
  })).data
}