import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import type { ActionPlanResponse } from 'educationAndWorkPlanApiClient'
import EducationAndWorkPlanApiClient from '../data/educationAndWorkPlanApiClient'
import EducationAndWorkPlanService from './educationAndWorkPlanService'

jest.mock('../data/educationAndWorkPlanApiClient')

describe('EducationAndWorkPlanService', () => {
  const educationAndWorkPlanApiClient = new EducationAndWorkPlanApiClient(
    {} as AuthenticationClient,
  ) as jest.Mocked<EducationAndWorkPlanApiClient>
  let educationAndWorkPlanService: EducationAndWorkPlanService

  beforeEach(() => {
    educationAndWorkPlanService = new EducationAndWorkPlanService(educationAndWorkPlanApiClient)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should delegate getActionPlan to the api client and return its result', async () => {
    const prisonNumber = 'A1234BC'
    const actionPlanResponse: ActionPlanResponse = {
      reference: '814ade0a-a3b2-46a3-862f-79211ba13f7b',
      prisonNumber,
      goals: [],
    }
    educationAndWorkPlanApiClient.getActionPlan.mockResolvedValue(actionPlanResponse)

    const result = await educationAndWorkPlanService.getActionPlan(prisonNumber)

    expect(educationAndWorkPlanApiClient.getActionPlan).toHaveBeenCalledTimes(1)
    expect(educationAndWorkPlanApiClient.getActionPlan).toHaveBeenCalledWith(prisonNumber)
    expect(result).toEqual(actionPlanResponse)
  })

  it('should propagate errors from the api client', async () => {
    const prisonNumber = 'A1234BC'
    educationAndWorkPlanApiClient.getActionPlan.mockRejectedValue(new Error('API error'))

    await expect(educationAndWorkPlanService.getActionPlan(prisonNumber)).rejects.toThrow('API error')
  })
})
