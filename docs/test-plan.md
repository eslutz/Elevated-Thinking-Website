# Test Plan

## Goals

- Catch regressions early with fast unit tests.
- Verify that the built site can load and render key user-facing content.
- Gate all preview and production deployments on passing tests.
- Support production rollbacks with blue/green deployment slots.

## Test Suites

### Jest Unit Tests

- Framework: `jest` + `@testing-library/react` + `@swc/jest`
- Scope:
  - Component-level rendering checks
  - Content and structural assertions for key sections
  - Minimum 60% global coverage for statements, branches, functions, and lines
- Location: `tests/unit/*.test.tsx`
- Command:
  - Local and CI: `npm run test:unit`

### Playwright UI Smoke Tests

- Framework: `@playwright/test` (Chromium project)
- Scope:
  - App boot and route load
  - Hero and core CTA content visible
  - Primary navigation and contact anchors visible
  - WCAG A/AA accessibility scan with `@axe-core/playwright`
- Location: `tests/smoke/*.spec.ts`
- Command:
  - Local and CI: `npm run test:smoke`
- Browser install:
  - Local: run `npx playwright install --with-deps chromium` before smoke tests when the browser is not already installed
  - CI: run `npx playwright install --with-deps chromium` before smoke tests
- Playwright model:
  - `@playwright/test` is a project dependency
  - Browser binaries are runtime assets provisioned for the matching Playwright version

## Workflow Gates

### Non-Production Preview (`.github/workflows/non-prod-preview.yml`)

Required PR checks:

1. `validate`
2. `unit_tests`
3. `smoke_tests`

Preview build flow:

1. `validate` runs `npm ci`
2. `validate` runs `npm run format:check`
3. `validate` runs `npm run typecheck`
4. `unit_tests` runs `npm ci`
5. `unit_tests` runs `npm run test:unit -- --coverage`
6. `unit_tests` uploads the coverage artifact and summary
7. `smoke_tests` runs `npm ci`
8. `smoke_tests` installs Playwright browser dependencies
9. `smoke_tests` runs `npm run test:smoke`
10. `smoke_tests` uploads the Playwright HTML report artifact
11. `deploy` builds the static site after all required checks pass
12. `deploy` verifies `dist/staticwebapp.config.json` exists
13. `deploy` uploads `dist/` to Azure Static Web Apps

Main-branch pushes deploy to the `elevated-thinking-preview-swa` production environment for non-production review. Same-repository pull requests deploy to Azure Static Web Apps pre-production environments. Fork pull requests run verification but do not deploy because they cannot access the deployment token.

Preview access checks:

1. A private browser session that is not signed in should redirect to GitHub login.
2. A GitHub user with an accepted `reviewer` role invitation should be able to view the preview site.
3. A signed-in GitHub user without the `reviewer` role should be denied.
4. Closing a same-repository pull request should close the matching Azure Static Web Apps pre-production environment.
5. The old GitHub Pages URL should not serve previews after Pages is disabled and the `gh-pages` branch is deleted.

### Production (`.github/workflows/deploy-production.yml`)

`verify` job gates deploy for pushed release tags with:

1. `npm ci`
2. Verify the Git tag matches `package.json` version
3. `npm run format:check`
4. `npm run typecheck`
5. `npm run test:unit`
6. Playwright browser install
7. `npm run test:smoke`
8. Upload Playwright HTML report artifact
9. Artifact upload

## Blue/Green Production Strategy

- Live deploy root: `HOSTINGER_REMOTE_PATH`
- Slot storage: `HOSTINGER_REMOTE_PATH/.deploy-slots/{blue,green}`
- Active marker file: `HOSTINGER_REMOTE_PATH/.deploy-slots/.active-slot`

### Deploy Flow

1. Read `.active-slot` (default previous slot to `green` if missing).
2. Choose inactive slot as deployment target.
3. Upload new `dist/` to inactive slot.
4. Promote same `dist/` to live root.
5. Write `.active-slot` with the newly active slot.

### Rollback Flow

Manual `workflow_dispatch` supports:

- `operation=rollback`
- optional `rollback_slot=blue|green`

Behavior:

1. Determine current active slot.
2. Choose rollback slot (explicit input or opposite slot).
3. Pull rollback slot contents from remote storage.
4. Mirror rollback contents back to live root.
5. Update `.active-slot` to rollback slot.

This keeps the previous release immediately available for fast rollback without rebuilding.
