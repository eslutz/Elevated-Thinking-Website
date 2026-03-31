# Elevated Thinking Website

This project is a static Vite + React + TypeScript site with Tailwind bundled through Vite.

## Requirements

- Node.js 18+ recommended
- npm

## Local Development

Install dependencies:

```bash
npm install
```

Start the local dev server:

```bash
npm run dev
```

Vite will print a local URL, usually:

```text
http://localhost:5173
```

Open that URL in your browser to preview the site.

Check TypeScript types:

```bash
npm run typecheck
```

Check formatting:

```bash
npm run format:check
```

Format the source code:

```bash
npm run format
```

Run unit tests:

```bash
npm run test:unit
```

Run UI smoke tests against the production preview server:

```bash
npm run test:smoke
```

Formatting is enforced before commit with the committed Git hook in `.githooks/pre-commit`. `npm install` runs `prepare`, which configures Git to use that hooks directory for the repository.

Smoke tests use Playwright's Chromium browser runtime in both local and CI environments (install with `npx playwright install --with-deps chromium` when needed).
The smoke suite also includes an automated WCAG A/AA accessibility scan using `@axe-core/playwright`.
GitHub Actions uploads the Playwright HTML report as an artifact for each smoke-test run.

## Production Build

Create the production build:

```bash
npm run build
```

This outputs the deployable static site to:

```text
dist/
```

If you want to preview the production build locally:

```bash
npm run preview
```

## CI/CD Overview

GitHub Actions handles both preview and production deployments:

- Pull requests run separate `validate`, `unit_tests`, and `smoke_tests` jobs before publishing a PR-specific build.
- The `unit_tests` job enforces a minimum 60% global Jest coverage threshold.
- The `validate` job isolates formatting and TypeScript failures from test failures.
- The `smoke_tests` job uploads a Playwright HTML report artifact so the PR check links lead to inspectable test output.
- Successful PR builds publish a preview to GitHub Pages at:

  ```text
  https://<owner>.github.io/<repo>/preview/pr-<number>/
  ```

- Closing or merging a PR removes its preview from the `gh-pages` branch.
- Pushes of version tags like `v1.2.3` rerun verification, deploy with blue/green slots to Hostinger over SFTP, and create a GitHub release for that tag.

The workflows live in:

- `.github/workflows/pr-preview.yml`
- `.github/workflows/deploy-production.yml`

Detailed testing/deployment plan:

- `docs/test-plan.md`

## GitHub Setup

### 1. Enable GitHub Pages

In the repository settings:

1. Open `Settings -> Pages`.
2. Set the source to `Deploy from a branch`.
3. Choose the `gh-pages` branch and `/ (root)`.

GitHub Pages will then serve the PR preview files written by the workflow.

### 2. Configure Branch Protection For `main`

GitHub branch protection is a repository setting, not a tracked file in this repo. Configure it manually:

1. Open `Settings -> Branches`.
2. Add a branch protection rule for `main`.
3. Require at least one approval before merge.
4. Require status checks to pass before merge.
5. Select `validate`, `unit_tests`, and `smoke_tests` from the GitHub Actions workflows.
6. Restrict direct pushes to `main`.

This is what ensures release tags are only cut from reviewed code that has already landed on `main`.

### 3. Configure GitHub Environments

This setup uses one custom repository environment:

- `prod`

GitHub Pages still creates and uses its own managed `github-pages` environment for Pages hosting. That is expected and should not be replaced.

Recommended usage:

- Use GitHub Pages for PR preview hosting.
- Use `prod` for production deploys so Hostinger secrets and deployment approvals are isolated to production only.

GitHub environments can enforce required reviewers, wait timers, deployment branch restrictions, and separate secrets and variables. GitHub documents these controls in its deployment environment docs and notes that jobs referencing an environment create deployment records with an optional `environment_url`. [GitHub docs](https://docs.github.com/en/actions/reference/environments) [GitHub docs](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/using-environments-for-deployment?apiVersion=2022-11-28)

Recommended configuration:

1. Open `Settings -> Environments`.
2. Create an environment named `prod`.
3. On `prod`, optionally require reviewer approval before the deploy job runs.
4. On `prod`, optionally restrict deployments to release tags.
5. On `prod`, add the Hostinger secrets listed below.
6. On `prod`, optionally add a variable named `PROD_SITE_URL` with the public production site URL so GitHub shows a clickable deployment URL for production.

### 4. Add Hostinger Secrets

Add these exact secret names in GitHub, preferably on the `prod` environment:

- `HOSTINGER_HOST`
- `HOSTINGER_PORT`
- `HOSTINGER_USERNAME`
- `HOSTINGER_PASSWORD`
- `HOSTINGER_REMOTE_PATH`

Recommended values:

- `HOSTINGER_PORT`: `22`
- `HOSTINGER_REMOTE_PATH`: `public_html/`

The production workflow deploy job reads them from the `prod` environment.

## Preview Deployment Details

PR previews are built with a PR-specific Vite base path so asset URLs resolve correctly on GitHub Pages:

```text
/<repo>/preview/pr-<number>/
```

The workflow publishes the built files to:

```text
gh-pages/preview/pr-<number>/
```

Each preview job also posts or updates a PR comment with the live preview URL.

Pushes to `main` also publish a non-production main-branch build at:

```text
https://<owner>.github.io/<repo>/preview/
```

The GitHub Pages root route (`https://<owner>.github.io/<repo>/`) is generated by the workflow and links to the main preview plus all currently open PR previews.

If your team accepts PRs from forks, note that the current preview publish step only runs for PRs opened from branches in the same repository. The verification job still runs for forked PRs.

GitHub Pages will show these deployments under its managed `github-pages` environment. There is no separate custom non-production environment in this simplified setup.

## Production Deployment Details

Production deploys run on pushes of release tags matching `v*`.

Recommended release flow:

```bash
npm version patch
git push --follow-tags
```

Use `patch`, `minor`, or `major` as appropriate. The `npm version` command updates `package.json`, updates `package-lock.json`, creates a Git commit, and creates the matching Git tag. Pushing with `--follow-tags` sends both the release commit and the tag to GitHub, which triggers the production workflow.

The production workflow:

1. Runs `npm ci`
2. Verifies the pushed Git tag matches the version in `package.json`
3. Runs `npm run format:check`
4. Runs `npm run typecheck`
5. Runs `npm run test:unit`
6. Runs Playwright smoke tests (`npm run test:smoke`)
7. Uploads the `dist/` artifact
8. Deploys to an inactive blue/green slot and then promotes the same release to the live Hostinger path
9. Updates `.deploy-slots/.active-slot` so rollback target selection is deterministic
10. Creates a GitHub release for the deployed version tag

The production deploy job targets the `prod` environment. If you configure required reviewers on that environment, the deploy job will pause for approval before it can access the Hostinger secrets and proceed. GitHub documents this behavior in its environment and deployment docs. [GitHub docs](https://docs.github.com/en/actions/reference/environments) [GitHub docs](https://docs.github.com/actions/how-tos/deploy/configure-and-manage-deployments/control-deployments)

This site deploys as static files. You do not need a Node server on Hostinger for this setup.

After deployment, the Hostinger web root should contain files like:

```text
index.html
assets/...
```

## Rollback And Retry

- To retry a failed deployment, rerun the relevant workflow in the GitHub Actions tab.
- To roll back production quickly, run `Production Deploy` manually with `operation=rollback` (and optionally `rollback_slot=blue|green`).
- To ship a new production release, cut and push a new version tag with `npm version <patch|minor|major>` and `git push --follow-tags`.
- To rebuild a preview, push a new commit to the PR branch or rerun the PR preview workflow.

## Action Versioning

The workflows are pinned to the current latest official tags that were available when this was updated:

- `actions/checkout@v6.0.1`
- `actions/setup-node@v6.1.0`
- `actions/upload-artifact@v7.0.0`
- `actions/download-artifact@v8.0.1`
- `actions/github-script@v8.0.0`

Those versions were verified from the official GitHub action release pages:

- [actions/checkout releases](https://github.com/actions/checkout/releases)
- [actions/setup-node releases](https://github.com/actions/setup-node/releases)
- [actions/upload-artifact releases](https://github.com/actions/upload-artifact/releases)
- [actions/download-artifact releases](https://github.com/actions/download-artifact/releases)
- [actions/github-script releases](https://github.com/actions/github-script/releases)

Dependabot is also configured in `.github/dependabot.yml` to keep GitHub Actions and npm dependencies up to date automatically.

## Main Project Files

- `package.json` - project dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `tsconfig.node.json` - TypeScript configuration for Vite config
- `vite.config.ts` - Vite configuration
- `index.html` - HTML shell used by Vite
- `src/App.tsx` - main page component
- `src/main.tsx` - React entry point
- `src/styles.css` - global styles and Tailwind import

## Preview Authentication Gateway (Azure Functions + GitHub OAuth)

This repository now includes a separate C# Azure Functions API project under `api/` that protects preview entrypoints behind GitHub OAuth and repository-collaborator checks.

### API project

- Solution: `api/AuthGateway.sln`
- Function app project: `api/src/AuthGateway.Api`
- Test project: `api/tests/AuthGateway.Api.Tests`

The auth gateway provides these key routes:

- `GET /api/auth/login`
- `GET /api/auth/callback`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/view/root`
- `GET /api/view/main`
- `GET /api/view/pr/{prNumber}`

If a user is not authenticated, the protected view routes redirect to GitHub OAuth. During callback, the API checks `GET /repos/{owner}/{repo}/collaborators/{username}` before issuing an auth cookie.

### Infrastructure project (Bicep)

- Template: `infra/bicep/main.bicep`
- Example parameters: `infra/bicep/main.parameters.json`

The template provisions:

- Storage account (Functions runtime storage)
- Application Insights
- Linux Consumption plan
- Function App with all required app settings for OAuth, repo access validation, session signing, and preview URL routing

### Deployment workflows

- API workflow: `.github/workflows/api-auth-gateway.yml`
  - Validates restore/build/test for all API changes.
  - Deploys the published Functions package on `main`.
- Infra workflow: `.github/workflows/infra-auth-gateway.yml`
  - Validates Bicep template changes.
  - Deploys infrastructure on `main`.

Required GitHub environment/repository secrets and vars include:

- Secrets: `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`
- Variables: `AZURE_RESOURCE_GROUP`, `AZURE_FUNCTION_APP_NAME`
