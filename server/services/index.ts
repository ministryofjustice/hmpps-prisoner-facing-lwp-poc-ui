import { dataAccess } from '../data'
import AuditService from './auditService'
import ExampleService from './exampleService'
import EducationAndWorkPlanService from './educationAndWorkPlanService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, exampleApiClient, educationAndWorkPlanApiClient } = dataAccess()

  return {
    applicationInfo,
    auditService: new AuditService(hmppsAuditClient),
    exampleService: new ExampleService(exampleApiClient),
    educationAndWorkPlanService: new EducationAndWorkPlanService(educationAndWorkPlanApiClient),
  }
}

export type Services = ReturnType<typeof services>
