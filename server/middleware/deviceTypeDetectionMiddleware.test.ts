import { Request, Response } from 'express'
import deviceTypeDetectionMiddleware from './deviceTypeDetectionMiddleware'

describe('deviceTypeDetectionMiddleware', () => {
  const req = {} as unknown as Request
  const res = {
    locals: {},
  } as unknown as Response
  const next = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()
    req.headers = {}
    res.locals.deviceType = undefined
  })

  it.each([
    { hostname: 'shared', expected: 'SHARED' },
    { hostname: 'kiosk', expected: 'KIOSK' },
    { hostname: 'private', expected: 'PRIVATE' },
    { hostname: 'shared.prisoner-facing-lwp-poc-dev.hmpps.service.justice.gov.uk', expected: 'SHARED' },
    { hostname: 'kiosk.prisoner-facing-lwp-poc-dev.hmpps.service.justice.gov.uk', expected: 'KIOSK' },
    { hostname: 'private.prisoner-facing-lwp-poc-dev.hmpps.service.justice.gov.uk', expected: 'PRIVATE' },
    { hostname: 'prisoner-facing-lwp-poc-dev.hmpps.service.justice.gov.uk', expected: undefined },
    { hostname: 'localhost', expected: undefined },
    { hostname: 'localhost:3000', expected: undefined },
    { hostname: undefined, expected: undefined },
  ])('should determine device type given hostname: $hostname', async spec => {
    // Given
    req.headers.host = spec.hostname

    // When
    await deviceTypeDetectionMiddleware(req, res, next)

    // Then
    expect(res.locals.deviceType).toEqual(spec.expected)
    expect(next).toHaveBeenCalled()
  })

  it.each([
    { hostname: 'localhost', queryString: {}, expected: undefined },
    { hostname: 'localhost', queryString: { deviceType: 'shared' }, expected: 'SHARED' },
    { hostname: 'localhost', queryString: { deviceType: 'kiosk' }, expected: 'KIOSK' },
    { hostname: 'localhost', queryString: { deviceType: 'private' }, expected: 'PRIVATE' },
    { hostname: 'localhost', queryString: { deviceType: 'blah' }, expected: undefined },
    { hostname: 'localhost:3000', queryString: {}, expected: undefined },
    { hostname: 'localhost:3000', queryString: { deviceType: 'shared' }, expected: 'SHARED' },
    { hostname: 'localhost:3000', queryString: { deviceType: 'kiosk' }, expected: 'KIOSK' },
    { hostname: 'localhost:3000', queryString: { deviceType: 'private' }, expected: 'PRIVATE' },
    { hostname: 'localhost:3000', queryString: { deviceType: 'blah' }, expected: undefined },
  ])('should determine device type from hostname: $hostname and query string: $queryString', async spec => {
    // Given
    req.headers.host = spec.hostname
    req.query = spec.queryString

    // When
    await deviceTypeDetectionMiddleware(req, res, next)

    // Then
    expect(res.locals.deviceType).toEqual(spec.expected)
    expect(next).toHaveBeenCalled()
  })

  it.each([
    {
      hostname: 'private.prisoner-facing-lwp-poc-dev.hmpps.service.justice.gov.uk',
      queryString: { deviceType: 'shared' },
      expected: 'PRIVATE',
    },
    {
      hostname: 'private.prisoner-facing-lwp-poc-dev.hmpps.service.justice.gov.uk',
      queryString: { deviceType: 'kiosk' },
      expected: 'PRIVATE',
    },
    {
      hostname: 'shared.prisoner-facing-lwp-poc-dev.hmpps.service.justice.gov.uk',
      queryString: { deviceType: 'private' },
      expected: 'SHARED',
    },
    {
      hostname: 'prisoner-facing-lwp-poc-dev.hmpps.service.justice.gov.uk',
      queryString: { deviceType: 'SHARED' },
      expected: undefined,
    },
  ])('should ignore query string on non localhost hostname: $hostname', async spec => {
    // Given
    req.headers.host = spec.hostname
    req.query = spec.queryString

    // When
    await deviceTypeDetectionMiddleware(req, res, next)

    // Then
    expect(res.locals.deviceType).toEqual(spec.expected)
    expect(next).toHaveBeenCalled()
  })
})
