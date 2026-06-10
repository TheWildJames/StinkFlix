# StinkFlix Proxy (Cloudflare Workers)

This Cloudflare Workers proxy filters ads, adult content, and malicious redirects from stream sources.

## Features

- **Blocks adult/porn domains** - Filters known adult content domains
- **Blocks ad networks** - Blocks popunder.js, popads.net, monetag.com, etc.
- **Blocks malware domains** - Filters known malware/scam domains
- **CORS enabled** - Allows cross-origin requests from your frontend
- **Free tier** - 100k requests/day, unlimited reverse bandwidth

## Setup

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
# or
npx wrangler --version
```

### 2. Login to Cloudflare

```bash
npx wrangler login
```

### 3. Deploy

```bash
npx wrangler deploy
```

This will deploy to `stinkflix-proxy.<your-subdomain>.workers.dev`

### 4. Update Frontend

Replace the proxy URL in `src/lib/streamSources.ts`:

```typescript
// Change this:
{ name: 'StreamSB', url: `/api/proxy?url=https://streamsb.net/e/${imdbId}.mp4`, ... }

// To your deployed worker URL:
{ name: 'StreamSB', url: `https://stinkflix-proxy.your-subdomain.workers.dev/api/proxy?url=https://streamsb.net/e/${imdbId}.mp4`, ... }
```

## Custom Domain (Optional)

Add a custom domain in Cloudflare Dashboard:
1. Go to Workers > stinkflix-proxy > Triggers
2. Add Custom Domain
3. Point your domain (e.g., `proxy.stinkflix.com`)

## Blocked Domains

See `proxy.js` for the full list of blocked domains:
- Adult/porn domains: pornhub.com, xvideos.com, xnxx.com, etc.
- Ad networks: popads.net, monetag.com, adsterra.com, etc.
- Malware/scam: crackhub.site, linkvertise.com, etc.

## Environment Variables (Optional)

```toml
[vars]
ALLOWED_ORIGINS = "https://stinkflix.com,https://www.stinkflix.com"
LOG_LEVEL = "info"
```
