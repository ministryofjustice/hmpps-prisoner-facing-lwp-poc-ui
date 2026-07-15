import { NextFunction, Request, Response } from 'express'
import logger from '../../logger'

/**
 * Middleware function that determines the device type that the user is accessing this service from, and sets it on res.locals
 * One of the reasons for needing to know the device type is to be able to determine what content or links to show.
 *
 * The device type will be one of:
 *   * SHARED:
 *       A “shared” device (which might mean an education device in a classroom, or a library device) might not be entirely
 *       private and have people “shoulder surfing”. In these cases the type of data DPS services might show might be limited.
 *   * KIOSK:
 *       A “kiosk” device is typically a shared/common device in public spaces on the wing. This might have the same
 *       "shoulder surfing" problems but to a greater effect.
 *   * PRIVATE:
 *       An in-cell device is more private so shoulder surfing is less of a problem. On these devices services might
 *       want to display more personal or sensitive data.
 *
 * Implementation:
 * This implemention is a basic implementation based on the hostname that the service is being accessed on.
 * It uses the fully qualified domain name as follows:
 * If the hostname (left most element when dot delimited) is:
 *   * `shared` then the device type is SHARED
 *   * `kiosk` then the device type is KIOSK
 *   * `private` then the device type is PRIVATE
 * If the hostname (left most element) does not match any of those 3 then:
 *   * If the hostname is `localhost` then the query string parameter `deviceType` is used
 *     This query string parameter will ONLY be inspected when the hostname is `localhost` and is useful for local testing
 *   * else the device type is undefined
 */
const deviceTypeDetectionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const fullyQualifiedDomainName = (req.headers?.host ?? '').split(':')[0]
  const domainNameElements = fullyQualifiedDomainName.split('.')
  const hostname = domainNameElements[0]
  const deviceTypeQueryStringParam = (req.query?.deviceType as string) ?? ''

  let deviceType = deviceTypeFromString(hostname)
  if (deviceType && deviceTypeQueryStringParam) {
    logger.warn('Apparent attempt to override device type via the query string')
  }

  if (!deviceType && hostname.toLowerCase() === 'localhost') {
    deviceType = deviceTypeFromString(deviceTypeQueryStringParam)
  }
  if (!deviceType) {
    logger.warn('Could not determine the device type')
  }

  res.locals.deviceType = deviceType

  return next()
}

const deviceTypeFromString = (value: string): 'SHARED' | 'KIOSK' | 'PRIVATE' | undefined => {
  switch (value.toLowerCase()) {
    case 'shared':
      return 'SHARED'
    case 'kiosk':
      return 'KIOSK'
    case 'private':
      return 'PRIVATE'
    default:
      return undefined
  }
}

export default deviceTypeDetectionMiddleware
