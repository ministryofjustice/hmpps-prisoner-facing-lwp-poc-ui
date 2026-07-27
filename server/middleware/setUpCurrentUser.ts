import { LaunchpadUser } from '@ministryofjustice/hmpps-prisoner-auth'
import { jwtDecode } from 'jwt-decode'
import express from 'express'
import { convertToTitleCase } from '../utils/utils'
import logger from '../../logger'

export default function setUpCurrentUser() {
  const router = express.Router()

  router.use(async (_req, res, next) => {
    try {
      const {
        name,
        sub: userId,
        establishment,
      } = jwtDecode(res.locals.user.token) as {
        name?: string
        sub?: string
        establishment?: {
          agency_id?: string
        }
      }

      res.locals.user = {
        ...res.locals.user,
        userId,
        establishmentId: establishment.agency_id,
        name,
        displayName: convertToTitleCase(name),
      } as unknown as LaunchpadUser

      next()
    } catch (error) {
      logger.error(error, `Failed to populate user details for: ${res.locals.user && res.locals.user.username}`)
      next(error)
    }
  })

  return router
}
