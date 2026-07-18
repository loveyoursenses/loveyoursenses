# Love Your Senses

Static Love Your Senses website with a shared build-time header and footer.

## Edit the navigation once

Update these shared files:

- `_includes/header.html`
- `_includes/footer.html`
- `assets/site-chrome.css`

Every source HTML page contains `<!-- HEADER_INCLUDE -->` and `<!-- FOOTER_INCLUDE -->`. The build script replaces those markers with the shared components.

## Build locally

```bash
npm run build
```

The complete deployable website is generated in `dist/`.

## Cloudflare Pages settings

- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Root directory:** leave blank

The build uses Node.js only and has no third-party dependencies.

## Adding a new page

Create the page in its normal folder, include both markers inside `<body>`, and commit it. The next Cloudflare build injects the shared header and footer automatically.
