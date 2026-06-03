# Prisoner Facing LWP POC

[![Ministry of Justice Repository Compliance Badge](https://github-community.service.justice.gov.uk/repository-standards/api/hmpps-prisoner-facing-lwp-poc-ui/badge?style=flat)](https://github-community.service.justice.gov.uk/repository-standards/hmpps-prisoner-facing-lwp-poc-ui)
[![Docker Repository on ghcr](https://img.shields.io/badge/ghcr.io-repository-2496ED.svg?logo=docker)](https://ghcr.io/ministryofjustice/hmpps-prisoner-facing-lwp-poc-ui)

A proof of concept for a prisoner facing UI service to surface prisoner's LWP (Learning and Work Progress) information.

There is an initiative to allow prisoners to view their own LWP information on computers in the prison education spaces
(DEP networks). This proof of concept to to prove and demonstrate the feasibility of this, specifically to demonstrate
that prisoners can authenticate using their MoJ Entra identity (using hmpps-prisoner-auth), and that the user authentication
token carries sufficient data/claims to allow us to identify the prisoner's NOMIS PRN and any other data we may require.

User authentication will use hmpps-prisoner-auth, rather than hmpps-auth (which is used for staff authentication).
Making API calls to DPS API services (specifically LWP API) will use hmpps-auth client credentials flow to get a system
token, consistent with all other DPS UI services.

## Developing against the template project

### Running the app via docker-compose

The easiest way to run the app is to use docker compose to create the service and all dependencies.

The production image now uses the `hmpps-node:24-alpine-runtime` base image and starts with `node dist/server.js` directly, so npm is not present in the final runtime stage.

`docker compose pull`

`docker compose up`

### Running the app for development

To start the main services excluding the example typescript template app:

`docker compose up --scale=app=0`

Create an environment file by copying `.env.example` -> `.env`
Environment variables set in here will be available when running `start:dev`

Install dependencies using `npm run setup`, ensuring you are using `node v24`

Note: Using `nvm` (or [fnm](https://github.com/Schniz/fnm)), run `nvm install --latest-npm` within the repository folder
to use the correct version of node, and the latest version of npm. This matches the `engines` config in `package.json`
and the github pipeline build config.

And then, to build the assets and start the app with esbuild:

`npm run start:dev`

### Logging in with a test user

Once the application is running you should then be able to login with:

username: AUTH_USER
password: password123456

To request specific users and roles then raise a PR
to [update the seed data](https://github.com/ministryofjustice/hmpps-auth/blob/main/src/main/resources/db/dev/data/auth/V900_3__users.sql)
for the in-memory DB used by Auth

### Installing dependencies

By default no pre or post install scripts will be run during `npm install`.
Instead a list of configured install scripts will be run via the [npm script allowlist](https://github.com/ministryofjustice/hmpps-typescript-lib/tree/main/packages/npm-script-allowlist) tool.

Instead of running `npm install`, run `npm run setup` - this will run an `npm ci` to install any dependencies and then run any configured install scripts.

### Making changes

The [hmpps precommit hooks library](https://github.com/ministryofjustice/hmpps-typescript-lib/tree/main/packages/precommit-hooks) will ensure that [prek](https://prek.j178.dev/cli/) is installed and initialised against the repo as part of `npm run setup`.

This will run a set of precommit hooks before every commit as configured in `.pre-commit-config.yaml`.
This will scan for potential secrets in the staged files and fail the commit if any are detected.

There's some guidance for dealing with false positives in the [precommit hooks docs](https://github.com/ministryofjustice/hmpps-typescript-lib/tree/main/packages/precommit-hooks#dealing-with-false-positives).

The secret scanner hook can also be configured as described [here](https://github.com/ministryofjustice/devsecops-hooks?tab=readme-ov-file#-configuration).

### Run linter

- `npm run lint` runs `eslint`.
- `npm run typecheck` runs the TypeScript compiler `tsc`.

### Run unit tests

`npm run test`

### Running integration tests

For local running, start a wiremock instance by:

`docker compose -f docker-compose-test.yml up`

Then run the server in test mode by:

`npm run start-feature` (or `npm run start-feature:dev` to run with auto-restart on changes)

After first install ensure playwright is initialised:

`npm run int-test-init:ci`

And then either, run tests in headless mode with:

`npm run int-test`

Or run tests with the UI:

`npm run int-test-ui`

A changelog for the service is available [here](./CHANGELOG.md)
