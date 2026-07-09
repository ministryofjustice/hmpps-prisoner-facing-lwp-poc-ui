import type { Express } from 'express'
import request from 'supertest'
import type { ActionPlanResponse } from 'educationAndWorkPlanApiClient'
import { appWithAllRoutes, user } from './testutils/appSetup'
import AuditService, { Page } from '../services/auditService'
import HmppsAuditClient from '../data/hmppsAuditClient'
import EducationAndWorkPlanService from '../services/educationAndWorkPlanService'
import EducationAndWorkPlanApiClient from '../data/educationAndWorkPlanApiClient'

jest.mock('../services/auditService')
jest.mock('../services/educationAndWorkPlanService')

const auditService = new AuditService({} as HmppsAuditClient) as jest.Mocked<AuditService>
const educationAndWorkPlanService = new EducationAndWorkPlanService(
  {} as EducationAndWorkPlanApiClient,
) as jest.Mocked<EducationAndWorkPlanService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    services: {
      auditService,
      educationAndWorkPlanService,
    },
    userSupplier: () => user,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /', () => {
  it('should render the goal titles when the prisoner has an action plan with goals', () => {
    auditService.logPageView.mockResolvedValue(undefined)
    const actionPlan: ActionPlanResponse = {
      reference: 'ap-1',
      prisonNumber: 'A1234BC',
      goals: [
        { goalReference: 'g1', title: 'Learn French', status: 'ACTIVE' },
        { goalReference: 'g2', title: 'Get a CSCS card', status: 'ACTIVE' },
      ],
    }
    educationAndWorkPlanService.getActionPlan.mockResolvedValue(actionPlan)

    return request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Learn French')
        expect(res.text).toContain('Get a CSCS card')
        expect(res.text).not.toContain('No LWP goals recorded')
        expect(educationAndWorkPlanService.getActionPlan).toHaveBeenCalledWith('A1234BC')
        expect(auditService.logPageView).toHaveBeenCalledWith(Page.PRISONER_GOALS, {
          who: user.username,
          correlationId: expect.any(String),
        })
      })
  })

  it('should render "No LWP goals recorded" when the prisoner has no action plan (404 -> null)', () => {
    auditService.logPageView.mockResolvedValue(undefined)
    educationAndWorkPlanService.getActionPlan.mockResolvedValue(null)

    return request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('No LWP goals recorded')
      })
  })

  it('should render "No LWP goals recorded" when the action plan has no goals', () => {
    auditService.logPageView.mockResolvedValue(undefined)
    educationAndWorkPlanService.getActionPlan.mockResolvedValue({
      reference: 'ap-1',
      prisonNumber: 'A1234BC',
      goals: [],
    })

    return request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('No LWP goals recorded')
      })
  })

  it('service errors are handled', () => {
    auditService.logPageView.mockResolvedValue(undefined)
    educationAndWorkPlanService.getActionPlan.mockRejectedValue(new Error('Some problem calling external api!'))

    return request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('Some problem calling external api!')
      })
  })
})
