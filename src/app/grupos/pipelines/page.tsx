"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, ArrowLeft, Kanban } from "lucide-react"
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { getPipelinesByTeam, createPipeline, updatePipeline, deletePipeline } from "@/services/pipeline.service"
import { getStagesByPipeline, createStage, deleteStage, updateStage } from "@/services/stage.service"
import { setDefaultPipeline } from "@/services/team.service"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

export default function GrupoPipelinesPage() {
  const params = useSearchParams()
  const router = useRouter()
  const teamIdParam = params.get("teamId")
  const teamId = teamIdParam ? Number(teamIdParam) : null

  const [loading, setLoading] = useState(false)
  const [pipelines, setPipelines] = useState<any[]>([])
  const [selectedPipelineId, setSelectedPipelineId] = useState<number | null>(null)
  const [stages, setStages] = useState<any[]>([])
  const [newPipelineName, setNewPipelineName] = useState("")
  const [newStageName, setNewStageName] = useState("")
  const [pipelineEditName, setPipelineEditName] = useState("")
  const [pipelineEditActive, setPipelineEditActive] = useState(true)
  const [showEdit, setShowEdit] = useState(false)
  const [showNewPipeline, setShowNewPipeline] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  function toHexColor(c: any) {
    if (typeof c === 'number') return `#${(c >>> 0).toString(16).padStart(6, '0').slice(-6)}`
    if (typeof c === 'string' && c.startsWith('#')) return c
    return '#6b7280'
  }

  function parseHexToNumber(hex: string) {
    try { return parseInt(hex.replace('#',''), 16) } catch { return 0 }
  }

  function DraggableStageItem({ stage, children }: any) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: String(stage.id) })
    const style: any = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 }
    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        {children}
      </div>
    )
  }

  async function handleStageDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = stages.findIndex((s: any) => String(s.id) === String(active.id))
    const newIndex = stages.findIndex((s: any) => String(s.id) === String(over.id))
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = arrayMove(stages, oldIndex, newIndex).map((s: any, i: number) => ({ ...s, position: i }))
    setStages(reordered)
    try {
      await Promise.all(reordered.map((s: any, i: number) => updateStage(s.id, { position: i })))
    } catch (e) { console.error('[grupos/pipelines] erro ao reordenar estagios', e) }
  }

  useEffect(() => {
    if (!teamId) return
    ;(async () => {
      setLoading(true)
      try {
        const groupPipes = await getPipelinesByTeam(Number(teamId))
        setPipelines(groupPipes)
        const firstId = groupPipes[0]?.id ?? null
        setSelectedPipelineId(firstId)
        if (firstId) {
          const st = await getStagesByPipeline(firstId)
          setStages(st)
        } else {
          setStages([])
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [teamId])

  useEffect(() => {
    if (!selectedPipelineId) { setStages([]); return }
    ;(async () => {
      const st = await getStagesByPipeline(selectedPipelineId)
      setStages(st)
      const sel = pipelines.find((p: any) => Number(p.id) === Number(selectedPipelineId))
      setPipelineEditName(sel?.name || "")
      setPipelineEditActive(sel?.active ?? true)
    })()
  }, [selectedPipelineId])

  async function handleCreatePipeline() {
    if (!teamId || !newPipelineName.trim()) return
    // Gera código único para evitar conflito de índice (code + deleted_at) e garantir persistência
    const generateUniqueCode = (name: string) => {
      const normalized = name.toUpperCase().replace(/[^A-Z0-9]/g, '_').substring(0, 15)
      const ts = Date.now().toString().slice(-6)
      return `${normalized}_${ts}`
    }
    try {
      const created = await createPipeline({ name: newPipelineName, code: generateUniqueCode(newPipelineName), active: true, team: { id: teamId } as any })
      setNewPipelineName("")
      const groupPipes = await getPipelinesByTeam(Number(teamId))
      setPipelines(groupPipes)
      setSelectedPipelineId(created?.id ?? null)
    } catch (e: any) {
      console.error('[grupos/pipelines] erro ao criar pipeline', e)
      alert(e.message || 'Erro ao criar pipeline')
    }
  }

  async function handleAddStage() {
    if (!selectedPipelineId || !newStageName.trim()) return
    await createStage({ name: newStageName, pipelineId: selectedPipelineId, position: stages.length })
    setNewStageName("")
    const st = await getStagesByPipeline(selectedPipelineId)
    setStages(st)
  }

  async function handleRemoveStage(id: number) {
    await deleteStage(id)
    if (selectedPipelineId) {
      const st = await getStagesByPipeline(selectedPipelineId)
      setStages(st)
    }
  }

  async function handleSaveSelectedPipeline() {
    if (!selectedPipelineId || !teamId) return
    try {
      await updatePipeline(selectedPipelineId, { name: pipelineEditName || "", active: pipelineEditActive, team: { id: teamId } as any })
      const groupPipes = await getPipelinesByTeam(Number(teamId))
      setPipelines(groupPipes)
    } catch (e) { console.error('[grupos/pipelines] erro ao atualizar pipeline', e) }
  }

  async function handleDeleteSelectedPipeline() {
    if (!selectedPipelineId) return
    try {
      await deletePipeline(selectedPipelineId)
      const groupPipes = await getPipelinesByTeam(Number(teamId))
      setPipelines(groupPipes)
      const newFirst = groupPipes[0]?.id ?? null
      setSelectedPipelineId(newFirst)
      if (newFirst) {
        const st = await getStagesByPipeline(newFirst)
        setStages(st)
      } else {
        setStages([])
      }
      toast.success("Pipeline deletado")
    } catch (e) { console.error('[grupos/pipelines] erro ao deletar pipeline', e); toast.error("Falha ao deletar") }
    finally { setConfirmDeleteOpen(false) }
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold flex items-center gap-2">
          <Kanban className="h-5 w-5" /> Configurar Pipelines do Grupo
        </h1>
        <div className="ml-auto">
          <Button variant="outline" size="sm" onClick={() => router.push("/grupos")}> 
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Button>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {!teamId && (
          <Card>
            <CardContent className="p-6 text-muted-foreground text-center">
              Informe um teamId na URL para gerenciar pipelines (ex: /grupos/pipelines?teamId=1)
            </CardContent>
          </Card>
        )}

        {teamId && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Pipelines do Grupo</CardTitle>
                <CardDescription>Selecione ou crie pipelines para o grupo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Pipeline selecionada</Label>
                    <Select value={selectedPipelineId?.toString()} onValueChange={(v) => setSelectedPipelineId(Number(v))}>
                      <SelectTrigger>
                        <SelectValue placeholder={pipelines.length ? "Escolha uma pipeline" : "Nenhuma pipeline cadastrada"} />
                      </SelectTrigger>
                      <SelectContent>
                        {pipelines.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {selectedPipelineId && (
                      <div className="mt-3 flex gap-2 flex-wrap">
                        <Button size="sm" variant="outline" onClick={() => setShowEdit((v) => !v)}>Editar</Button>
                        <Button size="sm" variant="outline" onClick={() => setConfirmDeleteOpen(true)}>Deletar</Button>
                        <Button size="sm" variant="outline" onClick={async () => {
                          if (!teamId || !selectedPipelineId) return
                          try {
                            await setDefaultPipeline(Number(teamId), Number(selectedPipelineId))
                            toast.success("Padrão atualizado")
                          } catch (e) { console.error('erro default pipeline', e); toast.error("Falha ao definir padrão") }
                        }}>Definir como Padrão</Button>
                      </div>
                    )}

                    {showEdit && (
                      <div className="mt-4 space-y-2 border rounded p-3">
                        <Label>Editar Pipeline</Label>
                        <Input value={pipelineEditName} onChange={(e) => setPipelineEditName(e.target.value)} placeholder="Nome" />
                        <div className="flex items-center gap-2">
                          <input id="pl-active" type="checkbox" checked={pipelineEditActive} onChange={(e) => setPipelineEditActive(e.target.checked)} />
                          <Label htmlFor="pl-active">Ativo</Label>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Button size="sm" variant="outline" onClick={handleSaveSelectedPipeline}>Salvar</Button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-end gap-2">
                      <Button variant="outline" onClick={() => setShowNewPipeline((v) => !v)}>Novo Pipeline</Button>
                    </div>
                    {showNewPipeline && (
                      <div className="flex gap-2 mt-2">
                        <Input placeholder="Nome da pipeline" value={newPipelineName} onChange={(e) => setNewPipelineName(e.target.value)} />
                        <Button onClick={handleCreatePipeline} disabled={!newPipelineName.trim()}>Criar</Button>
                        <Button variant="ghost" onClick={() => { setShowNewPipeline(false); setNewPipelineName("") }}>Cancelar</Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Etapas da Pipeline</CardTitle>
                <CardDescription>Gerencie as etapas da pipeline selecionada</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedPipelineId ? (
                  <div className="text-muted-foreground">Selecione ou crie uma pipeline para listar as etapas.</div>
                ) : (
                  <>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Label>Nova etapa</Label>
                        <Input placeholder="Ex: Prospecção" value={newStageName} onChange={(e) => setNewStageName(e.target.value)} />
                      </div>
                      <Button onClick={handleAddStage} disabled={!newStageName.trim()}>Adicionar</Button>
                    </div>

                    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleStageDragEnd}>
                      <SortableContext items={stages.map((s: any) => String(s.id))} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2 max-h-80 overflow-auto">
                          {stages.map((s, idx) => (
                            <DraggableStageItem key={s.id} stage={s}>
                              <div className="flex items-center justify-between border rounded p-2">
                                <div className="flex items-center gap-3">
                                  <div className="cursor-move select-none text-muted-foreground">≡</div>
                                  <input
                                    type="color"
                                    value={toHexColor((s as any).color)}
                                    onChange={(e) => {
                                      const val = e.target.value
                                      setStages((prev) => prev.map((it) => it.id === s.id ? { ...it, color: parseHexToNumber(val) } : it))
                                    }}
                                  />
                                  <Input
                                    className="h-8 w-48"
                                    value={s.name || ''}
                                    onChange={(e) => setStages((prev) => prev.map((it) => it.id === s.id ? { ...it, name: e.target.value } : it))}
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" onClick={async () => {
                                    try {
                                      await updateStage(s.id, { name: s.name, color: (s as any).color, position: idx })
                                      const st = await getStagesByPipeline(selectedPipelineId!)
                                      setStages(st)
                                    } catch (e) { console.error('[grupos/pipelines] erro ao salvar estagio', e) }
                                  }}>Salvar</Button>
                                  <Button variant="outline" size="sm" onClick={() => handleRemoveStage(s.id)}>
                                    <Trash2 className="h-4 w-4 mr-1" /> Remover
                                  </Button>
                                </div>
                              </div>
                            </DraggableStageItem>
                          ))}
                          {stages.length === 0 && (
                            <div className="text-sm text-muted-foreground">Nenhuma etapa cadastrada.</div>
                          )}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </SidebarInset>
  )
}
