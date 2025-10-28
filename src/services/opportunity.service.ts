import Api from "@/lib/api"
import { Opportunity } from "@/lib/types"

const opportunityApi = new Api<Opportunity, number>("/opportunity")

export const getOpportunities = (term = "", page = 0, size = 100): Promise<Opportunity[]> =>
  opportunityApi.list(page, size, term)

export const getOpportunityById = (id: number): Promise<Opportunity> =>
  opportunityApi.getById(id)

export const createOpportunity = (data: Partial<Opportunity>): Promise<Opportunity> =>
  opportunityApi.saveOrUpdate(data)

export const updateOpportunity = (id: number, data: Partial<Opportunity>): Promise<Opportunity> =>
  opportunityApi.saveOrUpdate({ ...data, id })

export const deleteOpportunity = (id: number): Promise<void> =>
  opportunityApi.delete(id)
