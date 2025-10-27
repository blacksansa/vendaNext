"use client"

import { useState, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import {
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  getUsers,
  getSellers,
} from "@/lib/api.client"
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
  liderUserId: string | null
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
}

class GrupoModel {
  private state: GrupoState = {
    grupos: [],
    isLoading: false,
    error: null,
    editando: null,
    selecionado: null,
    syncPending: 0,
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
    // manter referência consistente (por id) quando possível
    const ref = grupo
      ? this.state.grupos.find((g) => String(g.id) === String(grupo.id)) ?? grupo
      : null
    this.setState({ editando: ref })
  }

  setSelecionado(grupo: Grupo | null) {
    console.debug("[GrupoModel] setSelecionado chamada:", grupo?.id ?? null)
    const ref = grupo
      ? this.state.grupos.find((g) => String(g.id) === String(grupo.id)) ?? grupo
      : null
    this.setState({ selecionado: ref })
  }

  // --- DATA FETCHING ---
  async fetchGrupos() {
    console.debug("[GrupoModel] fetchGrupos: INICIANDO")
    this.setState({ isLoading: true, error: null })
    try {
      const teams = await getTeams("", 0, 100)
      const users = await getUsers("", 0, 100)
      const sellers = await getSellers("", 0, 100)
      console.debug("[GrupoModel] fetchGrupos: dados recebidos", {
        teams: (teams || []).length,
        users: (users || []).length,
        sellers: (sellers || []).length,
        sampleTeam: teams?.[0],
      })

      const grupos = this.transformTeamsToGrupos(teams, users, sellers)
      console.debug("[GrupoModel] fetchGrupos: grupos transformados", {
        total: grupos.length,
        ids: grupos.map((g) => g.id),
      })

      // realinhar referências de editando/selecionado após refetch
      const prevEdit = this.state.editando
      const prevSel = this.state.selecionado
      const editando =
        prevEdit ? grupos.find((g) => String(g.id) === String(prevEdit.id)) ?? null : null
      const selecionado =
        prevSel ? grupos.find((g) => String(g.id) === String(prevSel.id)) ?? null : null

      this.setState({ grupos, isLoading: false, editando, selecionado })
      console.debug("[GrupoModel] fetchGrupos: FINALIZADO")
      return grupos
    } catch (error: any) {
      console.error("[GrupoModel] fetchGrupos: ERRO", error)
      this.setState({ error: error?.message ?? String(error), isLoading: false })
      this.toast?.({ title: "Erro ao carregar grupos", variant: "destructive" })
      throw error
    }
  }

  private transformTeamsToGrupos(teams: any[], users: any[], sellers: any[]): Grupo[] {
    console.debug("[GrupoModel] transformTeamsToGrupos: iniciando", (teams || []).length)
    const result = (teams || []).map((team: any, idx: number) => {
      const gerente = users.find((u) => String(u.id) === String(team.managerId))
      const vendedoresGrupo = (team.sellerIds || [])
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

  private getUserName(user: any): string {
    if (user.firstName || user.lastName) {
      return `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
    }
    return user.name ?? user.email ?? String(user.id)
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
      const body = {
        name: updates.nome,
        description: updates.descricao,
        quota: Number(updates.metaMensal || 0),
        managerId: updates.liderUserId ?? null,
        active: updates.status === "ativo",
      }

      updateTeam(id as number, body)
        .then((res) => console.debug("[GrupoModel] atualizarGrupo: API OK", res))
        .catch((error) => console.error("[GrupoModel] atualizarGrupo: API ERRO", error))

      const grupos = this.state.grupos.map((g) =>
        g.id === id ? { ...g, ...updates } : g
      )
      this.setState({ grupos })

      const grupoAtualizado = grupos.find((g) => g.id === id)
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

  async deletarGrupo(id: string | number) {
    console.debug("[GrupoModel] deletarGrupo: id", id)
    try {
      // otimista: remover local e limpar seleção
      const grupos = this.state.grupos.filter((g) => String(g.id) !== String(id))
      this.setState({ grupos, selecionado: null, editando: null })

      await deleteTeam(id as number)
      console.debug("[GrupoModel] deletarGrupo: API OK")

      this.toast?.({ title: "Grupo deletado com sucesso", variant: "default" })
      await this.fetchGrupos()
    } catch (error: any) {
      console.error("[GrupoModel] deletarGrupo: ERRO", error)
      this.toast?.({ title: "Erro ao deletar grupo", variant: "destructive" })
      // tentar restaurar estado consistente
      await this.fetchGrupos().catch(() => {})
      throw error
    }
  }

  async adicionarVendedor(grupoId: string | number, vendedorId: string | number) {
    console.debug("[GrupoModel] adicionarVendedor: grupoId/vendedorId", grupoId, vendedorId)
    try {
      const grupo = this.state.grupos.find((g) => g.id === grupoId)
      if (!grupo) throw new Error("Grupo não encontrado")

      const updatedSellerIds = [...(grupo.raw.sellerIds || []), vendedorId]
      await updateTeam(grupoId as number, { sellerIds: updatedSellerIds })

      await this.fetchGrupos()

      const grupoAtualizado = this.state.grupos.find((g) => g.id === grupoId)
      if (grupoAtualizado) {
        grupoEventListener.emit("addSeller", grupoAtualizado, { vendedorId })
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
      const grupo = this.state.grupos.find((g) => g.id === grupoId)
      if (!grupo) throw new Error("Grupo não encontrado")

      const updatedSellerIds = (grupo.raw.sellerIds || []).filter(
        (id: any) => String(id) !== String(vendedorId)
      )
      await updateTeam(grupoId as number, { sellerIds: updatedSellerIds })

      const grupos = this.state.grupos.map((g) => {
        if (g.id === grupoId) {
          return {
            ...g,
            vendedores: g.vendedores.filter((v) => String(v.id) !== String(vendedorId)),
            membros: Math.max(0, (g.membros ?? 0) - 1),
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

  // --- UTILITIES ---
  calcularPerformance(vendido: number, meta: number): number {
    const v = Number(vendido ?? 0)
    const m = Number(meta ?? 0)
    if (!m || m <= 0) return 0
    const pct = Math.round((v / m) * 100)
    return Math.max(0, Math.min(999, pct))
  }

  getGrupoById(id: string | number): Grupo | undefined {
    return this.state.grupos.find((g) => g.id === id)
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
    console.debug("[useGruposModel] mount: iniciando fetchGrupos()")
    grupoModel.fetchGrupos()
  }, [])

  return {
    // State
    ...state,
    gruposFiltrados: state.grupos,

    // Actions
    criarGrupo: grupoModel.criarGrupo.bind(grupoModel),
    atualizarGrupo: grupoModel.atualizarGrupo.bind(grupoModel),
    deletarGrupo: grupoModel.deletarGrupo.bind(grupoModel),
    adicionarVendedor: grupoModel.adicionarVendedor.bind(grupoModel),
    removerVendedor: grupoModel.removerVendedor.bind(grupoModel),
    setEditando: grupoModel.setEditando.bind(grupoModel),
    setSelecionado: grupoModel.setSelecionado.bind(grupoModel),
    calcularPerformance: grupoModel.calcularPerformance.bind(grupoModel),
    getGrupoById: grupoModel.getGrupoById.bind(grupoModel),
    forceSync: grupoModel.forceSync.bind(grupoModel),

    eventListener: grupoEventListener,
    model: grupoModel,
  }
}

