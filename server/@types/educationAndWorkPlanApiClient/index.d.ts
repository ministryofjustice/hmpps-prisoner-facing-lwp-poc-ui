declare module 'educationAndWorkPlanApiClient' {
  export type GoalResponse = {
    goalReference: string
    title: string
    status: string
    // additional fields intentionally omitted for the POC
  }

  export type ActionPlanResponse = {
    reference: string
    prisonNumber: string
    goals: GoalResponse[]
  }
}
