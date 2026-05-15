const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const stripProtocol = (value) =>
  String(value)
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "");

export const getPullRequestPreviewUrl = ({
  defaultHostName,
  pullRequestNumber,
  region,
}) => {
  const hostName = stripProtocol(defaultHostName);
  const firstDotIndex = hostName.indexOf(".");

  if (firstDotIndex === -1) {
    throw new Error("SWA default hostname must include a domain suffix.");
  }

  if (!region) {
    throw new Error("SWA preview region is required.");
  }

  const subdomain = hostName.slice(0, firstDotIndex);
  const suffix = hostName.slice(firstDotIndex + 1);

  return `https://${subdomain}-${pullRequestNumber}.${region}.${suffix}/`;
};

export const buildPreviewIndexHtml = ({
  mainPreviewUrl = "/preview/",
  openPullRequests = [],
  previewHost,
  previewRegion,
  repository,
}) => {
  const previewListItems = openPullRequests
    .map((pullRequest) => {
      const previewUrl =
        pullRequest.previewUrl ??
        getPullRequestPreviewUrl({
          defaultHostName: previewHost,
          pullRequestNumber: pullRequest.number,
          region: previewRegion,
        });

      return `  <li><a class="preview-link" href="${previewUrl}"><span>PR #${pullRequest.number}:</span>${escapeHtml(pullRequest.title)}</a></li>`;
    })
    .join("\n");

  const pullRequestLinks = openPullRequests.length
    ? `<ul class="preview-list" data-preview-list>\n${previewListItems}\n</ul>\n        <p class="empty-state" data-empty-state hidden>No open pull request previews.</p>`
    : '<ul class="preview-list" data-preview-list hidden></ul>\n        <p class="empty-state" data-empty-state>No open pull request previews.</p>';

  const runtimePreviewScript =
    repository && previewHost && previewRegion
      ? `<script>
      (() => {
        const repository = ${JSON.stringify(repository)};
        const previewHost = ${JSON.stringify(stripProtocol(previewHost))};
        const previewRegion = ${JSON.stringify(previewRegion)};
        const list = document.querySelector("[data-preview-list]");
        const emptyState = document.querySelector("[data-empty-state]");

        if (!repository || !previewHost || !previewRegion || !list || !emptyState) {
          return;
        }

        const getPreviewUrl = (pullRequestNumber) => {
          const firstDotIndex = previewHost.indexOf(".");

          if (firstDotIndex === -1) {
            return "#";
          }

          const subdomain = previewHost.slice(0, firstDotIndex);
          const suffix = previewHost.slice(firstDotIndex + 1);

          return \`https://\${subdomain}-\${pullRequestNumber}.\${previewRegion}.\${suffix}/\`;
        };

        const renderPullRequests = (pullRequests) => {
          list.replaceChildren();
          list.hidden = pullRequests.length === 0;
          emptyState.hidden = pullRequests.length !== 0;

          for (const pullRequest of pullRequests) {
            const item = document.createElement("li");
            const link = document.createElement("a");
            const label = document.createElement("span");

            link.className = "preview-link";
            link.href = getPreviewUrl(pullRequest.number);
            label.textContent = \`PR #\${pullRequest.number}:\`;
            link.append(label, document.createTextNode(pullRequest.title));
            item.append(link);
            list.append(item);
          }
        };

        const encodedRepository = repository
          .split("/")
          .map((part) => encodeURIComponent(part))
          .join("/");

        fetch(\`https://api.github.com/repos/\${encodedRepository}/pulls?state=open&per_page=100\`, {
          headers: { Accept: "application/vnd.github+json" },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Unable to load pull request previews.");
            }

            return response.json();
          })
          .then((pullRequests) =>
            renderPullRequests(
              pullRequests
                .filter(
                  (pullRequest) =>
                    pullRequest.head?.repo?.full_name?.toLowerCase() ===
                    repository.toLowerCase()
                )
                .map((pullRequest) => ({
                  number: pullRequest.number,
                  title: pullRequest.title,
                }))
            )
          )
          .catch(() => {
            emptyState.textContent = list.hidden
              ? "Unable to load pull request previews."
              : emptyState.textContent;
          });
      })();
    </script>`
      : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Elevated Thinking Preview Deployments</title>
    <style>
      :root {
        color-scheme: light;
        font-family: Inter, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        background: #f6f7f4;
        color: #263a36;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        background:
          linear-gradient(180deg, rgba(246, 247, 244, 0.96), rgba(255, 255, 255, 0.96)),
          #f6f7f4;
      }

      main {
        width: min(880px, calc(100% - 32px));
        margin: 0 auto;
        padding: 64px 0;
      }

      .masthead {
        border-bottom: 1px solid #d8ddd8;
        padding-bottom: 28px;
      }

      .eyebrow {
        margin: 0 0 12px;
        color: #526a64;
        font-size: 0.875rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      h1 {
        margin: 0;
        color: #1f2d2a;
        font-size: clamp(2rem, 5vw, 4rem);
        line-height: 1;
      }

      .lede {
        max-width: 660px;
        margin: 18px 0 0;
        color: #425a55;
        font-size: 1.1rem;
        line-height: 1.65;
      }

      section {
        padding: 32px 0 0;
      }

      h2 {
        margin: 0 0 14px;
        color: #263a36;
        font-size: 1.1rem;
      }

      a {
        color: inherit;
      }

      .main-preview {
        display: inline-flex;
        min-height: 48px;
        align-items: center;
        border-radius: 8px;
        background: #314f49;
        color: #ffffff;
        font-weight: 700;
        padding: 0 18px;
        text-decoration: none;
      }

      .main-preview:focus-visible,
      .preview-link:focus-visible {
        outline: 3px solid #cf4a0b;
        outline-offset: 3px;
      }

      .preview-list {
        display: grid;
        gap: 12px;
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .preview-link {
        display: grid;
        grid-template-columns: minmax(88px, max-content) 1fr;
        gap: 16px;
        align-items: center;
        min-height: 56px;
        border: 1px solid #d8ddd8;
        border-radius: 8px;
        background: #ffffff;
        padding: 14px 16px;
        text-decoration: none;
      }

      .preview-link:hover {
        border-color: #314f49;
      }

      .preview-link span {
        color: #cf4a0b;
        font-weight: 800;
      }

      .empty-state {
        margin: 0;
        color: #526a64;
      }

      [hidden] {
        display: none !important;
      }

      @media (max-width: 560px) {
        main {
          padding: 40px 0;
        }

        .preview-link {
          grid-template-columns: 1fr;
          gap: 6px;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <header class="masthead">
        <p class="eyebrow">Non-production review</p>
        <h1>Preview Deployments</h1>
        <p class="lede">Use this page to open the latest main preview or a deployed pull request preview. Access requires GitHub sign-in and the Azure Static Web Apps reviewer role.</p>
      </header>

      <section aria-labelledby="main-preview-heading">
        <h2 id="main-preview-heading">Latest main preview</h2>
        <a class="main-preview" href="${mainPreviewUrl}">Open latest main preview</a>
      </section>

      <section aria-labelledby="pull-request-preview-heading">
        <h2 id="pull-request-preview-heading">Open pull request previews</h2>
        ${pullRequestLinks}
      </section>
    </main>
    ${runtimePreviewScript}
  </body>
</html>
`;
};
