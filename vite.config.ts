import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import Sitemap from "vite-plugin-sitemap";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    Sitemap({
      hostname: "https://www.elevatedthinking.co",
      // The plugin discovers "/" from dist/index.html; add client-side routes here as the site grows.
      dynamicRoutes: [],
      generateRobotsTxt: true,
      robots: [{ userAgent: "*", allow: "/" }],
      readable: true,
    }),
  ],
});
