# Image Assets

Production page photography is self-hosted from optimized files in
`src/assets/images/optimized/`. Original source files are kept outside Git and
can be placed locally in `.cache/image-sources/` when regeneration is needed.

## Regenerating Images

Run:

```bash
npm run images:build
```

The script reads local JPG source files from `.cache/image-sources/`, generates
AVIF, WebP, and JPEG variants at `640`, `960`, `1280`, and `1600` pixels wide,
strips metadata, converts to sRGB, and enforces these budgets:

- Total generated image set: `10 MB`
- Any single generated image: `500 KB`

## Source Files

| Usage                     | Local slug         | Expected local source path                  |
| ------------------------- | ------------------ | ------------------------------------------- |
| Hero                      | `hero`             | `.cache/image-sources/hero.jpg`             |
| Product strategy          | `product-strategy` | `.cache/image-sources/product-strategy.jpg` |
| Service & workflow design | `service-workflow` | `.cache/image-sources/service-workflow.jpg` |
| UX research & design      | `ux-research`      | `.cache/image-sources/ux-research.jpg`      |
| AI-enabled delivery       | `ai-delivery`      | `.cache/image-sources/ai-delivery.jpg`      |

## Rules For Future Images

- Do not reference remote image hosts directly from React components for
  production page photography.
- Do not commit original source files unless there is a specific archival
  requirement.
- Store long-term source masters outside Git, such as in an asset bucket or
  shared drive.
- Reconsider Git LFS only if large binary originals become part of the tracked
  repository workflow.
