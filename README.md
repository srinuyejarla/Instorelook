<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/2dde54c3-48c6-4357-ab50-8013f7084874

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Vercel deployment

Always run deployment commands from this exact application folder:

`C:\Users\sunny\Downloads\instorelook (4)\instorelook (3)`

In Vercel, set the project **Root Directory** to the repository folder that contains
`package.json`, `vercel.json`, `index.html`, `src`, and `api`. Use:

- Build command: `npm run build:web`
- Output directory: `dist`

The committed `vercel.json` rewrites frontend routes to `index.html` while keeping
`/api/*` serverless routes active. If the whole Vercel domain still shows a 404,
the Vercel Root Directory is pointing at the parent folder rather than this app
folder.

## Nearby real-world stores

The shopper's Nearby Stores screen requests browser location permission and then
loads nearby clothing/retail places from the server-side OpenStreetMap Overpass
adapter. Results can include the mapped name, category, address, phone, landmark,
distance, and a Google Maps directions link when those fields are available in
OpenStreetMap. The user must allow location access and be online.

For production traffic, configure `OSM_OVERPASS_URL` with a hosted or self-hosted
Overpass service and follow that service's usage policy. Public map data cannot
guarantee a phone number or landmark for every shop. Registered InStoreLook stores
remain separate from external map places and continue using the app catalog.
