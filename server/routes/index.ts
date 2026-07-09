import { Router } from 'express'

import type { Services } from '../services'
import { Page } from '../services/auditService'

export default function routes({ auditService, educationAndWorkPlanService }: Services): Router {
  const router = Router()

  router.get('/', async (req, res, next) => {
    try {
      const { user } = res.locals
      await auditService.logPageView(Page.PRISONER_GOALS, { who: user.username, correlationId: req.id })

      const prisonNumber = user.authSource === 'prisoner-auth' ? user.idToken.sub : undefined
      const actionPlan = await educationAndWorkPlanService.getActionPlan(prisonNumber)
      const goals = actionPlan?.goals ?? []

      return res.render('pages/index', { goals })
    } catch (error) {
      return next(error)
    }
  })

  return router
}
