import { expect, test } from '@playwright/test'
import educationAndWorkPlanApi from '../mockApis/educationAndWorkPlanApi'
import { loginWithPrisonerAuth, resetStubs } from '../testUtils'
import HomePage from '../pages/homePage'

test.describe('Prisoner goals (home page)', () => {
  test.afterEach(async () => {
    await resetStubs()
  })

  test('lists the goal titles from the prisoner action plan', async ({ page }) => {
    await educationAndWorkPlanApi.stubGetActionPlan('A1234BC', [
      { goalReference: 'g1', title: 'Learn French', status: 'ACTIVE' },
      { goalReference: 'g2', title: 'Get a CSCS card', status: 'ACTIVE' },
    ])
    await loginWithPrisonerAuth(page)

    await HomePage.verifyOnPage(page)

    const goals = page.getByTestId('goals-list')
    await expect(goals).toContainText('Learn French')
    await expect(goals).toContainText('Get a CSCS card')
  })

  test('shows a friendly message when the prisoner has no action plan (404)', async ({ page }) => {
    await educationAndWorkPlanApi.stubGetActionPlanNotFound('A1234BC')
    await loginWithPrisonerAuth(page)

    await HomePage.verifyOnPage(page)

    await expect(page.getByTestId('no-goals-message')).toHaveText('No LWP goals recorded')
  })

  test('shows a friendly message when the action plan has no goals', async ({ page }) => {
    await educationAndWorkPlanApi.stubGetActionPlan('A1234BC', [])
    await loginWithPrisonerAuth(page)

    await HomePage.verifyOnPage(page)

    await expect(page.getByTestId('no-goals-message')).toHaveText('No LWP goals recorded')
  })
})
