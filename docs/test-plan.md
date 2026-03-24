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
  - Local: uses the installed Google Chrome channel
  - CI: run `npx playwright install --with-deps chromium` before smoke tests
- Playwright model:
  - `@playwright/test` is a project dependency
  - Browser binaries are runtime assets provisioned for the matching Playwright version

## Workflow Gates

### Pull Request Preview (`.github/workflows/pr-preview.yml`)

Required order in `verify` job:

1. `npm ci`
2. `npm run format:check`
3. `npm run typecheck`
4. `npm run test:unit`
5. Playwright browser install
6. `npm run test:smoke`
7. Upload Playwright HTML report artifact
8. PR preview build with PR-specific Vite base path
9. Artifact upload and preview publish

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
