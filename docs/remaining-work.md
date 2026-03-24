# Remaining Work

The GitHub repository configuration has already been applied with `gh` for these items:

- repository visibility changed to `public`
- `prod` environment created
- `gh-pages` branch created
- GitHub Pages enabled from `gh-pages` at `/`
- default `GITHUB_TOKEN` workflow permission set to `write`
- branch protection enabled on `main`
  - requires PR review
  - requires 1 approval
  - requires the `verify` status check
  - requires branches to be up to date before merge
  - requires conversation resolution
  - disallows force-pushes
  - disallows branch deletion
- `prod` environment restricted to protected branches
- `prod` environment requires deployment approval from `eslutz`

What is still left is mainly supplying production-specific values and validating the first live runs.

GitHub Pages uses its own managed `github-pages` environment for preview hosting. That is expected in this setup.

## 1. Add the Hostinger production secrets

Add these exact secret names to the GitHub `prod` environment:

- `HOSTINGER_HOST`
  - Value: the Hostinger SFTP hostname for production
- `HOSTINGER_USERNAME`
  - Value: the Hostinger SFTP username for production
- `HOSTINGER_PASSWORD`
  - Value: the Hostinger SFTP password for production
- `HOSTINGER_REMOTE_PATH`
  - Value for this setup: `public_html/`

Optional secret:

- `HOSTINGER_PORT`
  - Value: the Hostinger SFTP port
  - Default if omitted by the workflow: `22`

Where to add them:

- `Settings -> Environments -> prod -> Environment secrets`

## 2. Confirm the Hostinger values before the first prod deploy

Verify all of these with Hostinger:

- the correct SFTP host for `HOSTINGER_HOST`
- the correct SFTP username for `HOSTINGER_USERNAME`
- the correct SFTP password for `HOSTINGER_PASSWORD`
- the correct document root for `HOSTINGER_REMOTE_PATH`
- whether SFTP is enabled on the account
- whether port `22` is correct

The production workflow uses `lftp mirror --reverse --delete`, so `HOSTINGER_REMOTE_PATH` must point at the real production web root.

## 3. Optionally add the production site URL variable

If you want the GitHub `prod` environment to show a clickable deployment URL, add this environment variable on `prod`:

- `PROD_SITE_URL`
  - Example: `https://www.elevatedthinking.co/`

Where to add it:

- `Settings -> Environments -> prod -> Environment variables`

This is optional. The workflow will still run without it.

## 4. Run the first PR preview deployment

Open or update a pull request from a branch in this repository, then confirm:

- the `PR Preview` workflow runs successfully
- the preview is published under:
  - `https://eslutz.github.io/Elevated-Thinking-Website/previews/pr-<number>/`
- the workflow posts or updates the PR preview comment
- the preview URL loads correctly

## 5. Run the first production deployment

After the `prod` secrets are added:

1. Merge an approved pull request into `main`.
2. Approve the pending `prod` deployment when GitHub pauses it for environment review.
3. Confirm the `Production Deploy` workflow succeeds.
4. Confirm the site is uploaded to Hostinger successfully.
5. Confirm a GitHub release is created with a tag in the format:
   - `prod-<full-commit-sha>`
6. Open the production domain and verify the live site.

Also verify:

- `index.html` exists in the Hostinger web root
- `assets/` exists in the Hostinger web root
- old asset files are removed on later deploys

## 6. Verify preview cleanup

After a PR preview has been published, close or merge that PR and confirm:

- the `cleanup_preview` job runs
- `previews/pr-<number>/` is removed from `gh-pages`
- the old preview URL no longer serves that PR build

## 7. Optional future enhancements

These are not required for the current pipeline:

- support preview deployments for forked pull requests
- switch Hostinger auth from password-based SFTP to SSH key auth
- use a custom preview domain instead of the default GitHub Pages URL
