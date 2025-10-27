"use client"

import { useState, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import {
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam,
} from "@/services/team.service"
import { getUsers } from "@/services/user.service"
import { getSellers } from "@/services/seller.service"
import { grupoEventListener } from "./listeners/grupo.listener"

export interface VendedorGrupo {
  id: string | number
  nome: string
  vendas: number
  status: "ativo" | "inativo" | "licenca"
}

export interface Grupo {
  id: string | number
  nome: string
  lider: string
  liderUserId: string | number | null
  membros: number
  metaMensal: number
  vendidoMes: number
  status: "ativo" | "inativo" | "pausado"
  descricao: string
  vendedores: VendedorGrupo[]
  raw: any
}

export interface GrupoState {
  grupos: Grupo[]
  isLoading: boolean
  error: string | null
  editando: Grupo | null
  selecionado: Grupo | null
  syncPending: number
  gerentes?: { id: string | number; nome: string }[]           // opcional já existente
  vendedoresDisponiveis?: { id: string | number; nome: string }[] // <- ADICIONADO
}

class GrupoModel {
  private state: GrupoState = {
    grupos: [],
    isLoading: false,
    error: null,
    editando: null,
    selecionado: null,
    syncPending: 0,
    gerentes: [],
    vendedoresDisponiveis: [], // <- ADICIONADO
  }

  private listeners: Set<(state: GrupoState) => void> = new Set()
  private debounceTimer: NodeJS.Timeout | null = null
  private qc: any = null
  private toast: any = null

  constructor() {
    // Monitorar eventos de sincronização
    grupoEventListener.onAll((ev, payload) => {
      console.debug("[GrupoModel] evento recebido:", ev, payload)
      this.updateSyncStatus()
    })
  }

  setDependencies(qc: any, toast: any) {
    this.qc = qc
    this.toast = toast
  }

  getState(): GrupoState {
    return { ...this.state }
  }

  subscribe(listener: (state: GrupoState) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.getState()))
  }

  private setState(updates: Partial<GrupoState>) {
    const next = { ...this.state, ...updates }
    // logs úteis
    if ("grupos" in updates) {
      console.debug("[GrupoModel] setState grupos:", {
        from: this.state.grupos?.length ?? 0,
        to: (updates as any).grupos?.length ?? 0,
      })
    }
    if ("isLoading" in updates) {
      console.debug("[GrupoModel] setState isLoading:", updates.isLoading)
    }
    if ("error" in updates && updates.error) {
      console.error("[GrupoModel] setState error:", updates.error)
    }
    if ("editando" in updates) {
      console.debug("[GrupoModel] setState editando:", updates.editando?.id ?? null)
    }
    if ("selecionado" in updates) {
      console.debug("[GrupoModel] setState selecionado:", updates.selecionado?.id ?? null)
    }
    this.state = next
    this.notifyListeners()
  }

  private updateSyncStatus() {
    const pending = grupoEventListener.getPendingEvents().length
    console.debug("[GrupoModel] sync pending:", pending)
    this.setState({ syncPending: pending })
  }

  // ADICIONE estes dois métodos
  setEditando(grupo: Grupo | null) {
    console.debug("[GrupoModel] setEditando chamada:", grupo?.id ?? null)
    // manter o objeto recebido para permitir edição controlada
    this.setState({ editando: grupo })
  }

  setSelecionado(grupo: Grupo | null) {
    console.debug("[GrupoModel] setSelecionado chamada:", grupo?.id ?? null)
    const ref = grupo
      ? this.state.grupos.find((g) => String(g.id) === String(grupo.id)) ?? grupo
      : null
    this.setState({ selecionado: ref })
  }

  // Atualiza campos do objeto em edição (para onChange dos inputs)
  updateEditando(patch: Partial<Grupo>) {
    if (!this.state.editando) return
    const merged = { ...this.state.editando, ...patch }
    this.setState({ editando: merged })
  }
  
  // Slug simples para code
  private slugify(input?: string): string {
    return (input ?? "")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
  }

  // Normaliza ids string-numérico
  private normalizeId<T extends string | number | null | undefined>(v: T) {
    if (v === null || typeof v === "undefined") return null
    if (typeof v === "string" && /^\d+$/.test(v)) return Number(v)
    return v as any
  }

  // Extrai ids de sellers do objeto bruto do time
  private getTeamSellerIds(raw: any): any[] {
    if (!raw) return []
    if (Array.isArray(raw.sellerIds)) return raw.sellerIds
    if (Array.isArray(raw.sellers)) return raw.sellers
    return []
  }

  // --- DATA FETCHING ---
  private isVendedor(user: any): boolean {
    try {
      const groups = (user.groups || user.userGroups || user.userGroup || []) as any[]
      const names = Array.isArray(groups)
        ? groups.map((g: any) => (g?.name || g?.title || g?.slug || g?.role || "").toString().toLowerCase())
        : []
      const role = (user.role || user.userRole || user.type || "").toString().toLowerCase()
      return names.some((n) => n.includes("vendedor") || n.includes("seller")) || role === "seller" || role === "vendedor"
    } catch {
      return false
    }
  }

  // quem é gerente
  private isGerente(user: any): boolean {
    try {
      const groups = (user.groups || user.userGroups || user.userGroup || []) as any[]
      const names = Array.isArray(groups)
        ? groups.map((g: any) => (g?.name || g?.title || g?.slug || g?.role || "").toString().toLowerCase())
        : []
      const role = (user.role || user.userRole || user.type || "").toString().toLowerCase()
      return names.some((n) => n.includes("gerente") || n.includes("manager")) || role === "manager" || role === "gerente"
    } catch {
      return false
    }
  }

  async fetchGrupos() {
    console.debug("[GrupoModel] fetchGrupos: INICIANDO")
    this.setState({ isLoading: true, error: null })
    try {
      const teams = await getTeams("", 0, 100)
      const users = await getUsers("", 0, 100)
      const sellers = await getSellers("", 0, 100)

      const grupos = this.transformTeamsToGrupos(teams, users, sellers)

      // Derivar gerentes a partir dos users
      const gerentes = (users || [])
        .filter((u: any) => this.isGerente(u))
        .map((u: any) => ({ id: u.id, nome: this.getUserName(u) }))
        .sort((a, b) => a.nome.localeCompare(b.nome))

      // IDs de sellers já usados em algum team
      const usedSellerIds = new Set(
        (teams || []).flatMap((t: any) =>
          (this.getTeamSellerIds(t) || []).map((id: any) => String(id)),
        ),
      )

      // Derivar vendedores disponíveis a partir de sellers NÃO usados em nenhum team
      const vendedoresDisponiveis = (sellers || [])
        .filter((s: any) => !usedSellerIds.has(String(s.id)))
        .map((s: any) => ({ id: s.id, nome: this.getSellerName(s) }))
        .sort((a, b) => a.nome.localeCompare(b.nome))

      console.debug("[GrupoModel] fetchGrupos:", {
        teams: (teams || []).length,
        users: (users || []).length,
        sellers: (sellers || []).length,
        usedSellerIds: usedSellerIds.size,
        grupos: grupos.length,
        gerentes: gerentes.length,
        vendedoresDisponiveis: vendedoresDisponiveis.length,
      })

      // realinhar referências
      const prevEdit = this.state.editando
      const prevSel = this.state.selecionado
      const editando = prevEdit ? grupos.find((g) => String(g.id) === String(prevEdit.id)) ?? null : null
      const selecionado = prevSel ? grupos.find((g) => String(g.id) === String(prevSel.id)) ?? null : null

      this.setState({
        grupos,
        gerentes,
        vendedoresDisponiveis,
        isLoading: false,
        editando,
        selecionado,
      })
      return grupos
    } catch (error: any) {
      console.error("[GrupoModel] fetchGrupos: ERRO", error)
      this.setState({ error: error?.message ?? String(error), isLoading: false })
      throw error
    }
  }

  private getUserName(u: any) {
    return (
      u?.name ||
      [u?.firstName, u?.lastName].filter(Boolean).join(" ") ||
      u?.email ||
      `Usuário ${u?.id}`
    )
  }

  private transformTeamsToGrupos(teams: any[], users: any[], sellers: any[]): Grupo[] {
    console.debug("[GrupoModel] transformTeamsToGrupos: iniciando", (teams || []).length)
    const result = (teams || []).map((team: any, idx: number) => {
      const gerente = users.find((u) => String(u.id) === String(team.managerId))
      const teamSellerIds = this.getTeamSellerIds(team)
      const vendedoresGrupo = (teamSellerIds || [])
        .map((sid: any) => {
          const s = sellers.find((sl) => String(sl.id) === String(sid))
          if (!s) {
            console.warn("[GrupoModel] sellerId sem seller correspondente:", sid)
            return null
          }
          return {
            id: s.id,
            nome: this.getSellerName(s),
            vendas: Number(s.salesAmount ?? 0),
            status: s.active === false ? "inativo" : "ativo",
          }
        })
        .filter(Boolean) as VendedorGrupo[]

      const grupo: Grupo = {
        id: team.id,
        nome: team.name,
        lider: gerente ? this.getUserName(gerente) : team.managerId ?? "",
        liderUserId: team.managerId ?? null,
        membros: vendedoresGrupo.length,
        metaMensal: Number(team.quota ?? 0),
        vendidoMes: vendedoresGrupo.reduce((acc: number, v) => acc + (Number(v.vendas ?? 0)), 0),
        status: team.active === false ? "inativo" : "ativo",
        descricao: team.description ?? "",
        vendedores: vendedoresGrupo,
        raw: team,
      }
      console.debug("[GrupoModel] transform team -> grupo", {
        idx,
        teamId: team.id,
        name: team.name,
        sellers: vendedoresGrupo.length,
        managerId: team.managerId,
      })
      return grupo
    })
    console.debug("[GrupoModel] transformTeamsToGrupos: concluído", result.length)
    return result
  }

  private getSellerName(seller: any): string {
    if (seller.user) {
      return `${seller.user.firstName ?? ""} ${seller.user.lastName ?? ""}`.trim()
    }
    return seller.name ?? seller.user?.email ?? String(seller.id)
  }

  // --- CRUD OPERATIONS COM AUTO-SYNC ---
  async criarGrupo(novoGrupo: Partial<Grupo>) {
    console.debug("[GrupoModel] criarGrupo: payload", novoGrupo)
    try {
      const body = {
        name: novoGrupo.nome,
        description: novoGrupo.descricao,
        quota: Number(novoGrupo.metaMensal || 0),
        managerId: novoGrupo.liderUserId ?? null,
        active: true,
        code: this.slugify(novoGrupo.nome),
        sellers: [] as Array<number | string>,
      }

      const resultado = await createTeam(body)
      console.debug("[GrupoModel] criarGrupo: resultado API", resultado)
      this.toast?.({ title: "Grupo criado com sucesso", variant: "default" })

      grupoEventListener.emit("create", resultado as Grupo)

      await this.fetchGrupos()
      return resultado
    } catch (error: any) {
      console.error("[GrupoModel] criarGrupo: ERRO", error)
      this.toast?.({ title: "Erro ao criar grupo", variant: "destructive" })
      throw error
    }
  }

  async atualizarGrupo(id: string | number, updates: Partial<Grupo>) {
    console.debug("[GrupoModel] atualizarGrupo: id/updates", id, updates)
    try {
      const atual = this.state.grupos.find((g) => String(g.id) === String(id))
      const raw = atual?.raw || {}
      const currentSellerIds = this.getTeamSellerIds(raw)
      const managerIdNorm = this.normalizeId(updates.liderUserId)

      const prevCard = atual
        ? {
            id: atual.id,
            nome: atual.nome,
            liderUserId: atual.liderUserId,
            lider: atual.lider,
            membros: atual.membros,
            metaMensal: atual.metaMensal,
            status: atual.status,
          }
        : undefined

      // Fallback para manter valores atuais quando o campo não foi alterado
      const body: any = {
        id: Number(id),
        name: typeof updates.nome !== "undefined" ? updates.nome : raw.name,
        description: typeof updates.descricao !== "undefined" ? updates.descricao : raw.description,
        quota:
          typeof updates.metaMensal !== "undefined"
            ? Number(updates.metaMensal || 0)
            : Number(raw.quota ?? 0),
        managerId:
          typeof updates.liderUserId !== "undefined"
            ? managerIdNorm
            : this.normalizeId(raw.managerId) ?? null,
        active:
          typeof updates.status !== "undefined" ? updates.status === "ativo" : Boolean(raw.active),
        // Campos exigidos pelo backend
        code: raw.code ?? this.slugify(atual?.nome),
        sellers: Array.isArray(currentSellerIds) ? currentSellerIds : [],
        sellerIds: Array.isArray(currentSellerIds) ? currentSellerIds : [],
      }

      console.debug("[GrupoModel] atualizarGrupo REQUEST", { id, body, cardBefore: prevCard })

      const res = await updateTeam(Number(id), body)
      console.debug("[GrupoModel] atualizarGrupo: API OK", { id, res })

      const grupos = this.state.grupos.map((g) => {
        if (String(g.id) !== String(id)) return g
        const merged = { ...g, ...updates, raw: { ...g.raw, ...body } }
        // se mudou o líder, atualiza nome exibido
        if (typeof updates.liderUserId !== "undefined") {
          const novoNome =
            (this.state.gerentes || []).find((u) => String(u.id) === String(managerIdNorm))?.nome ??
            merged.lider
          merged.lider = novoNome
          merged.liderUserId = managerIdNorm
        }
        // manter consistência de nome/descrição/meta/ativo caso não tenham sido alterados
        if (typeof updates.nome === "undefined") merged.nome = raw.name ?? merged.nome
        if (typeof updates.descricao === "undefined") merged.descricao = raw.description ?? merged.descricao
        if (typeof updates.metaMensal === "undefined") merged.metaMensal = Number(raw.quota ?? merged.metaMensal)
        if (typeof updates.status === "undefined")
          merged.status = raw.active === false ? "inativo" : "ativo"
        return merged
      })
      this.setState({ grupos })

      const after = grupos.find((g) => String(g.id) === String(id))
      console.debug("[GrupoModel] atualizarGrupo UPDATED", {
        id,
        cardAfter: {
          id: after?.id,
          nome: after?.nome,
          liderUserId: after?.liderUserId,
          lider: after?.lider,
          membros: after?.membros,
          metaMensal: after?.metaMensal,
          status: after?.status,
        },
      })

      const grupoAtualizado = grupos.find((g) => String(g.id) === String(id))
      if (grupoAtualizado) {
        grupoEventListener.emit("update", grupoAtualizado)
      }

      return grupoAtualizado
    } catch (error: any) {
      console.error("[GrupoModel] atualizarGrupo: ERRO", error)
      this.toast?.({ title: "Erro ao atualizar grupo", variant: "destructive" })
      throw error
    }
  }

  async adicionarVendedor(grupoId: string | number, vendedorId: string | number) {
    console.debug("[GrupoModel] adicionarVendedor: grupoId/vendedorId", grupoId, vendedorId)
    try {
      const grupo = this.state.grupos.find((g) => String(g.id) === String(grupoId))
      if (!grupo) throw new Error("Grupo não encontrado")

      const vendedorIdNorm =
        typeof vendedorId === "string" && /^\d+$/.test(vendedorId) ? Number(vendedorId) : vendedorId

      const currentSellerIds = this.getTeamSellerIds(grupo.raw)
      const updatedSellerIds = Array.from(new Set([...(currentSellerIds || []), vendedorIdNorm]))
     const addBody = {
       code: grupo.raw?.code ?? this.slugify(grupo.nome),
       sellers: updatedSellerIds,
       sellerIds: updatedSellerIds,
     }
     console.debug("[GrupoModel] adicionarVendedor REQUEST", {
       grupoId,
       body: addBody,
       card: { id: grupo.id, nome: grupo.nome, membros: grupo.membros },
     })
     await updateTeam(Number(grupoId), addBody)

      await this.fetchGrupos()

      const grupoAtualizado = this.state.grupos.find((g) => String(g.id) === String(grupoId))
      if (grupoAtualizado) {
        grupoEventListener.emit("addSeller", grupoAtualizado, { vendedorId: vendedorIdNorm })
      }

      this.toast?.({ title: "Vendedor adicionado ao grupo", variant: "default" })
    } catch (error: any) {
      console.error("[GrupoModel] adicionarVendedor: ERRO", error)
      this.toast?.({ title: "Erro ao adicionar vendedor", variant: "destructive" })
      throw error
    }
  }

  async removerVendedor(grupoId: string | number, vendedorId: string | number) {
    console.debug("[GrupoModel] removerVendedor: grupoId/vendedorId", grupoId, vendedorId)
    try {
      const grupo = this.state.grupos.find((g) => String(g.id) === String(grupoId))
      if (!grupo) throw new Error("Grupo não encontrado")

      const currentSellerIds = this.getTeamSellerIds(grupo.raw)
      const updatedSellerIds = (currentSellerIds || []).filter(
        (id: any) => String(id) !== String(vendedorId)
      )
     const remBody = {
       code: grupo.raw?.code ?? this.slugify(grupo.nome),
       sellers: updatedSellerIds,
       sellerIds: updatedSellerIds,
     }
     console.debug("[GrupoModel] removerVendedor REQUEST", {
       grupoId,
       body: remBody,
       card: { id: grupo.id, nome: grupo.nome, membros: grupo.membros },
     })
     await updateTeam(Number(grupoId), remBody)

      const grupos = this.state.grupos.map((g) => {
        if (g.id === grupoId) {
          return {
            ...g,
            vendedores: g.vendedores.filter((v) => String(v.id) !== String(vendedorId)),
            membros: Math.max(0, (g.membros ?? 0) - 1),
            raw: { ...g.raw, sellers: updatedSellerIds, sellerIds: updatedSellerIds },
          }
        }
        return g
      })
      this.setState({ grupos })

      const grupoAtualizado = grupos.find((g) => g.id === grupoId)
      if (grupoAtualizado) {
        grupoEventListener.emit("removeSeller", grupoAtualizado, { vendedorId })
      }

      this.toast?.({ title: "Vendedor removido do grupo", variant: "default" })
    } catch (error: any) {
      console.error("[GrupoModel] removerVendedor: ERRO", error)
      this.toast?.({ title: "Erro ao remover vendedor", variant: "destructive" })
      throw error
    }
  }

  async deletarGrupo(id: string | number) {
    console.debug("[GrupoModel] deletarGrupo:", id)
    try {
      await deleteTeam(Number(id))
      const grupos = this.state.grupos.filter((g) => String(g.id) !== String(id))
      let { selecionado, editando } = this.state
      if (selecionado && String(selecionado.id) === String(id)) selecionado = null
      if (editando && String(editando.id) === String(id)) editando = null
      this.setState({ grupos, selecionado, editando })
      grupoEventListener.emit?.("delete", { id })
      this.toast?.({ title: "Grupo deletado", variant: "default" })
    } catch (error: any) {
      console.error("[GrupoModel] deletarGrupo: ERRO", error)
      this.toast?.({ title: "Erro ao deletar grupo", variant: "destructive" })
      throw error
    }
  }

  // Salvar o grupo atualmente em edição
  async salvarEdicaoAtual() {
    const g = this.state.editando
    if (!g) throw new Error("Nenhum grupo em edição")
    console.debug("[GrupoModel] salvarEdicaoAtual:", g.id)
    const atualizado = await this.atualizarGrupo(g.id, {
      nome: g.nome,
      descricao: g.descricao,
      metaMensal: g.metaMensal,
      liderUserId: this.normalizeId(g.liderUserId),
      status: g.status,
    })
    this.toast?.({ title: "Alterações salvas", variant: "default" })
    return atualizado
  }

  // --- UTILITIES ---
  calcularPerformance(vendido: number, meta: number): number {
    const v = Number(vendido ?? 0)
    const m = Number(meta ?? 0)
    if (!m || m <= 0) return 0
    const pct = Math.round((v / m) * 100)
    return Math.max(0, Math.min(999, pct))
  }

  getGrupoById(id: string | number): Grupo | undefined {
    return this.state.grupos.find((g) => String(g.id) === String(id))
  }

  /**
   * Sincronizar todos os eventos pendentes
   */
  async forceSync() {
    await grupoEventListener.forceSyncAll()
    this.updateSyncStatus()
  }
}

// --- Singleton instance ---
export const grupoModel = new GrupoModel()

// --- React Hook para usar o model ---
export function useGruposModel() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const [state, setState] = useState<GrupoState>(grupoModel.getState())

  // Set dependencies (uma única vez)
  useEffect(() => {
    grupoModel.setDependencies(qc, toast)
  }, [qc, toast])

  // Subscribe to model changes
  useEffect(() => {
    const unsubscribe = grupoModel.subscribe((s) => {
      console.debug("[useGruposModel] state atualizado:", {
        grupos: s.grupos.length,
        isLoading: s.isLoading,
        error: s.error,
        editando: s.editando?.id ?? null,
        selecionado: s.selecionado?.id ?? null,
      })
      setState(s)
    })
    return unsubscribe
  }, [])

  // Fetch on mount (com log adicional)
  useEffect(() => {
    const has = grupoModel.getState().grupos.length
    if (!has) {
      console.debug("[useGruposModel] mount -> fetchGrupos()")
      grupoModel.fetchGrupos().catch((e) => console.error("fetchGrupos error", e))
    }
  }, [])

  return {
    // State
    ...state,
    gruposFiltrados: state.grupos,
    gerentes: state.gerentes || [],
    vendedoresDisponiveis: state.vendedoresDisponiveis || [],

    // Actions
    criarGrupo: grupoModel.criarGrupo.bind(grupoModel),
    atualizarGrupo: grupoModel.atualizarGrupo.bind(grupoModel),
    deletarGrupo: grupoModel.deletarGrupo.bind(grupoModel),
    adicionarVendedor: grupoModel.adicionarVendedor.bind(grupoModel),
    removerVendedor: grupoModel.removerVendedor.bind(grupoModel),
    setEditando: grupoModel.setEditando.bind(grupoModel),
    setSelecionado: grupoModel.setSelecionado.bind(grupoModel),
    updateEditando: grupoModel.updateEditando.bind(grupoModel),
    salvarEdicaoAtual: grupoModel.salvarEdicaoAtual.bind(grupoModel),
    calcularPerformance: grupoModel.calcularPerformance.bind(grupoModel),
    getGrupoById: grupoModel.getGrupoById.bind(grupoModel),
  }
}