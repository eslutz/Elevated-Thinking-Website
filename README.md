# Elevated Thinking Website

This project is a minimal Vite + React + TypeScript single-page site with Tailwind bundled through Vite.

## Requirements

- Node.js 18+ recommended
- npm

## Local Development

Install dependencies:

```bash
npm install
```

Start the local dev server:

```bash
npm run dev
```

Vite will print a local URL, usually:

```text
http://localhost:5173
```

Open that URL in your browser to preview the site.

Check TypeScript types:

```bash
npm run typecheck
```

Format the project:

```bash
npm run format
```

## Production Build

Create the production build:

```bash
npm run build
```

This outputs the deployable static site to:

```text
dist/
```

If you want to preview the production build locally:

```bash
npm run preview
```

## Deploying To Hostinger

This site deploys as static files. You do not need a Node server on Hostinger for this setup.

1. Run the production build locally:

```bash
npm run build
```

2. In Hostinger, open the site’s file manager or connect with FTP.

3. Upload the contents of the local `dist/` folder to your site’s web root.

Common Hostinger web root locations are usually one of these:

- `public_html/`
- the domain’s assigned document root

Important: upload the files inside `dist/`, not the `dist` folder itself unless you specifically want the site nested under that path.

After upload, your deployed root should contain files like:

```text
index.html
assets/...
```

## Updating The Site

When you make content or design changes:

1. Edit the source files.
2. Run `npm run build` again.
3. Re-upload the updated contents of `dist/` to Hostinger.

## Main Project Files

- `src/App.tsx` - main page component
- `src/main.tsx` - React entry point
- `src/styles.css` - global styles and Tailwind import
- `index.html` - HTML shell used by Vite
- `vite.config.ts` - Vite config
