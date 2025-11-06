"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Edit, Trash2, ArrowLeft, GitBranch, Layers } from "lucide-react"
import { toast } from "sonner"
import { getTeamById, TeamDTO } from "@/services/team.service"
import {
  getPipelinesByTeam,
  createPipeline,
  updatePipeline,
  deletePipeline,
  getStagesByPipeline,
  createPipelineStage,
  updatePipelineStage,
  deletePipelineStage,
} from "@/services/pipeline.service"
import { Pipeline, Stage } from "@/lib/types"

const defaultColors = [
  { name: "Azul", value: 0x3B82F6 },
  { name: "Verde", value: 0x10B981 },
  { name: "Amarelo", value: 0xF59E0B },
  { name: "Vermelho", value: 0xEF4444 },
  { name: "Roxo", value: 0x8B5CF6 },
  { name: "Rosa", value: 0xEC4899 },
  { name: "Cinza", value: 0x6B7280 },
]

export default function TeamPipelinePage() {
  const params = useParams()
  const router = useRouter()
  const teamId = Number(params.id)

  const [team, setTeam] = useState<TeamDTO | null>(null)
  const [pipelines, setPipelines] = useState<Pipeline[]>([])
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null)
  const [stages, setStages] = useState<Stage[]>([])
  const [loading, setLoading] = useState(true)

  // Dialogs
  const [isPipelineDialogOpen, setIsPipelineDialogOpen] = useState(false)
  const [isStageDialogOpen, setIsStageDialogOpen] = useState(false)
  const [editingPipeline, setEditingPipeline] = useState<Pipeline | null>(null)
  const [editingStage, setEditingStage] = useState<Stage | null>(null)

  // Forms
  const [pipelineForm, setPipelineForm] = useState({ name: "", code: "", active: true })
  const [stageForm, setStageForm] = useState({ name: "", code: "", position: 0, color: 0x3B82F6, icon: "" })

  useEffect(() => {
    loadTeamData()
  }, [teamId])

  useEffect(() => {
    if (selectedPipeline) {
      loadStages(selectedPipeline.id!)
    }
  }, [selectedPipeline])

  async function loadTeamData() {
    try {
      setLoading(true)
      const teamData = await getTeamById(teamId)
      setTeam(teamData)
      console.log("[team-pipeline] Team loaded:", teamData)

      const pipelinesData = await getPipelinesByTeam(teamId)
      console.log("[team-pipeline] Pipelines loaded:", pipelinesData)
      setPipelines(pipelinesData)

      if (pipelinesData.length > 0) {
        setSelectedPipeline(pipelinesData[0])
      } else {
        setSelectedPipeline(null) // Reset se não houver pipelines
      }
    } catch (error) {
      console.error("[team-pipeline] error loading", error)
      toast.error("Erro ao carregar dados do grupo")
    } finally {
      setLoading(false)
    }
  }

  async function loadStages(pipelineId: number) {
    try {
      const stagesData = await getStagesByPipeline(pipelineId)
      setStages(stagesData)
    } catch (error) {
      console.error("[team-pipeline] error loading stages", error)
      toast.error("Erro ao carregar estágios")
    }
  }

  async function handleSavePipeline() {
    try {
      if (!pipelineForm.name) {
        toast.error("Nome do pipeline é obrigatório")
        return
      }

      // Gerar código único com timestamp
      const generateUniqueCode = (name: string, existingCode?: string) => {
        if (existingCode && editingPipeline) return existingCode
        const normalized = name.toUpperCase().replace(/[^A-Z0-9]/g, '_').substring(0, 15)
        const timestamp = Date.now().toString().slice(-6)
        return `${normalized}_${timestamp}`
      }

      const payload: any = {
        name: pipelineForm.name,
        code: generateUniqueCode(pipelineForm.name, editingPipeline?.code),
        active: pipelineForm.active,
        team: { id: teamId },
      }

      console.log("[team-pipeline] Saving pipeline with payload:", payload)

      if (editingPipeline) {
        const updated = await updatePipeline(editingPipeline.id!, payload)
        console.log("[team-pipeline] Pipeline updated:", updated)
        toast.success("Pipeline atualizado com sucesso")
      } else {
        const newPipeline = await createPipeline(payload)
        console.log("[team-pipeline] Pipeline created:", newPipeline)
        toast.success("Pipeline criado com sucesso")
        setSelectedPipeline(newPipeline)
      }

      await loadTeamData()
      setIsPipelineDialogOpen(false)
      setPipelineForm({ name: "", code: "", active: true })
      setEditingPipeline(null)
    } catch (error: any) {
      console.error("[team-pipeline] error saving pipeline:", error)
      
      // Mostrar erro mais detalhado
      const errorMsg = error?.response?.data?.details || error?.message || "Erro ao salvar pipeline"
      
      if (errorMsg.includes("managePipelines")) {
        toast.error("Você não tem permissão para gerenciar pipelines", {
          description: "Role 'managePipelines' necessária"
        })
      } else if (errorMsg.includes("duplicate key") || errorMsg.includes("pipelines_code_unq")) {
        toast.error("Código duplicado detectado", {
          description: "Tente novamente com um nome diferente"
        })
      } else if (errorMsg.includes("team")) {
        toast.error("Erro ao vincular pipeline ao grupo", {
          description: "Verifique se o grupo existe"
        })
      } else {
        toast.error(errorMsg, { description: "Erro ao salvar" })
      }
    }
  }

  async function handleDeletePipeline(pipeline: Pipeline) {
    if (!confirm(`Deseja realmente excluir o pipeline "${pipeline.name}"?`)) return

    try {
      await deletePipeline(pipeline.id!)
      toast.success("Pipeline excluído com sucesso")
      await loadTeamData()
      if (selectedPipeline?.id === pipeline.id) {
        setSelectedPipeline(pipelines.length > 1 ? pipelines[0] : null)
      }
    } catch (error) {
      console.error("[team-pipeline] error deleting pipeline", error)
      toast.error("Erro ao excluir pipeline")
    }
  }

  async function handleSaveStage() {
    try {
      if (!stageForm.name) {
        toast.error("Nome do estágio é obrigatório")
        return
      }

      if (!selectedPipeline) {
        toast.error("Selecione um pipeline primeiro")
        return
      }

      // Gerar código único para o stage (pipeline_id + nome normalizado + timestamp se necessário)
      const generateUniqueCode = (name: string, pipelineId: number, existingCode?: string) => {
        if (existingCode && editingStage) return existingCode // Mantém código ao editar
        const normalized = name.toUpperCase().replace(/[^A-Z0-9]/g, '_').substring(0, 15)
        const timestamp = Date.now().toString().slice(-6)
        return `P${pipelineId}_${normalized}_${timestamp}`
      }

      const payload: any = {
        name: stageForm.name,
        code: generateUniqueCode(stageForm.name, selectedPipeline.id!, editingStage?.code),
        position: stageForm.position,
        color: stageForm.color,
        icon: stageForm.icon,
        pipeline: { id: selectedPipeline.id },
      }
      
      console.log("[team-pipeline] Stage payload:", payload)

      if (editingStage) {
        await updatePipelineStage(editingStage.id!, payload)
        toast.success("Estágio atualizado com sucesso")
      } else {
        await createPipelineStage(payload)
        toast.success("Estágio criado com sucesso")
      }

      await loadStages(selectedPipeline.id!)
      setIsStageDialogOpen(false)
      setStageForm({ name: "", code: "", position: 0, color: 0x3B82F6, icon: "" })
      setEditingStage(null)
    } catch (error: any) {
      console.error("[team-pipeline] error saving stage", error)
      toast.error(error.message || "Erro ao salvar estágio")
    }
  }

  async function handleDeleteStage(stage: Stage) {
    if (!confirm(`Deseja realmente excluir o estágio "${stage.name}"?`)) return

    try {
      await deletePipelineStage(stage.id!)
      toast.success("Estágio excluído com sucesso")
      if (selectedPipeline) {
        await loadStages(selectedPipeline.id!)
      }
    } catch (error) {
      console.error("[team-pipeline] error deleting stage", error)
      toast.error("Erro ao excluir estágio")
    }
  }

  function openPipelineDialog(pipeline?: Pipeline) {
    if (pipeline) {
      setEditingPipeline(pipeline)
      setPipelineForm({
        name: pipeline.name || "",
        code: pipeline.code || "",
        active: pipeline.active !== undefined ? pipeline.active : true,
      })
    } else {
      setEditingPipeline(null)
      setPipelineForm({ name: "", code: "", active: true })
    }
    setIsPipelineDialogOpen(true)
  }

  function openStageDialog(stage?: Stage) {
    if (stage) {
      setEditingStage(stage)
      setStageForm({
        name: stage.name || "",
        code: "", // Não usar o código do stage existente no form
        position: stage.position || 0,
        color: stage.color || 0x3B82F6,
        icon: stage.icon || "",
      })
    } else {
      setEditingStage(null)
      setStageForm({
        name: "",
        code: "",
        position: stages.length,
        color: 0x3B82F6,
        icon: "",
      })
    }
    setIsStageDialogOpen(true)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Pipeline do Grupo: {team?.name}</h1>
          <p className="text-muted-foreground">Gerencie os pipelines e estágios deste grupo</p>
        </div>
      </div>

      {/* Pipelines Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              <CardTitle>Pipelines</CardTitle>
            </div>
            <Button onClick={() => openPipelineDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Pipeline
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                console.log("=== DEBUG INFO ===")
                console.log("Team ID:", teamId)
                console.log("Pipelines state:", pipelines)
                console.log("Selected:", selectedPipeline)
              }}
            >
              Debug
            </Button>
          </div>
          <CardDescription>Pipelines de vendas configurados para este grupo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 text-sm text-muted-foreground">
            Total de pipelines: {pipelines.length} | Team ID: {teamId}
          </div>
          {pipelines.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum pipeline configurado. Clique em "Novo Pipeline" para começar.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pipelines.map((pipeline) => (
                <Card
                  key={pipeline.id}
                  className={`cursor-pointer transition-all ${
                    selectedPipeline?.id === pipeline.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedPipeline(pipeline)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{pipeline.name}</CardTitle>
                      <Badge variant={pipeline.active ? "default" : "secondary"}>
                        {pipeline.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          openPipelineDialog(pipeline)
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeletePipeline(pipeline)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stages Section */}
      {selectedPipeline && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                <CardTitle>Estágios - {selectedPipeline.name}</CardTitle>
              </div>
              <Button onClick={() => openStageDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Estágio
              </Button>
            </div>
            <CardDescription>Configure os estágios do pipeline de vendas</CardDescription>
          </CardHeader>
          <CardContent>
            {stages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum estágio configurado. Clique em "Novo Estágio" para adicionar.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Posição</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Cor</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stages.map((stage) => (
                    <TableRow key={stage.id}>
                      <TableCell>{stage.position}</TableCell>
                      <TableCell className="font-medium">{stage.name}</TableCell>
                      <TableCell>{stage.code}</TableCell>
                      <TableCell>
                        <div
                          className="w-8 h-8 rounded"
                          style={{ backgroundColor: `#${stage.color?.toString(16).padStart(6, "0")}` }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openStageDialog(stage)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteStage(stage)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pipeline Dialog */}
      <Dialog open={isPipelineDialogOpen} onOpenChange={setIsPipelineDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPipeline ? "Editar Pipeline" : "Novo Pipeline"}</DialogTitle>
            <DialogDescription>Configure o pipeline de vendas para este grupo</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="pipeline-name">Nome *</Label>
              <Input
                id="pipeline-name"
                value={pipelineForm.name}
                onChange={(e) => setPipelineForm({ ...pipelineForm, name: e.target.value })}
                placeholder="Ex: Pipeline Principal"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Código será gerado automaticamente
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="pipeline-active"
                checked={pipelineForm.active}
                onChange={(e) => setPipelineForm({ ...pipelineForm, active: e.target.checked })}
              />
              <Label htmlFor="pipeline-active">Ativo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPipelineDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSavePipeline}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stage Dialog */}
      <Dialog open={isStageDialogOpen} onOpenChange={setIsStageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingStage ? "Editar Estágio" : "Novo Estágio"}</DialogTitle>
            <DialogDescription>Configure o estágio do pipeline</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="stage-name">Nome *</Label>
              <Input
                id="stage-name"
                value={stageForm.name}
                onChange={(e) => setStageForm({ ...stageForm, name: e.target.value })}
                placeholder="Ex: Leads / Captura"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Código será gerado automaticamente
              </p>
            </div>
            <div>
              <Label htmlFor="stage-position">Posição</Label>
              <Input
                id="stage-position"
                type="number"
                value={stageForm.position}
                onChange={(e) => setStageForm({ ...stageForm, position: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Cor</Label>
              <div className="grid grid-cols-7 gap-2 mt-2">
                {defaultColors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={`w-10 h-10 rounded border-2 ${
                      stageForm.color === color.value ? "border-primary" : "border-transparent"
                    }`}
                    style={{ backgroundColor: `#${color.value.toString(16).padStart(6, "0")}` }}
                    onClick={() => setStageForm({ ...stageForm, color: color.value })}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStageDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveStage}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
