import Api from "@/lib/api"
import { Stage, Pipeline } from "@/lib/types"

export interface StageDTO {
  id?: number
  code?: string
  name?: string
  position?: number
  color?: number
  icon?: string
  pipelineId?: number
  pipeline?: Pipeline
}

const stageApi = new Api<StageDTO, number>("/stage")

export const getStages = (term = "", page = 0, size = 100): Promise<StageDTO[]> =>
  stageApi.list(page, size, term)

export const getStageById = (id: number): Promise<StageDTO> =>
  stageApi.getById(id)

export const getStagesByPipeline = async (pipelineId: number): Promise<StageDTO[]> => {
  try {
    const allStages = await stageApi.list(0, 100, "")
    return allStages.filter(stage => stage.pipelineId === pipelineId || stage.pipeline?.id === pipelineId)
  } catch (error) {
    console.error("[stage] error fetching by pipeline", error)
    return []
  }
}

export const createStage = async (data: Partial<StageDTO>): Promise<StageDTO> => {
  if (!data.name) throw new Error("Nome do estágio é obrigatório")
  if (!data.pipelineId) throw new Error("Pipeline é obrigatório")
  
  const payload: any = {
    code: data.code || data.name,
    name: data.name,
    position: data.position || 0,
    color: data.color || 0,
    icon: data.icon,
    pipeline: { id: data.pipelineId }
  }
  
  return await stageApi.saveOrUpdate(payload as StageDTO)
}

export const updateStage = async (id: number, data: Partial<StageDTO>): Promise<StageDTO> => {
  const existing = await stageApi.getById(id)
  
  const payload: any = {
    id,
    code: data.code || existing.code,
    name: data.name || existing.name,
    position: data.position !== undefined ? data.position : existing.position,
    color: data.color !== undefined ? data.color : existing.color,
    icon: data.icon !== undefined ? data.icon : existing.icon,
    pipeline: data.pipelineId ? { id: data.pipelineId } : existing.pipeline
  }
  
  return await stageApi.saveOrUpdate(payload as StageDTO)
}

export const deleteStage = (id: number): Promise<void> =>
  stageApi.delete(id)
