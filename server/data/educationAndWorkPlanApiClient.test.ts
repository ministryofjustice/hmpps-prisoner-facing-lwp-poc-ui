import nock from 'nock'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import type { ActionPlanResponse } from 'educationAndWorkPlanApiClient'
import EducationAndWorkPlanApiClient from './educationAndWorkPlanApiClient'
import config from '../config'

describe('EducationAndWorkPlanApiClient', () => {
  let educationAndWorkPlanApiClient: EducationAndWorkPlanApiClient
  let mockAuthenticationClient: jest.Mocked<AuthenticationClient>

  beforeEach(() => {
    mockAuthenticationClient = {
      getToken: jest.fn().mockResolvedValue('test-system-token'),
    } as unknown as jest.Mocked<AuthenticationClient>

    educationAndWorkPlanApiClient = new EducationAndWorkPlanApiClient(mockAuthenticationClient)
  })

  afterEach(() => {
    nock.cleanAll()
    jest.resetAllMocks()
  })

  describe('getActionPlan', () => {
    const prisonNumber = 'A1234BC'
    const actionPlanResponse: ActionPlanResponse = {
      reference: '814ade0a-a3b2-46a3-862f-79211ba13f7b',
      prisonNumber,
      goals: [{ goalReference: 'd38a6c41-13d1-1d05-13c2-24619966119b', title: 'Learn French', status: 'ACTIVE' }],
    }

    it('should GET /action-plans/{prisonNumber} using a client/system token and return the response body', async () => {
      nock(config.apis.educationAndWorkPlanApi.url)
        .get(`/action-plans/${prisonNumber}`)
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, actionPlanResponse)

      const response = await educationAndWorkPlanApiClient.getActionPlan(prisonNumber)

      expect(response).toEqual(actionPlanResponse)
    })

    it('should request a client token (no user context)', async () => {
      nock(config.apis.educationAndWorkPlanApi.url).get(`/action-plans/${prisonNumber}`).reply(200, actionPlanResponse)

      await educationAndWorkPlanApiClient.getActionPlan(prisonNumber)

      // A client/system token must be requested, NOT a user token.
      // asSystem() with no username resolves a client token via getToken(undefined) — i.e. no user context.
      expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
      expect(mockAuthenticationClient.getToken).toHaveBeenCalledWith(undefined)
    })

    it('should call the endpoint with the supplied prison number', async () => {
      const otherPrisonNumber = 'Z9999ZZ'
      nock(config.apis.educationAndWorkPlanApi.url)
        .get(`/action-plans/${otherPrisonNumber}`)
        .reply(200, { ...actionPlanResponse, prisonNumber: otherPrisonNumber })

      const response = await educationAndWorkPlanApiClient.getActionPlan(otherPrisonNumber)

      expect(response.prisonNumber).toEqual(otherPrisonNumber)
    })

    it('should propagate an error when the API returns a non-2xx response', async () => {
      nock(config.apis.educationAndWorkPlanApi.url).get(`/action-plans/${prisonNumber}`).reply(404)

      await expect(educationAndWorkPlanApiClient.getActionPlan(prisonNumber)).rejects.toThrow()
    })
  })
})
