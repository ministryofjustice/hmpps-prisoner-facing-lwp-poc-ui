import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'

export interface StubGoal {
  goalReference: string
  title: string
  status: string
}

export default {
  stubPing: (httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/education-and-work-plan-api/health/ping',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { status: httpStatus === 200 ? 'UP' : 'DOWN' },
      },
    }),

  stubGetActionPlan: (
    prisonNumber = 'A1234BC',
    goals: StubGoal[] = [{ goalReference: 'g1', title: 'Learn French', status: 'ACTIVE' }],
  ): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/education-and-work-plan-api/action-plans/${prisonNumber}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { reference: 'ap-1', prisonNumber, goals },
      },
    }),

  stubGetActionPlanNotFound: (prisonNumber = 'A1234BC'): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/education-and-work-plan-api/action-plans/${prisonNumber}`,
      },
      response: {
        status: 404,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    }),
}
