import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("production workflow", () => {
  const workflow = readFileSync(
    join(process.cwd(), ".github/workflows/deploy-production.yml"),
    "utf8"
  );

  it("verifies generated SEO files before uploading the production artifact", () => {
    const verifyStep = "- name: Verify generated SEO files";
    const uploadStep = "- name: Upload production artifact";

    expect(workflow).toContain(verifyStep);
    expect(workflow).toContain("test -f dist/sitemap.xml");
    expect(workflow).toContain("test -f dist/robots.txt");
    expect(workflow).toContain('grep -F "User-agent: *" dist/robots.txt');
    expect(workflow).toContain('grep -F "Allow: /" dist/robots.txt');
    expect(workflow).toContain(
      'grep -F "Sitemap: https://www.elevatedthinking.co/sitemap.xml" dist/robots.txt'
    );
    expect(workflow).toContain(
      'grep -F "https://www.elevatedthinking.co/" dist/sitemap.xml'
    );
    expect(workflow.indexOf(verifyStep)).toBeLessThan(
      workflow.indexOf(uploadStep)
    );
  });
});
