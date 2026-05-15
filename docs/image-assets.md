# Image Assets

Production page photography is self-hosted from optimized files in
`src/assets/images/optimized/`. Original source downloads are cached locally in
`.cache/image-sources/` and are intentionally ignored by Git.

## Regenerating Images

Run:

```bash
npm run images:build
```

The script downloads any missing source files into `.cache/image-sources/`,
generates AVIF, WebP, and JPEG variants at `640`, `960`, `1280`, and `1600`
pixels wide, strips metadata, converts to sRGB, and enforces these budgets:

- Total generated image set: `10 MB`
- Any single generated image: `500 KB`

## Sources

| Usage                     | Local slug         | Unsplash photo ID                  | Source URL                                                     |
| ------------------------- | ------------------ | ---------------------------------- | -------------------------------------------------------------- |
| Hero                      | `hero`             | `photo-1586717791821-3f44a563fa4c` | `https://images.unsplash.com/photo-1586717791821-3f44a563fa4c` |
| Product strategy          | `product-strategy` | `photo-1501504905252-473c47e087f8` | `https://images.unsplash.com/photo-1501504905252-473c47e087f8` |
| Service & workflow design | `service-workflow` | `photo-1743385779347-1549dabf1320` | `https://images.unsplash.com/photo-1743385779347-1549dabf1320` |
| UX research & design      | `ux-research`      | `photo-1573497620053-ea5300f94f21` | `https://images.unsplash.com/photo-1573497620053-ea5300f94f21` |
| AI-enabled delivery       | `ai-delivery`      | `photo-1541560052-5e137f229371`    | `https://images.unsplash.com/photo-1541560052-5e137f229371`    |

## Rules For Future Images

- Do not reference `images.unsplash.com` directly from React components for
  production page photography.
- Do not commit original source downloads unless there is a specific archival
  requirement.
- Store long-term source masters outside Git, such as in an asset bucket or
  shared drive, and document that location here.
- Reconsider Git LFS only if large binary originals become part of the tracked
  repository workflow.
