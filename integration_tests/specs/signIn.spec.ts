import { expect, test } from '@playwright/test'
import prisonerAuth from '../mockApis/prisonerAuth'
import { loginWithPrisonerAuth, resetStubs } from '../testUtils'
import HomePage from '../pages/homePage'

test.describe('SignIn (Prisoners login)', () => {
  test.afterEach(async () => {
    await resetStubs()
  })

  test('Unauthenticated user directed to auth', async ({ page }) => {
    await prisonerAuth.stubSignInPage()
    await page.goto('/')

    await expect(page.getByRole('heading')).toHaveText('Sign in')
  })

  test('Unauthenticated user navigating to sign in page directed to auth', async ({ page }) => {
    await prisonerAuth.stubSignInPage()
    await page.goto('/sign-in')

    await expect(page.getByRole('heading')).toHaveText('Sign in')
  })

  test('User can sign out', async ({ page }) => {
    await loginWithPrisonerAuth(page)

    const homePage = await HomePage.verifyOnPage(page)
    await homePage.signOut()

    await expect(page.getByRole('heading')).toHaveText('Sign in')
  })

  test('User name visible in header', async ({ page }) => {
    await loginWithPrisonerAuth(page)

    const homePage = await HomePage.verifyOnPage(page)

    await expect(homePage.usersName).toHaveText('A. Testuser')
  })
})
