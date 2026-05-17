# Medical Document Intelligence — Frontend Only Fix

This is a lightweight, deployment-safe frontend for Vercel. It does **not** use Next.js or heavy npm packages, so Vercel install/build should finish quickly.

## Why this version fixes your Vercel problem

Your previous frontend used a heavy Next.js setup. Vercel was spending a long time during `npm install` / build and showing engine warnings. This frontend has:

- zero external npm dependencies
- simple static build
- professional responsive UI
- Render backend integration
- upload + text analysis
- medication interaction checker
- knowledge graph visualization
- JSON export features

## Folder structure

```txt
frontend/
├── index.html
├── src/
│   ├── app.js
│   └── styles.css
├── scripts/
│   ├── build.mjs
│   └── dev.mjs
├── package.json
├── package-lock.json
├── vercel.json
└── .env.example
```

## Local test

```bash
cd frontend
npm install
npm run dev
```

Open:

```txt
http://localhost:3000
```

For local API connection:

```bash
NEXT_PUBLIC_API_URL=https://your-render-backend.onrender.com npm run dev
```

## Build test

```bash
npm run build
npm run start
```

The build creates:

```txt
dist/
```

## Vercel deployment settings

In Vercel, use these settings:

```txt
Framework Preset: Other
Root Directory: frontend
Install Command: npm install
Build Command: npm run build
Output Directory: dist
```

Very important: change Framework Preset from **Next.js** to **Other**.

## Vercel environment variable

Add this in Vercel:

```env
NEXT_PUBLIC_API_URL=https://your-render-backend.onrender.com
```

Example:

```env
NEXT_PUBLIC_API_URL=https://medical-document-intelligence.onrender.com
```

Do not add `/` at the end.

Correct:

```env
NEXT_PUBLIC_API_URL=https://medical-document-intelligence.onrender.com
```

Wrong:

```env
NEXT_PUBLIC_API_URL=https://medical-document-intelligence.onrender.com/
```

## Render backend CORS

In Render backend, add/update:

```env
FRONTEND_URL=https://your-vercel-project.vercel.app
```

Then redeploy backend.

## Backend endpoints used by this frontend

The frontend expects these endpoints:

```txt
GET  /health
POST /api/v1/documents/analyze
POST /api/v1/documents/upload
POST /api/v1/interactions/check
POST /api/v1/records/export
```

These match the backend project previously generated for Medical Document Intelligence.

## If Vercel still uses old Next.js setting

Go to:

```txt
Vercel Project → Settings → Build & Development Settings
```

Set:

```txt
Framework Preset: Other
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Then redeploy.
