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
  gerentes?: { id: string | number; nome: string }[]
  vendedoresDisponiveis?: { id: string | number; nome: string }[]
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
    vendedoresDisponiveis: [],
  }

  private listeners: Set<(state: GrupoState) => void> = new Set()
  private toast: any = null
  private qc: any = null

  constructor() {
    grupoEventListener.onAll(() => this.updateSyncStatus())
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
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l(this.getState()))
  }

  private setState(updates: Partial<GrupoState>) {
    this.state = { ...this.state, ...updates }
    this.notifyListeners()
  }

  private updateSyncStatus() {
    const pending = grupoEventListener.getPendingEvents().length
    this.setState({ syncPending: pending })
  }

  // ---------- Helpers ----------
  private slugify(input?: string): string {
    return (input ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  private normalizeId<T extends string | number | null | undefined>(v: T) {
    if (v === null || typeof v === "undefined") return null
    // Always return as string since backend expects String for managerId
    return String(v)
  }

  private sanitizeSellerIds(ids: any[]): number[] {
    return Array.from(
      new Set(
        (ids || [])
          .map((v) => {
            if (v === null || typeof v === "undefined") return null
            if (typeof v === "string" && /^\d+$/.test(v)) return Number(v)
            if (typeof v === "number" && Number.isFinite(v)) return v
            return null
          })
          .filter((v): v is number => v !== null)
      )
    )
  }

  private getTeamSellerIds(raw: any): number[] {
    if (!raw) return []
    // aceita: sellerIds: number[] OU sellers: Array<number | { id: number }>
    let list: any[] = []
    if (Array.isArray(raw.sellerIds)) {
      list = raw.sellerIds
    } else if (Array.isArray(raw.sellers)) {
      list = raw.sellers.map((v: any) => (v && typeof v === "object" ? v.id : v))
    }
    return this.sanitizeSellerIds(list)
  }

  private getUserName(u: any) {
    return (
      u?.name ||
      [u?.firstName, u?.lastName].filter(Boolean).join(" ") ||
      u?.email ||
      `Usuário ${u?.id}`
    )
  }

  private getSellerName(seller: any): string {
    if (seller?.user) {
      return `${seller.user.firstName ?? ""} ${seller.user.lastName ?? ""}`.trim()
    }
    return seller?.name ?? seller?.user?.email ?? String(seller?.id)
  }

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

  // Tenta resolver o grupo. Se não encontrar, retorna null (não lança).
  private getGrupoOrNull(grupoId?: string | number | null): Grupo | null {
    const gidRaw = typeof grupoId !== "undefined" && grupoId !== null ? grupoId : this.state.selecionado?.id
    const gid = gidRaw === "" || gidRaw === "undefined" ? null : gidRaw
    let grupo = this.state.grupos.find((g) => String(g.id) === String(gid)) || null
    if (!grupo) {
      // fallback: objeto em edição ou selecionado
      if (this.state.editando && (gid === null || String(this.state.editando.id) === String(gid))) {
        grupo = this.state.editando
      } else if (this.state.selecionado && (gid === null || String(this.state.selecionado.id) === String(gid))) {
        grupo = this.state.selecionado
      }
    }
    if (!grupo) {
      console.warn("[GrupoModel] grupo não encontrado", {
        requestedId: gid,
        editando: this.state.editando?.id,
        selecionado: this.state.selecionado?.id,
        disponiveis: this.state.grupos.map((g) => g.id),
      })
      return null
    }
    return grupo
  }

  // ---------- Fetch/Transform ----------
  async fetchGrupos() {
    this.setState({ isLoading: true, error: null })
    try {
      const teams = await getTeams("", 0, 100)
      const users = await getUsers("", 0, 100)
      const sellers = await getSellers("", 0, 100)

      console.debug("[GrupoModel] fetchGrupos dados carregados", {
        teams: teams?.length ?? 0,
        users: users?.length ?? 0,
        sellers: sellers?.length ?? 0,
      })

      const grupos = this.transformTeamsToGrupos(teams, users, sellers)

      const gerentes = (users || [])
        .filter((u: any) => this.isGerente(u))
        .map((u: any) => ({ id: u.id, nome: this.getUserName(u) }))
        .sort((a, b) => a.nome.localeCompare(b.nome))

      const usedSellerIds = new Set(
        (teams || []).flatMap((t: any) => (this.getTeamSellerIds(t) || []).map((id: any) => String(id)))
      )

      const vendedoresDisponiveis = (sellers || [])
        .filter((s: any) => !usedSellerIds.has(String(s.id)))
        .map((s: any) => ({ id: s.id, nome: this.getSellerName(s) }))
        .sort((a, b) => a.nome.localeCompare(b.nome))

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
      this.setState({ error: error?.message ?? String(error), isLoading: false })
      throw error
    }
  }

  private transformTeamsToGrupos(teams: any[], users: any[], sellers: any[]): Grupo[] {
    return (teams || []).map((team: any) => {
      const gerente = users.find((u) => String(u.id) === String(team.managerId))
      
      console.debug("[GrupoModel] transforming team", {
        teamId: team.id,
        teamName: team.name,
        managerId: team.managerId,
        gerenteFound: gerente ? this.getUserName(gerente) : null,
        totalUsers: users.length,
      })
      
      const teamSellerIds = this.getTeamSellerIds(team)
      const vendedoresGrupo: VendedorGrupo[] = (teamSellerIds || [])
        .map((sid: any) => {
          const s = sellers.find((sl) => String(sl.id) === String(sid))
          if (!s) return null
          return {
            id: s.id,
            nome: this.getSellerName(s),
            vendas: Number(s.salesAmount ?? 0),
            status: s.active === false ? "inativo" : "ativo",
          }
        })
        .filter(Boolean) as VendedorGrupo[]

      const liderNome = gerente ? this.getUserName(gerente) : (team.managerId ? `Líder ${team.managerId.substring(0, 8)}` : "Sem líder")
      
      return {
        id: team.id,
        nome: team.name,
        lider: liderNome,
        liderUserId: team.managerId ?? null,
        membros: vendedoresGrupo.length,
        metaMensal: Number(team.quota ?? 0),
        vendidoMes: vendedoresGrupo.reduce((acc: number, v) => acc + (Number(v.vendas ?? 0)), 0),
        status: team.active === false ? "inativo" : "ativo",
        descricao: team.description ?? "",
        vendedores: vendedoresGrupo,
        raw: team,
      } as Grupo
    })
  }

  // ---------- Mutations ----------
  setEditando(grupo: Grupo | null) {
    // Cria uma CÓPIA para permitir edição sem mutar o original
    const ref = grupo ? { ...grupo } : null
    this.setState({ editando: ref })
  }

  setSelecionado(grupo: Grupo | null) {
    const ref = grupo ? this.state.grupos.find((g) => String(g.id) === String(grupo.id)) ?? grupo : null
    this.setState({ selecionado: ref })
  }

  updateEditando(patch: Partial<Grupo>) {
    if (!this.state.editando) return
    const next = { ...this.state.editando, ...patch }
    // Se escolher liderUserId mas nome ainda não resolvido, tenta resolver
    if (patch.liderUserId && (!patch.lider || patch.lider === '(sem nome)')) {
      const u = this.state.grupos.find(g => String(g.liderUserId) === String(patch.liderUserId))
      if (u && u.lider) next.lider = u.lider
    }
    this.setState({ editando: next })
  }

  async criarGrupo(novoGrupo: Partial<Grupo>) {
    try {
      const body = {
        name: novoGrupo.nome,
        description: novoGrupo.descricao,
        quota: Number(novoGrupo.metaMensal || 0),
        managerId: novoGrupo.liderUserId ?? null,
        active: true,
        code: this.resolveTeamCode({}, novoGrupo.nome),
        sellerIds: [] as Array<number>,
      }
      const res = await createTeam(body)
      this.toast?.({ title: "Grupo criado com sucesso" })
      await this.fetchGrupos()
      return res
    } catch (e) {
      this.toast?.({ title: "Erro ao criar grupo", variant: "destructive" })
      throw e
    }
  }

  // Monta um payload completo para PUT no backend, com fallbacks seguros
  private buildTeamUpdateBody(
    grupo: Grupo,
    raw: any,
    overrides?: Partial<{
      name: string
      description: string
      quota: number
      managerId: string | null
      active: boolean
      code: string
      sellerIds: number[]
    }>,
  ) {
    const sellerIds = this.sanitizeSellerIds(
      typeof overrides?.sellerIds !== "undefined" ? overrides!.sellerIds! : this.getTeamSellerIds(raw),
    )
    // Ensure managerId is always a string or null
    const managerId = typeof overrides?.managerId !== "undefined"
      ? overrides!.managerId
      : this.normalizeId(raw?.managerId ?? grupo.liderUserId) ?? null
    
    return {
      id: Number(grupo.id),
      name: typeof overrides?.name !== "undefined" ? overrides!.name! : (raw?.name ?? grupo.nome ?? ""),
      description:
        typeof overrides?.description !== "undefined"
          ? overrides!.description!
          : (raw?.description ?? grupo.descricao ?? ""),
      quota:
        typeof overrides?.quota !== "undefined"
          ? Number(overrides!.quota!)
          : Number((raw?.quota ?? grupo.metaMensal ?? 0)),
      managerId,
      active:
        typeof overrides?.active !== "undefined"
          ? overrides!.active
          : (typeof raw?.active === "boolean" ? raw.active : grupo.status === "ativo"),
      code: typeof overrides?.code !== "undefined" ? overrides!.code! : this.resolveTeamCode(raw, grupo.nome, grupo.id),
      sellerIds,
    }
  }

  async atualizarGrupo(id: string | number, updates: Partial<Grupo>) {
    try {
      const atual = this.getGrupoOrNull(id)
      if (!atual) {
        this.toast?.({ title: "Selecione um grupo para salvar", variant: "destructive" })
        return null
      }
      const raw = atual.raw || {}
      const managerIdNorm =
        typeof updates.liderUserId !== "undefined" ? this.normalizeId(updates.liderUserId) : undefined
      const body = this.buildTeamUpdateBody(atual, raw, {
        name: updates.nome,
        description: updates.descricao,
        quota: typeof updates.metaMensal !== "undefined" ? Number(updates.metaMensal || 0) : undefined,
        managerId: managerIdNorm as any,
        active: typeof updates.status !== "undefined" ? updates.status === "ativo" : undefined,
      })

      console.debug("[GrupoModel] atualizarGrupo REQUEST", { id: atual.id, body })
      const res = await updateTeam(Number(atual.id), body)
      console.debug("[GrupoModel] atualizarGrupo OK", { id, res })

      // Refetch para garantir que os dados estão sincronizados com o backend
      await this.fetchGrupos()
      return this.state.grupos.find((g) => String(g.id) === String(atual.id)) ?? null
    } catch (e) {
      console.error("[GrupoModel] atualizarGrupo ERRO", e)
      this.toast?.({ title: "Erro ao atualizar grupo", variant: "destructive" })
      throw e
    }
  }

  async adicionarVendedor(grupoId: string | number, vendedorId: string | number) {
    try {
      const grupo = this.getGrupoOrNull(grupoId)
      if (!grupo) {
        this.toast?.({ title: "Selecione um grupo antes de adicionar", variant: "destructive" })
        return
      }
      const vendedorIdNorm =
        typeof vendedorId === "string" && /^\d+$/.test(vendedorId) ? Number(vendedorId) : (vendedorId as number)

      const base = this.getTeamSellerIds(grupo.raw)
      const updatedSellerIds = this.sanitizeSellerIds([...(base || []), vendedorIdNorm])
      const body = this.buildTeamUpdateBody(grupo, grupo.raw, { sellerIds: updatedSellerIds })
       console.debug("[GrupoModel] adicionarVendedor REQUEST", {
         grupoId: grupoId ?? grupo.id, body
       })
      await updateTeam(Number(grupoId ?? grupo.id), body)

      await this.fetchGrupos()
      this.toast?.({ title: "Vendedor adicionado ao grupo" })
    } catch (e) {
      console.error("[GrupoModel] adicionarVendedor ERRO", e)
      this.toast?.({ title: "Erro ao adicionar vendedor", variant: "destructive" })
      throw e
    }
  }

  async removerVendedor(grupoId: string | number, vendedorId: string | number) {
    try {
      const grupo = this.getGrupoOrNull(grupoId)
      if (!grupo) {
        this.toast?.({ title: "Selecione um grupo antes de remover", variant: "destructive" })
        return
      }
      const base = this.getTeamSellerIds(grupo.raw)
      const updatedSellerIds = this.sanitizeSellerIds((base || []).filter((id: any) => String(id) !== String(vendedorId)))
      const body = this.buildTeamUpdateBody(grupo, grupo.raw, { sellerIds: updatedSellerIds })
       console.debug("[GrupoModel] removerVendedor REQUEST", {
         grupoId: grupoId ?? grupo.id, body
       })
       await updateTeam(Number(grupoId ?? grupo.id), body)

      const grupos = this.state.grupos.map((g) => {
        if (String(g.id) !== String(grupo.id)) return g
        return {
          ...g,
          vendedores: g.vendedores.filter((v) => String(v.id) !== String(vendedorId)),
          membros: Math.max(0, (g.membros ?? 0) - 1),
          raw: { ...g.raw, ...body },
        }
      })
      this.setState({ grupos })

      this.toast?.({ title: "Vendedor removido do grupo" })
    } catch (e) {
      console.error("[GrupoModel] removerVendedor ERRO", e)
      this.toast?.({ title: "Erro ao remover vendedor", variant: "destructive" })
      throw e
    }
  }

  async deletarGrupo(id: string | number) {
    try {
      await deleteTeam(Number(id))
      const grupos = this.state.grupos.filter((g) => String(g.id) !== String(id))
      const resetSel = this.state.selecionado && String(this.state.selecionado.id) === String(id) ? null : this.state.selecionado
      const resetEdit = this.state.editando && String(this.state.editando.id) === String(id) ? null : this.state.editando
      this.setState({ grupos, selecionado: resetSel, editando: resetEdit })
      this.toast?.({ title: "Grupo deletado" })
    } catch (e) {
      console.error("[GrupoModel] deletarGrupo ERRO", e)
      this.toast?.({ title: "Erro ao deletar grupo", variant: "destructive" })
      throw e
    }
  }

  async salvarEdicaoAtual() {
    const g = this.state.editando
    if (!g) throw new Error("Nenhum grupo em edição")
    return this.atualizarGrupo(g.id, {
      nome: g.nome,
      descricao: g.descricao,
      metaMensal: g.metaMensal,
      liderUserId: this.normalizeId(g.liderUserId),
      status: g.status,
    })
  }

  async forceSync() {
    await grupoEventListener.forceSyncAll()
    this.updateSyncStatus()
  }

  calcularPerformance(vendido: number, meta: number): number {
    const v = Number(vendido ?? 0)
    const m = Number(meta ?? 0)
    if (m <= 0) return 0
    return Math.round((v / m) * 100)
  }

  getGrupoById(id: string | number): Grupo | undefined {
    return this.state.grupos.find((g) => String(g.id) === String(id))
  }

  // Gera um code válido a partir do raw/nome/id (nunca vazio)
  private resolveTeamCode(raw: any, nome?: string, id?: string | number) {
    const rawCode = typeof raw?.code === "string" ? raw.code.trim() : ""
    const byName = this.slugify(nome || raw?.name || "")
    return rawCode || byName || `team-${String(id ?? "").trim() || "novo"}`
  }

  // Constrói payload de sellers aceito pelo backend (objetos { id })
  private buildSellersObjects(ids: number[]) {
    return (ids || []).map((id) => ({ id }))
  }
}

// --- Singleton instance ---
export const grupoModel = new GrupoModel()

// --- React Hook ---
export function useGruposModel() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const [state, setState] = useState<GrupoState>(grupoModel.getState())

  useEffect(() => {
    grupoModel.setDependencies(qc, toast)
  }, [qc, toast])

  useEffect(() => {
    const unsub = grupoModel.subscribe((s) => setState(s))
    return unsub
  }, [])

  useEffect(() => {
    if (!grupoModel.getState().grupos.length) {
      grupoModel.fetchGrupos().catch((e) => console.error("fetchGrupos error", e))
    }
  }, [])

  // WebSocket: refetch teams/leaders on team or user updates
  const { on, off, isConnected } = require('@/contexts/websocket-context').useWebSocket()
  useEffect(() => {
    if (!isConnected) return
    const handler = () => grupoModel.fetchGrupos().catch(() => {})
    on('team:updated', handler)
    on('user:updated', handler)
    return () => { off('team:updated', handler); off('user:updated', handler) }
  }, [isConnected])

  return {
    ...state,
    gruposFiltrados: state.grupos,
    gerentes: state.gerentes || [],
    vendedoresDisponiveis: state.vendedoresDisponiveis || [],

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
    forceSync: grupoModel.forceSync.bind(grupoModel),
    model: grupoModel,
  }
}