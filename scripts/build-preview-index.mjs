import { readFileSync, writeFileSync } from "node:fs";

const outputPath = process.argv[2] ?? "gh-pages/index.html";
const templatePath = new URL("./preview-index-template.html", import.meta.url);

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const repoName = process.env.REPO_NAME;
const openPRs = JSON.parse(process.env.OPEN_PRS_JSON ?? "[]");

if (!repoName) {
  throw new Error("REPO_NAME is required to build the preview index page.");
}

const openPRSection = openPRs.length
  ? `<ul>\n${openPRs
      .map(
        (pr) =>
          `  <li><a class="pr-link" href="/${repoName}/preview/pr-${pr.number}/">PR #${pr.number}: ${escapeHtml(pr.title)}</a></li>`
      )
      .join("\n")}\n</ul>`
  : "<p>No open pull requests.</p>";

const template = readFileSync(templatePath, "utf8");
const html = template
  .replaceAll("{{REPO_NAME}}", repoName)
  .replace("{{OPEN_PRS_SECTION}}", openPRSection);

writeFileSync(outputPath, html);
