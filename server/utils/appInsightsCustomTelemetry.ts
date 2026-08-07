import { telemetry } from '@ministryofjustice/hmpps-azure-telemetry'
import { LaunchpadUser } from '@ministryofjustice/hmpps-prisoner-auth'
import type { RequestHandler } from 'express'

export default function addUserDataToTelemetry(): RequestHandler {
  return (req, res, next) => {
    const user = (res?.locals?.user || {}) as LaunchpadUser & { establishmentId: string }
    const { userId, establishmentId } = user
    const deviceType = res.locals.deviceType ?? 'undefined'

    telemetry.setSpanAttributes({
      ...(userId && { userId }),
      ...(establishmentId && { establishmentId }),
      ...(deviceType && { deviceType }),
    })
    return next()
  }
}
