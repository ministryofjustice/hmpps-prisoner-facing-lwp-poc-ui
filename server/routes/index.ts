import { Router } from 'express'

import type { Services } from '../services'
import { Page } from '../services/auditService'

export default function routes({ auditService, educationAndWorkPlanService }: Services): Router {
  const router = Router()

  router.get('/', async (req, res, next) => {
    try {
      const prisonNumber = res.locals.user.userId
      await auditService.logPageView(Page.PRISONER_GOALS, { who: prisonNumber, correlationId: req.id })

      const actionPlan = await educationAndWorkPlanService.getActionPlan(prisonNumber)
      const goals = actionPlan?.goals ?? []

      return res.render('pages/index', { goals })
    } catch (error) {
      return next(error)
    }
  })

  return router
}
