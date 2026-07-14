import express, { Express } from 'express'
import { NotFound } from 'http-errors'

import { randomUUID } from 'crypto'
import { LaunchpadUser } from '@ministryofjustice/hmpps-prisoner-auth'
import routes from '../index'
import nunjucksSetup from '../../utils/nunjucksSetup'
import errorHandler from '../../errorHandler'
import type { Services } from '../../services'
import AuditService from '../../services/auditService'
import setUpWebSession from '../../middleware/setUpWebSession'
import HmppsAuditClient from '../../data/hmppsAuditClient'

jest.mock('../../services/auditService')

export const user: LaunchpadUser = {
  name: 'FIRST LAST',
  userId: 'A1234BC',
  token: 'token',
  username: 'user1',
  displayName: 'First Last',
  authSource: 'prisoner-auth',
  userRoles: [],
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  idToken: {
    name: 'FIRST LAST',
    given_name: 'FIRST',
    family_name: 'LAST',
    iat: 0,
    aud: 'clientid',
    sub: 'A1234BC',
    exp: 0,
    booking: { id: '1' },
    establishment: { agency_id: 'BXI', name: 'brixton', display_name: 'HMP Brixton', youth: false },
    iss: 'http://localhost:8080',
  },
}

export const flashProvider = jest.fn()

function appSetup(services: Services, production: boolean, userSupplier: () => LaunchpadUser): Express {
  const app = express()

  app.set('view engine', 'njk')

  nunjucksSetup(app)
  app.use(setUpWebSession())
  app.use((req, res, next) => {
    req.user = userSupplier() as Express.User
    req.flash = flashProvider
    res.locals = {
      user: { ...req.user } as LaunchpadUser,
      cspNonce: '',
      csrfToken: '',
      asset_path: '',
      applicationName: '',
      environmentName: '',
      environmentNameColour: '',
    }
    next()
  })
  app.use((req, _res, next) => {
    req.id = randomUUID()
    next()
  })
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(routes(services))
  app.use((_req, _res, next) => next(new NotFound()))
  app.use(errorHandler(production))

  return app
}

export function appWithAllRoutes({
  production = false,
  services = {
    auditService: new AuditService({} as HmppsAuditClient) as jest.Mocked<AuditService>,
  },
  userSupplier = () => user,
}: {
  production?: boolean
  services?: Partial<Services>
  userSupplier?: () => LaunchpadUser
}): Express {
  return appSetup(services as Services, production, userSupplier)
}
