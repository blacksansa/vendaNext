import Api from "@/lib/api"
import { Pipeline, Stage, Opportunity } from "@/lib/types"

const pipelineApi = new Api<Pipeline, number>("/pipeline")
const stageApi = new Api<Stage, number>("/stage")
const opportunityApi = new Api<Opportunity, number>("/opportunity")

export const getPipelines = (term = "", page = 0, size = 20): Promise<Pipeline[]> =>
  pipelineApi.list(page, size, term)
export const getPipelineById = (id: number): Promise<Pipeline> => pipelineApi.getById(id)
export const createPipeline = (data: Partial<Pipeline>): Promise<Pipeline> => pipelineApi.saveOrUpdate(data)
export const updatePipeline = (id: number, data: Partial<Pipeline>): Promise<Pipeline> =>
  pipelineApi.saveOrUpdate({ ...data, id })
export const deletePipeline = (id: number): Promise<void> => pipelineApi.delete(id)

export const getPipelineStages = (term = "", page = 0, size = 20): Promise<Stage[]> =>
  stageApi.list(page, size, term)
export const createPipelineStage = (data: Partial<Stage>): Promise<Stage> =>
  stageApi.saveOrUpdate(data)

export const getDeals = (term = "", page = 0, size = 20): Promise<Opportunity[]> =>
  opportunityApi.list(page, size, term)
export const getOpportunityById = (id: number): Promise<Opportunity> => opportunityApi.getById(id)
export const createDeal = (data: Partial<Opportunity>): Promise<Opportunity> =>
  opportunityApi.saveOrUpdate(data)
export const updateDeal = (id: number, data: Partial<Opportunity>): Promise<Opportunity> =>
  opportunityApi.saveOrUpdate({ ...data, id })
export const deleteDeal = (id: number): Promise<void> => opportunityApi.delete(id)

export const getOpportunities = getDeals
export const createOpportunity = createDeal
export const updateOpportunity = updateDeal
export const deleteOpportunity = deleteDeal