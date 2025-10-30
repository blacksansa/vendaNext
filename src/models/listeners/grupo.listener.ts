"use client"

import { Grupo } from "../grupo.model"
import { updateTeam, deleteTeam } from "@/lib/api.client"

export type GrupoChangeType = "create" | "update" | "delete" | "addSeller" | "removeSeller"

export interface GrupoChangeEvent {
  tipo: GrupoChangeType
  grupo: Grupo
  timestamp: number
  metadata?: Record<string, any>
  synced?: boolean
  syncError?: string
}

class GrupoEventListener {
  private listeners: Map<GrupoChangeType, Set<(event: GrupoChangeEvent) => void>> = new Map()
  private allListeners: Set<(event: GrupoChangeEvent) => void> = new Set()
  private history: GrupoChangeEvent[] = []
  private maxHistorySize = 100
  private syncQueue: GrupoChangeEvent[] = []
  private syncing = false
  private syncInterval: NodeJS.Timeout | null = null

  constructor() {
    // Inicializar listeners para cada tipo
    const tipos: GrupoChangeType[] = ["create", "update", "delete", "addSeller", "removeSeller"]
    tipos.forEach((tipo) => {
      this.listeners.set(tipo, new Set())
    })

    // Iniciar sincronização periódica
    this.startAutoSync()
  }

  /**
   * Subscribe a um tipo específico de evento
   */
  on(tipo: GrupoChangeType, callback: (event: GrupoChangeEvent) => void) {
    const listeners = this.listeners.get(tipo)
    if (listeners) {
      listeners.add(callback)
    }
    return () => this.off(tipo, callback)
  }

  /**
   * Unsubscribe de um tipo específico
   */
  off(tipo: GrupoChangeType, callback: (event: GrupoChangeEvent) => void) {
    const listeners = this.listeners.get(tipo)
    if (listeners) {
      listeners.delete(callback)
    }
  }

  /**
   * Subscribe a todos os eventos
   */
  onAll(callback: (event: GrupoChangeEvent) => void) {
    this.allListeners.add(callback)
    return () => this.offAll(callback)
  }

  /**
   * Unsubscribe de todos os eventos
   */
  offAll(callback: (event: GrupoChangeEvent) => void) {
    this.allListeners.delete(callback)
  }

  /**
   * Emitir um evento e sincronizar com backend
   */
  emit(tipo: GrupoChangeType, grupo: Grupo, metadata?: Record<string, any>) {
    const event: GrupoChangeEvent = {
      tipo,
      grupo,
      timestamp: Date.now(),
      metadata,
      synced: false,
    }

    // Adicionar ao histórico
    this.history.push(event)
    if (this.history.length > this.maxHistorySize) {
      this.history.shift()
    }

    // Adicionar à fila de sincronização
    this.syncQueue.push(event)

    // Notificar listeners específicos (antes de sincronizar)
    const listeners = this.listeners.get(tipo)
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(event)
        } catch (error) {
          console.error(`Erro no listener de ${tipo}:`, error)
        }
      })
    }

    // Notificar listeners globais
    this.allListeners.forEach((callback) => {
      try {
        callback(event)
      } catch (error) {
        console.error("Erro no listener global:", error)
      }
    })

    // Sincronizar imediatamente
    this.syncEvent(event)
  }

  /**
   * Sincronizar um evento com o backend
   */
  private async syncEvent(event: GrupoChangeEvent) {
    try {
      console.log(`🔄 Sincronizando ${event.tipo}:`, event.grupo.nome)

      switch (event.tipo) {
        case "update": {
          const body = {
            name: event.grupo.nome,
            description: event.grupo.descricao,
            quota: event.grupo.metaMensal,
            managerId: event.grupo.liderUserId ?? undefined,
            active: event.grupo.status === "ativo",
          }
          await updateTeam(event.grupo.id as number, body)
          event.synced = true
          console.log(`✅ ${event.tipo} sincronizado:`, event.grupo.nome)
          break
        }

        case "delete": {
          await deleteTeam(event.grupo.id as number)
          event.synced = true
          console.log(`✅ ${event.tipo} sincronizado:`, event.grupo.nome)
          break
        }

        case "addSeller": {
          const vendedorId = event.metadata?.vendedorId
          const body = {
            ...event.grupo.raw,
            sellerIds: [...(event.grupo.raw.sellerIds || []), vendedorId],
          }
          await updateTeam(event.grupo.id as number, body)
          event.synced = true
          console.log(`✅ ${event.tipo} sincronizado: Vendedor ${vendedorId}`)
          break
        }

        case "removeSeller": {
          const vendedorId = event.metadata?.vendedorId
          const body = {
            ...event.grupo.raw,
            sellerIds: (event.grupo.raw.sellerIds || []).filter(
              (id: any) => String(id) !== String(vendedorId)
            ),
          }
          await updateTeam(event.grupo.id as number, body)
          event.synced = true
          console.log(`✅ ${event.tipo} sincronizado: Vendedor ${vendedorId} removido`)
          break
        }

        case "create": {
          // Create já é sincronizado no model, apenas marcar como sincronizado
          event.synced = true
          console.log(`✅ ${event.tipo} sincronizado:`, event.grupo.nome)
          break
        }
      }

      // Remover da fila se sincronizado
      this.syncQueue = this.syncQueue.filter((e) => e !== event)
    } catch (error: any) {
      event.syncError = error.message
      console.error(`❌ Erro ao sincronizar ${event.tipo}:`, error)
      // Manter na fila para retry
    }
  }

  /**
   * Iniciar sincronização automática
   */
  private startAutoSync() {
    this.syncInterval = setInterval(() => {
      this.processQueue()
    }, 5000) // A cada 5 segundos
  }

  /**
   * Processar fila de sincronização
   */
  private async processQueue() {
    if (this.syncing || this.syncQueue.length === 0) return

    this.syncing = true
    const pendingEvents = [...this.syncQueue]

    for (const event of pendingEvents) {
      if (!event.synced) {
        await this.syncEvent(event)
      }
    }

    this.syncing = false
  }

  /**
   * Obter histórico de eventos
   */
  getHistory(tipo?: GrupoChangeType): GrupoChangeEvent[] {
    if (tipo) {
      return this.history.filter((e) => e.tipo === tipo)
    }
    return [...this.history]
  }

  /**
   * Obter eventos não sincronizados
   */
  getPendingEvents(): GrupoChangeEvent[] {
    return this.syncQueue.filter((e) => !e.synced)
  }

  /**
   * Limpar histórico
   */
  clearHistory() {
    this.history = []
  }

  /**
   * Forçar sincronização de todos os eventos pendentes
   */
  async forceSyncAll() {
    console.log("🔄 Forçando sincronização de todos os eventos pendentes...")
    const pending = [...this.syncQueue]
    for (const event of pending) {
      if (!event.synced) {
        await this.syncEvent(event)
      }
    }
  }

  /**
   * Obter contagem de listeners
   */
  getListenerCount(tipo?: GrupoChangeType): number {
    if (tipo) {
      return this.listeners.get(tipo)?.size ?? 0
    }
    let total = this.allListeners.size
    this.listeners.forEach((set) => {
      total += set.size
    })
    return total
  }

  /**
   * Parar sincronização automática
   */
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  /**
   * Destruir o listener
   */
  destroy() {
    this.stopAutoSync()
    this.listeners.clear()
    this.allListeners.clear()
    this.history = []
    this.syncQueue = []
  }
}

// Singleton
export const grupoEventListener = new GrupoEventListener()