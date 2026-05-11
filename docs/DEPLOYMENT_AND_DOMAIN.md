# Deployment And Domain Context

## Hosting

HelixA is hosted on Vercel.

Vercel settings for this Vite app:

```txt
Install Command: npm install
Build Command: npm run build
Output Directory: dist
```

## Required Vercel Environment Variables

Copy local `.env` values into Vercel project settings:

```txt
VITE_SUPABASE_PROJECT_ID
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_URL
```

Future server-side Edge Function secrets, such as Claude/Anthropic API keys, must be configured in Supabase secrets or server-side deployment settings, not as frontend `VITE_` variables.

## Current Domain Plan

Domain:

```txt
helixa-sync.com
```

Registrar:

```txt
Lovable
```

Desired DNS provider:

```txt
Cloudflare
```

Target hosting:

```txt
Vercel
```

## Domain Migration Plan

1. Add `helixa-sync.com` to the Vercel project under Settings > Domains.
2. Add the domain to Cloudflare.
3. In Lovable, change nameservers to the two Cloudflare nameservers.
4. Wait for nameserver propagation.
5. In Cloudflare DNS, add the records Vercel requests.
6. Verify the domain in Vercel.

Typical Vercel DNS records are:

```txt
A      @      76.76.21.21
CNAME  www    cname.vercel-dns.com
```

Always use the exact values Vercel shows for the project.

## Git Workflow

Recommended workflow:

1. Work locally in `/Users/enterclawdbotrunner/Documents/GitHub/helixa-sync`.
2. Commit with GitHub Desktop or CLI.
3. Push branches to GitHub.
4. Let Vercel create preview deployments for branches.
5. Merge to `main` for production.

## Verification Commands

Before pushing meaningful changes:

```bash
npm test
npm run build
```

Run lint too, but note that it currently fails on existing code quality issues:

```bash
npm run lint
```

