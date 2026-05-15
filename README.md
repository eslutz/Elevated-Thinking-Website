# Elevated Thinking Website

Static Vite + React + TypeScript site with Tailwind bundled through Vite.

## Requirements

- Node.js 24 or newer recommended
- npm

## Local Development

Install dependencies and start Vite:

```bash
npm install
npm run dev
```

Vite prints the local URL, usually `http://localhost:5173`.

Useful local checks:

```bash
npm run format:check
npm run typecheck
npm run test:unit
npm run test:smoke
```

Use `npm run format` to apply Prettier formatting. Smoke tests use Playwright Chromium; if the browser runtime is missing locally, run:

```bash
npx playwright install --with-deps chromium
```

Formatting is enforced before commit with `.githooks/pre-commit`. `npm install` runs `prepare`, which configures Git to use that hooks directory.

### Preview The Production Build Locally

This only builds and serves the production bundle on your machine. It does not deploy to production.

```bash
npm run build
npm run preview
```

The production bundle is written to `dist/`.

## CI/CD Overview

GitHub Actions runs separate validation, unit test, and smoke test jobs for pull requests, pushes to `main`, and production release tags.

- `validate` runs formatting and TypeScript checks.
- `unit_tests` runs Jest with coverage. The project enforces a 60% global coverage threshold.
- `smoke_tests` builds the site, serves the production bundle locally, runs Playwright Chromium smoke tests, and includes the axe accessibility scan.
- Same-repository pull requests deploy protected Azure Static Web Apps preview environments after checks pass.
- Fork pull requests run checks but do not deploy because they cannot access deployment secrets.
- Pushes to `main` publish the protected non-production review index and latest main preview.
- Pushed release tags matching `v*` run production verification and deploy to Hostinger.

## GitHub Environments

The repository uses two GitHub environments.

### `non-prod-preview`

Used by the non-production preview workflow for the review index, latest main preview, pull request previews, and PR preview cleanup.

Required secret:

| Name                                              | Used for                                                         | Value                                                                          |
| ------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `AZURE_STATIC_WEB_APPS_API_TOKEN_NONPROD_PREVIEW` | Deploying and closing Azure Static Web Apps preview environments | Deployment token from the `elevated-thinking-preview-swa` Azure Static Web App |

The Azure Static Web Apps resource is:

- Resource group: `rg-elevated-thinking-preview`
- Static Web App: `elevated-thinking-preview-swa`
- Region: `eastus2`

### `prod`

Used by the production deploy and rollback jobs. Configure required reviewers here if production releases or rollbacks should wait for manual approval before the workflow can access production secrets.

Required secrets:

| Name                    | Used for            | Recommended value       |
| ----------------------- | ------------------- | ----------------------- |
| `HOSTINGER_HOST`        | SFTP host           | Hostinger SFTP hostname |
| `HOSTINGER_PORT`        | SFTP port           | `22`                    |
| `HOSTINGER_USERNAME`    | SFTP username       | Hostinger SFTP username |
| `HOSTINGER_PASSWORD`    | SFTP password       | Hostinger SFTP password |
| `HOSTINGER_REMOTE_PATH` | Production web root | `public_html/`          |

Optional variable:

| Name            | Used for                                  | Value                      |
| --------------- | ----------------------------------------- | -------------------------- |
| `PROD_SITE_URL` | GitHub deployment URL for production jobs | Public production site URL |

`GITHUB_TOKEN` is provided automatically by GitHub Actions and does not need to be configured.

## Preview Deployments

Preview sites are protected by Azure Static Web Apps authentication. Users sign in with GitHub and must have the `reviewer` role to access preview routes.

- Review index: `https://delightful-plant-05da2520f.7.azurestaticapps.net/`
- Latest main preview: `https://delightful-plant-05da2520f.7.azurestaticapps.net/preview/`
- Pull request previews: `https://delightful-plant-05da2520f.7.azurestaticapps.net/preview/pr/<number>/`

The review index links to the latest main preview and open same-repository pull request previews. Pull request previews are deployed under the protected review host so reviewers use the same GitHub sign-in and `reviewer` role assignment for every preview.

To request access, ask a project administrator to invite your GitHub account to the Azure Static Web Apps `reviewer` role for `elevated-thinking-preview-swa`. Uninvited users can authenticate but will be denied access.

## Production Deployment

Production deploys run when a release tag matching `v*` is pushed.

Recommended release flow:

```bash
npm version patch
git push --follow-tags
```

Use `patch`, `minor`, or `major` as appropriate. `npm version` updates `package.json` and `package-lock.json`, creates the release commit, and creates the matching tag. `git push --follow-tags` pushes the commit and tag, which starts the production workflow.

The workflow verifies that the Git tag matches the package version, runs formatting, TypeScript, unit, and smoke checks, uploads the built `dist/` artifact, deploys it to the inactive Hostinger blue/green slot, promotes that same build to the live Hostinger web root, updates `.deploy-slots/.active-slot`, and creates the GitHub release.

If the `prod` environment has required reviewers, the deployment pauses for approval before accessing Hostinger secrets.

## Production Retry And Rollback

To retry a failed production deployment, open the failed `Production Deploy` run in GitHub Actions and choose **Re-run jobs**.

To roll back production:

1. Open **Actions -> Production Deploy**.
2. Choose **Run workflow**.
3. Set `operation` to `rollback`.
4. Leave `rollback_slot` empty for the workflow to automatically select the opposite of the current active slot.
5. Run the workflow.

Production keeps two remote slots at `HOSTINGER_REMOTE_PATH/.deploy-slots/blue` and `HOSTINGER_REMOTE_PATH/.deploy-slots/green`. The active slot is stored in `HOSTINGER_REMOTE_PATH/.deploy-slots/.active-slot`. A normal deployment writes the new release to the inactive slot, promotes it live, and marks that slot active.

For rollback, leaving `rollback_slot` empty is usually correct: the workflow reads `.active-slot` and rolls back to the other slot. Only set `rollback_slot=blue` or `rollback_slot=green` when you intentionally need a specific slot, such as after confirming the desired target from a previous workflow log or from the remote `.active-slot` marker.
