import {
  buildPreviewIndexHtml,
  getPullRequestPreviewUrl,
} from "../../scripts/preview-index.mjs";

describe("preview index", () => {
  it("links to the latest main preview and open pull request previews", () => {
    const html = buildPreviewIndexHtml({
      mainPreviewUrl: "/preview/",
      openPullRequests: [
        { number: 27, title: "Restore <preview> index" },
        { number: 31, title: "Add auth checks" },
      ],
      previewHost: "delightful-plant-05da2520f.7.azurestaticapps.net",
      previewRegion: "eastus2",
    });

    expect(html).toContain('href="/preview/"');
    expect(html).toContain(
      'href="https://delightful-plant-05da2520f-27.eastus2.7.azurestaticapps.net/"'
    );
    expect(html).toContain(
      'href="https://delightful-plant-05da2520f-31.eastus2.7.azurestaticapps.net/"'
    );
    expect(html).toContain("PR #27:");
    expect(html).toContain("Restore &lt;preview&gt; index");
  });

  it("can derive an Azure Static Web Apps pull request preview URL", () => {
    expect(
      getPullRequestPreviewUrl({
        defaultHostName: "delightful-plant-05da2520f.7.azurestaticapps.net",
        pullRequestNumber: 13,
        region: "eastus2",
      })
    ).toBe(
      "https://delightful-plant-05da2520f-13.eastus2.7.azurestaticapps.net/"
    );
  });
});
