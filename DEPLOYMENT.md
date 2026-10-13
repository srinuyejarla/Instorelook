# InStoreLook deployment guide

## What is ready

InStoreLook is a Vite + React shopper app with a small Express server for local development and Vercel serverless functions for the public catalog API.

The shopper routes are shareable clean paths:

- `/` — shopper home
- `/search` and `/search?category=Tops` — discovery
- `/product/:id` — product detail
- `/store/:id` — store detail
- `/stores` — store discovery map/list
- `/saved` — local wishlist

The default deployment uses the explicit curated demo catalog. Demo items are labeled **Curated demo catalog** and are priced in USD for the US-focused experience. Legacy INR records are formatted with `₹`; prices are never relabeled by locale alone.

## Run locally

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

Checks:

```bash
npm run lint
npm run build
```

## Deploy the demo catalog to Vercel

The repository includes `vercel.json`, `api/customer/[...path].ts`, and a Vite-only `build:web` script for Vercel. The serverless deployment does not depend on the local SQLite file.

```bash
npm install -g vercel
vercel login
vercel link
vercel env add VITE_CATALOG_MODE production
# enter: demo
vercel --prod
```

If you prefer the Vercel dashboard, import this repository, keep the build command as `npm run build:web`, and keep the output directory as `dist`.

## MongoDB mode

Mongo mode is explicit and never silently falls back to demo data. Configure these Vercel environment variables before selecting it:

```text
CATALOG_SOURCE=mongo
VITE_CATALOG_MODE=mongo
MONGODB_URI=<private MongoDB connection string>
SESSION_SECRET=<long random value>
DEV_AUTH_SIMULATION=false
```

Mongo mode requires a reachable MongoDB deployment and a database allowlist for the Vercel runtime. The API returns a clear `503 MONGODB_NOT_CONFIGURED` or `503 MONGODB_UNAVAILABLE` response when setup is incomplete.

The local SQLite/seller flow remains a development compatibility path. It is not a durable multi-instance production database, and Vercel serverless functions must not use it as shared inventory storage.

## AI behavior

`/api/ai/tag` has a deterministic mock response by default. A `GEMINI_API_KEY` can be configured for the existing text-tagging integration. Real image uploads, image inference, SMS delivery, payments, and checkout are not claimed as complete.

## Deployment status

Local typecheck, production build, public API smoke checks, and clean-route shell checks have been run. A public Vercel URL is not included until a Vercel account is authenticated and the project is actually deployed; never treat a local URL as a deployment URL.
