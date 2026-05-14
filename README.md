# Elevated Thinking Website

This project is a static Vite + React + TypeScript site with Tailwind bundled through Vite.

## Requirements

- Node.js 20+ recommended
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

Create the Azure Static Web Apps non-production review build:

```bash
SWA_DEFAULT_HOSTNAME=delightful-plant-05da2520f.7.azurestaticapps.net \
SWA_PREVIEW_REGION=eastus2 \
GITHUB_REPOSITORY=eslutz/Elevated-Thinking-Website \
npm run build:non-prod-preview
```

That build writes the review index to `dist/index.html` and the latest main preview app to `dist/preview/`.

If you want to preview the production build locally:

```bash
npm run preview
```

## CI/CD Overview

GitHub Actions handles non-production previews and production deployments:

- Pull requests run separate `validate`, `unit_tests`, and `smoke_tests` jobs before any preview deploy.
- The `unit_tests` job enforces a minimum 60% global Jest coverage threshold.
- The `validate` job isolates formatting and TypeScript failures from test failures.
- The `smoke_tests` job uploads a Playwright HTML report artifact so the PR check links lead to inspectable test output.
- Same-repository pull requests deploy to Azure Static Web Apps pre-production environments after checks pass.
- Pull requests from forks run verification but do not deploy because they cannot access the preview deployment secret.
- Pushes to `main` deploy a protected preview index to the Azure Static Web Apps production environment and serve the latest main preview at `/preview/`.
- Closing or merging a same-repository pull request closes the matching Azure Static Web Apps pre-production environment.
- Pushes of version tags like `v1.2.3` rerun verification, deploy with blue/green slots to Hostinger over SFTP, and create a GitHub release for that tag.

The workflows live in:

- `.github/workflows/non-prod-preview.yml`
- `.github/workflows/deploy-production.yml`

Detailed testing/deployment plan:

- `docs/test-plan.md`

## GitHub Setup

### 1. Configure Branch Protection For `main`

GitHub branch protection is a repository setting, not a tracked file in this repo. Configure it manually:

1. Open `Settings -> Branches`.
2. Add a branch protection rule for `main`.
3. Require at least one approval before merge.
4. Require status checks to pass before merge.
5. Select `validate`, `unit_tests`, and `smoke_tests` from the GitHub Actions workflows.
6. Restrict direct pushes to `main`.

This is what ensures release tags are only cut from reviewed code that has already landed on `main`.

### 2. Configure GitHub Environments

This setup uses two custom repository environments:

- `non-prod-preview`
- `prod`

GitHub environments can enforce required reviewers, wait timers, deployment branch restrictions, and separate secrets and variables. GitHub documents these controls in its deployment environment docs and notes that jobs referencing an environment create deployment records with an optional `environment_url`. [GitHub docs](https://docs.github.com/en/actions/reference/environments) [GitHub docs](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/using-environments-for-deployment?apiVersion=2022-11-28)

Recommended configuration:

1. Open `Settings -> Environments`.
2. Create an environment named `non-prod-preview`.
3. Add the Azure Static Web Apps deployment token secret listed below to `non-prod-preview`.
4. Create or keep an environment named `prod`.
5. On `prod`, optionally require reviewer approval before the deploy job runs.
6. On `prod`, optionally restrict deployments to release tags.
7. On `prod`, add the Hostinger secrets listed below.
8. On `prod`, optionally add a variable named `PROD_SITE_URL` with the public production site URL so GitHub shows a clickable deployment URL for production.

### 3. Add Azure Static Web Apps Secret

The non-production preview workflow deploys to this Azure Static Web Apps resource:

- Resource group: `rg-elevated-thinking-preview`
- Static Web App: `elevated-thinking-preview-swa`
- SKU: Free

Create or update the Azure resource:

```bash
az group create \
  --name rg-elevated-thinking-preview \
  --location eastus2

az staticwebapp create \
  --name elevated-thinking-preview-swa \
  --resource-group rg-elevated-thinking-preview \
  --location eastus2 \
  --sku Free
```

Get the deployment token:

```bash
az staticwebapp secrets list \
  --name elevated-thinking-preview-swa \
  --resource-group rg-elevated-thinking-preview \
  --query properties.apiKey \
  --output tsv
```

Add that value as this exact secret on the `non-prod-preview` GitHub environment:

- `AZURE_STATIC_WEB_APPS_API_TOKEN_NONPROD_PREVIEW`

### 4. Add Preview Reviewers

The preview site uses Azure Static Web Apps authentication. Users must sign in with GitHub and must have accepted an invitation for the custom `reviewer` role before they can view any route.

Get the default hostname:

```bash
az staticwebapp show \
  --name elevated-thinking-preview-swa \
  --resource-group rg-elevated-thinking-preview \
  --query defaultHostname \
  --output tsv
```

Invite an approved GitHub user:

```bash
az staticwebapp users invite \
  --name elevated-thinking-preview-swa \
  --resource-group rg-elevated-thinking-preview \
  --authentication-provider GitHub \
  --user-details <github-login> \
  --roles reviewer \
  --domain <default-static-web-app-hostname> \
  --invitation-expiration-in-hours 168
```

Uninvited users can authenticate with GitHub, but Azure Static Web Apps denies access because they do not have the `reviewer` role.

### 5. Disable GitHub Pages

GitHub Pages is no longer used for non-production previews. Disable it so the old `github.io` preview URLs stop serving:

```bash
gh api -X DELETE repos/eslutz/Elevated-Thinking-Website/pages
```

Then delete obsolete Pages branches:

```bash
git ls-remote --heads origin gh-pages gh_pages
git push origin --delete gh-pages
git push origin --delete gh_pages # only if the branch exists
git fetch origin --prune
```

UI fallback: open `Settings -> Pages` and set the source to `None`.

### 6. Add Hostinger Secrets

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

The default hostname for `elevated-thinking-preview-swa` serves the non-production review index:

- Root review index: `https://delightful-plant-05da2520f.7.azurestaticapps.net/`
- Latest main preview: `https://delightful-plant-05da2520f.7.azurestaticapps.net/preview/`

The root review index links to the latest main preview and to open pull request previews. It includes a build-time fallback list and refreshes the pull request list from the public GitHub API in the browser.

Same-repository pull requests get Azure Static Web Apps pre-production URLs such as `https://delightful-plant-05da2520f-13.eastus2.7.azurestaticapps.net/`. The workflow posts the generated URL to the pull request after deployment succeeds. Azure Static Web Apps keeps the same pre-production URL for the life of the pull request and removes that environment when the pull request closes.

All preview routes are protected by `public/staticwebapp.config.json`:

- Unauthenticated users are redirected to `/.auth/login/github`.
- Authenticated users without the `reviewer` role are denied.
- Invited reviewers who accepted the invitation can view the site.

The old GitHub Pages preview URLs are retired. GitHub Pages is disabled for this repository, and the old `gh-pages` branch is deleted.

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
- To rebuild a preview, push a new commit to the PR branch or rerun the non-production preview workflow.

## Action Versioning

The workflows are pinned to the current latest official tags that were available when this was updated:

- `actions/checkout@v6.0.2`
- `actions/setup-node@v6.4.0`
- `actions/upload-artifact@v7.0.1`
- `actions/download-artifact@v8.0.1`
- `actions/github-script@v9.0.0`
- `Azure/static-web-apps-deploy@v1`

Those versions were verified from the official GitHub action release pages:

- [actions/checkout releases](https://github.com/actions/checkout/releases)
- [actions/setup-node releases](https://github.com/actions/setup-node/releases)
- [actions/upload-artifact releases](https://github.com/actions/upload-artifact/releases)
- [actions/download-artifact releases](https://github.com/actions/download-artifact/releases)
- [actions/github-script releases](https://github.com/actions/github-script/releases)
- [Azure/static-web-apps-deploy releases](https://github.com/Azure/static-web-apps-deploy/releases)

Dependabot is also configured in `.github/dependabot.yml` to keep GitHub Actions and npm dependencies up to date automatically.

## Main Project Files

- `package.json` - project dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `tsconfig.node.json` - TypeScript configuration for Vite config
- `vite.config.ts` - Vite configuration
- `index.html` - HTML shell used by Vite
- `public/staticwebapp.config.json` - Azure Static Web Apps auth and routing rules for non-production previews
- `src/App.tsx` - main page component
- `src/main.tsx` - React entry point
- `src/styles.css` - global styles and Tailwind import
