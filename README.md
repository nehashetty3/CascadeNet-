# HMAX RackSentinel

RackSentinel is a polished hackathon-ready demo for a data center monitoring platform that predicts cross-rack cascading failures, generates a live digital twin without CAD files, and emits HMAX-style work orders with ROI and sustainability context.

## What is included

- Minimal, luxury-leaning Next.js dashboard
- Scenario-driven digital twin demo: `baseline`, `cascade`, `resolved`
- Simulated quad-modal rack health signals
- Cross-rack dependency graph and work-order generation
- HMAX JSON payload preview suitable for integration demos

## Stack

- Next.js 15
- React 19
- TypeScript
- App Router API routes

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo flow

1. Start in `Cascade Risk`.
2. Show Rack 4 obstruction and Rack 7 failure risk.
3. Open the work-order panel and HMAX JSON payload.
4. Switch to `Resolved Loop` to show the verified fix and continual learning story.

## Project structure

- `app/` UI and API routes
- `components/` dashboard client UI
- `lib/` scenario data and simulation engine

## Notes

This repo is intentionally demo-oriented. It presents the full product narrative with deterministic seeded data so it is reliable during judging, recording, and GitHub review.
