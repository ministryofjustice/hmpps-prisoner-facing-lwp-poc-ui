import { Page } from '@playwright/test'
import tokenVerification from './mockApis/tokenVerification'
import prisonerAuth from './mockApis/prisonerAuth'
import { resetStubs } from './mockApis/wiremock'

export { resetStubs }

export const attemptPrisonerAuthLogin = async (page: Page) => {
  await page.goto('/')
  page.locator('h1', { hasText: 'Sign in' })
  const url = await prisonerAuth.getSignInUrl()
  await page.goto(url)
}

export const loginWithPrisonerAuth = async (
  page: Page,
  {
    subject = 'A1234BC',
    establishmentCode = 'BNI',
    tokenExpiresInSeconds = 9999,
    active = true,
  }: {
    active?: boolean
    roles?: string[]
    subject?: string
    establishmentCode?: string
    tokenExpiresInSeconds?: number
  } = {},
) => {
  await Promise.all([
    prisonerAuth.stubSignInPage(),
    prisonerAuth.token({ subject, establishmentCode, expiresInSeconds: tokenExpiresInSeconds }),
    tokenVerification.stubVerifyToken(active),
  ])
  await attemptPrisonerAuthLogin(page)
}
