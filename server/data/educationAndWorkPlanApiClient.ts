import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import type { ActionPlanResponse } from 'educationAndWorkPlanApiClient'
import config from '../config'
import logger from '../../logger'

export default class EducationAndWorkPlanApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Education and Work Plan API', config.apis.educationAndWorkPlanApi, logger, authenticationClient)
  }

  /**
   * Retrieves the action plan for the given prisoner.
   *
   * Uses a client-credentials (system) token obtained from hmpps-auth — NOT the user's token.
   * `asSystem()` is called with no username so the request is authenticated purely with a client token.
   */
  getActionPlan(prisonNumber: string): Promise<ActionPlanResponse> {
    return this.get<ActionPlanResponse>({ path: `/action-plans/${prisonNumber}` }, asSystem())
  }
}
