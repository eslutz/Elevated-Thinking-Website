import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import { buildPreviewIndexHtml } from "./preview-index.mjs";

const outputPath = process.argv[2] ?? "dist/index.html";
const openPullRequests = JSON.parse(process.env.OPEN_PRS_JSON ?? "[]");
const mainPreviewUrl = process.env.MAIN_PREVIEW_URL ?? "/preview/";
const pullRequestPreviewBaseUrl =
  process.env.PULL_REQUEST_PREVIEW_BASE_URL ?? "";
const previewHost = process.env.SWA_DEFAULT_HOSTNAME ?? "";
const previewRegion = process.env.SWA_PREVIEW_REGION ?? "";
const repository = process.env.GITHUB_REPOSITORY ?? "";

if (
  (openPullRequests.length > 0 || repository) &&
  !pullRequestPreviewBaseUrl &&
  (!previewHost || !previewRegion)
) {
  throw new Error(
    "Set PULL_REQUEST_PREVIEW_BASE_URL or SWA_DEFAULT_HOSTNAME and SWA_PREVIEW_REGION to link pull request previews."
  );
}

const html = buildPreviewIndexHtml({
  mainPreviewUrl,
  openPullRequests,
  previewHost,
  pullRequestPreviewBaseUrl,
  previewRegion,
  repository,
});

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, html);
