import type { ActionPlanResponse } from 'educationAndWorkPlanApiClient'
import type EducationAndWorkPlanApiClient from '../data/educationAndWorkPlanApiClient'

export default class EducationAndWorkPlanService {
  constructor(private readonly educationAndWorkPlanApiClient: EducationAndWorkPlanApiClient) {}

  getActionPlan(prisonNumber: string): Promise<ActionPlanResponse | null> {
    return this.educationAndWorkPlanApiClient.getActionPlan(prisonNumber)
  }
}
