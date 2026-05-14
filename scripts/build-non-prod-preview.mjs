import { copyFile, rm } from "node:fs/promises";

import { build } from "vite";

await rm("dist", { recursive: true, force: true });

await build({
  base: "/preview/",
  build: {
    emptyOutDir: false,
    outDir: "dist/preview",
  },
});

await copyFile(
  "public/staticwebapp.config.json",
  "dist/staticwebapp.config.json"
);
await rm("dist/preview/staticwebapp.config.json", { force: true });
await import("./build-preview-index.mjs");
