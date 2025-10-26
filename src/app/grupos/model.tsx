"use client"

import { useState, useEffect, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchTeams,
  fetchSellers,
  fetchUsers,
  createTeamService,
  updateTeamService,
} from "./service"

export function useGruposModel() {
  const qc = useQueryClient()

  // Queries
  const { data: teams = [] } = useQuery({ queryKey: ["teams"], queryFn: () => fetchTeams("", 0, 100) })
  const { data: sellers = [] } = useQuery({ queryKey: ["sellers"], queryFn: () => fetchSellers("", 0, 100) })
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: () => fetchUsers("", 0, 100) })

  // Mutations
  const createTeamMutation = useMutation({
    mutationFn: (p: any) => createTeamService(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teams"] }),
  })

  const updateTeamMutation = useMutation({
    mutationFn: ({ id, data }: any) => updateTeamService(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teams"] }),
  })

  // Transform teams to grupos format
  const gruposSincronizados = useMemo(() => {
    return (teams || []).map((team: any) => {
      const gerente = (users || []).find((u: any) => String(u.id) === String(team.managerId))
      const vendedoresGrupo = (team.sellerIds || [])
        .map((sid: string) => {
          const s = (sellers || []).find((sl: any) => String(sl.id) === String(sid))
          if (!s) return null
          const nome = s.user
            ? `${s.user.firstName ?? ""} ${s.user.lastName ?? ""}`.trim()
            : s.name ?? s.user?.email ?? String(s.id)
          return {
            nome,
            vendas: Number(s.salesAmount ?? 0),
            status: s.active === false ? "inativo" : "ativo",
          }
        })
        .filter(Boolean)

      return {
        id: team.id,
        nome: team.name,
        lider: gerente
          ? (gerente.firstName || gerente.lastName)
            ? `${gerente.firstName ?? ""} ${gerente.lastName ?? ""}`.trim()
            : gerente.name ?? gerente.email ?? String(gerente.id)
          : team.managerId ?? "",
        liderUserId: team.managerId,
        membros: vendedoresGrupo.length,
        metaMensal: Number(team.quota ?? 0),
        vendidoMes: vendedoresGrupo.reduce((acc: number, v: any) => acc + (Number(v.vendas ?? 0)), 0),
        status: team.active === false ? "inativo" : "ativo",
        descricao: team.description ?? "",
        vendedores: vendedoresGrupo,
        raw: team,
      }
    })
  }, [teams, sellers, users])

  // Local UI state
  const [gruposFiltrados, setGruposFiltrados] = useState<any[]>([])
  const [grupoEditando, setGrupoEditando] = useState<any | null>(null)
  const [grupoSelecionado, setGrupoSelecionado] = useState<any | null>(null)
  const [dialogs, setDialogs] = useState({
    editar: false,
    gerenciar: false,
    adicionarMembro: false,
    editarMembro: false,
  })
  const [novoMembro, setNovoMembro] = useState({ nome: "", email: "", telefone: "" })
  const [membroEditando, setMembroEditando] = useState<any | null>(null)

  // Avoid loops: only update if content changed
  useEffect(() => {
    try {
      const prev = JSON.stringify(gruposFiltrados)
      const next = JSON.stringify(gruposSincronizados)
      if (prev !== next) setGruposFiltrados(gruposSincronizados)
    } catch {
      setGruposFiltrados(gruposSincronizados)
    }
  }, [gruposSincronizados])

  // Dialog helpers
  const setDialogoEditarAberto = (v: boolean) => setDialogs((d) => ({ ...d, editar: v }))
  const setDialogoGerenciarAberto = (v: boolean) => setDialogs((d) => ({ ...d, gerenciar: v }))
  const setDialogoAdicionarMembroAberto = (v: boolean) => setDialogs((d) => ({ ...d, adicionarMembro: v }))
  const setDialogoEditarMembroAberto = (v: boolean) => setDialogs((d) => ({ ...d, editarMembro: v }))

  // Actions
  const criarGrupo = async (novoGrupo: any) => {
    const body = {
      name: novoGrupo.nome,
      description: novoGrupo.descricao,
      quota: Number(novoGrupo.metaMensal || 0),
      managerId: novoGrupo.liderUserId ?? null,
      active: true,
    }
    await createTeamMutation.mutateAsync(body)
  }

  const editarGrupo = (grupo?: any) => {
    if (!grupo) {
      setGrupoEditando({
        id: null,
        nome: "",
        lider: "",
        descricao: "",
        metaMensal: "",
        liderUserId: null,
      })
    } else {
      setGrupoEditando({
        id: grupo.id,
        nome: grupo.nome,
        lider: grupo.lider,
        liderUserId: grupo.liderUserId,
        descricao: grupo.descricao,
        metaMensal: String(grupo.metaMensal),
      })
    }
    setDialogoEditarAberto(true)
  }

  const salvarEdicaoGrupo = async () => {
    if (!grupoEditando) return

    const body = {
      name: grupoEditando.nome,
      description: grupoEditando.descricao,
      quota: Number(grupoEditando.metaMensal || 0),
      managerId: grupoEditando.liderUserId ?? null,
      active: true,
    }

    if (grupoEditando.id == null) {
      await createTeamMutation.mutateAsync(body)
    } else {
      await updateTeamMutation.mutateAsync({ id: grupoEditando.id, data: body })
    }

    setDialogoEditarAberto(false)
    setGrupoEditando(null)
  }

  const gerenciarGrupo = (grupo: any) => {
    setGrupoSelecionado(grupo)
    setDialogoGerenciarAberto(true)
  }

  const adicionarMembro = () => {
    if (!novoMembro.nome || !novoMembro.email) {
      alert("Nome e email são obrigatórios")
      return
    }

    // Simulado: adicionar ao grupo selecionado
    if (grupoSelecionado) {
      setGrupoSelecionado({
        ...grupoSelecionado,
        vendedores: [
          ...grupoSelecionado.vendedores,
          {
            nome: novoMembro.nome,
            vendas: 0,
            status: "ativo",
          },
        ],
        membros: grupoSelecionado.membros + 1,
      })
    }

    setNovoMembro({ nome: "", email: "", telefone: "" })
    setDialogoAdicionarMembroAberto(false)
  }

  const editarMembro = (vendedor: any, index: number) => {
    setMembroEditando({ ...vendedor, index })
    setDialogoEditarMembroAberto(true)
  }

  const salvarEdicaoMembro = () => {
    if (!membroEditando || !grupoSelecionado) return

    const vendedoresAtualizados = grupoSelecionado.vendedores.map((v: any, i: number) =>
      i === membroEditando.index
        ? {
            ...v,
            nome: membroEditando.nome,
            status: membroEditando.status,
          }
        : v,
    )

    setGrupoSelecionado({
      ...grupoSelecionado,
      vendedores: vendedoresAtualizados,
    })

    setMembroEditando(null)
    setDialogoEditarMembroAberto(false)
  }

  const removerMembro = (index: number) => {
    if (confirm("Tem certeza que deseja remover este membro do grupo?")) {
      if (grupoSelecionado) {
        setGrupoSelecionado({
          ...grupoSelecionado,
          vendedores: grupoSelecionado.vendedores.filter((_: any, i: number) => i !== index),
          membros: grupoSelecionado.membros - 1,
        })
      }
    }
  }

  const calcularPerformance = (vendido: number, meta: number): number => {
    if (!meta || Number(meta) === 0) return 0
    return (Number(vendido) / Number(meta)) * 100
  }

  return {
    // Data
    teams,
    users,
    sellers,
    gruposSincronizados,
    gruposFiltrados,
    setGruposFiltrados,

    // Dialog states
    dialogoEditarAberto: dialogs.editar,
    setDialogoEditarAberto,
    dialogoGerenciarAberto: dialogs.gerenciar,
    setDialogoGerenciarAberto,
    dialogoAdicionarMembroAberto: dialogs.adicionarMembro,
    setDialogoAdicionarMembroAberto,
    dialogoEditarMembroAberto: dialogs.editarMembro,
    setDialogoEditarMembroAberto,

    // Selection/editing states
    grupoEditando,
    setGrupoEditando,
    grupoSelecionado,
    setGrupoSelecionado,
    novoMembro,
    setNovoMembro,
    membroEditando,
    setMembroEditando,

    // Actions
    criarGrupo,
    editarGrupo,
    salvarEdicaoGrupo,
    gerenciarGrupo,
    adicionarMembro,
    editarMembro,
    salvarEdicaoMembro,
    removerMembro,
    calcularPerformance,
  }
}