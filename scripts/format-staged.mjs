import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

const prettierEligibleFile = /\.(css|html|js|json|jsx|md|ts|tsx|yml|yaml)$/i;
const npx = process.platform === "win32" ? "npx.cmd" : "npx";

const stagedOutput = execFileSync(
  "git",
  ["diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z"],
  { encoding: "utf8" }
);

const stagedFiles = stagedOutput
  .split("\0")
  .filter(Boolean)
  .filter((file) => prettierEligibleFile.test(file))
  .filter((file) => existsSync(file));

if (stagedFiles.length === 0) {
  process.exit(0);
}

execFileSync(npx, ["prettier", "--write", ...stagedFiles], {
  stdio: "inherit",
});

execFileSync("git", ["add", "--", ...stagedFiles], {
  stdio: "inherit",
});
