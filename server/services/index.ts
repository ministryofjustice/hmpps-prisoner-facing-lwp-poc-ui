import { dataAccess } from '../data'
import AuditService from './auditService'
import EducationAndWorkPlanService from './educationAndWorkPlanService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, educationAndWorkPlanApiClient } = dataAccess()

  return {
    applicationInfo,
    auditService: new AuditService(hmppsAuditClient),
    educationAndWorkPlanService: new EducationAndWorkPlanService(educationAndWorkPlanApiClient),
  }
}

export type Services = ReturnType<typeof services>
