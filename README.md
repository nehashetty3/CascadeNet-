# CascadeNet

CascadeNet is a data center operations prototype for predicting cross-rack cascading failures before they become downtime. It combines a digital twin interface, multi-modal rack health sensing, dependency-aware risk propagation, and maintenance recommendations in a presentation-ready control console.

This repo now includes both:

- a production-style `Next.js` operator dashboard
- a Python `ai-backend` that implements the core CV/ML/audio/graph/physics concepts from the pitch

## One-Minute Pitch

Traditional monitoring tools alert on isolated symptoms. CascadeNet models the aisle as an interconnected system.

In the core demo flow:

1. Rack 4 develops an intake obstruction.
2. The twin shows thermal and airflow coupling across the row.
3. Rack 7 becomes a downstream failure risk.
4. CascadeNet generates an intervention path before the failure window lands.

The point is not just to show that a rack is unhealthy. The point is to show what fails next, why it fails next, and what action prevents the cascade.

## Why This Stands Out

- Cross-rack reasoning instead of isolated rack alerts
- Operator-facing digital twin instead of raw telemetry tables
- Multi-modal sensing story across airflow, vibration, cable, and acoustic risk
- Live artifact bridge from a real CV pipeline into the web dashboard
- Clear enterprise story through HMAX-style work orders, ROI framing, and deployable web UX

## What Is In This Repo

### 1. Web application

The web app is a serious operations console built with:

- `Next.js 15`
- `React 19`
- `TypeScript`
- App Router API routes
- custom CSS

Key files:

- [Dashboard UI](/Users/neha/Documents/New%20project/components/dashboard.tsx)
- [Dashboard API route](/Users/neha/Documents/New%20project/app/api/dashboard/route.ts)
- [Simulation and live-artifact bridge](/Users/neha/Documents/New%20project/lib/engine.ts)
- [Shared frontend types](/Users/neha/Documents/New%20project/lib/types.ts)

### 2. AI backend

The Python backend under [ai-backend](/Users/neha/Documents/New%20project/ai-backend/README.md) provides executable scaffolding for:

- computer vision
- machine learning
- audio models
- SLAM pose handling
- digital twin reconstruction
- ST-GAT-style graph forecasting
- PINN-style cooling optimization

Key backend files:

- [Vision pipeline](/Users/neha/Documents/New%20project/ai-backend/cascadenet_ai/pipelines/vision.py)
- [Live webcam or video obstruction path](/Users/neha/Documents/New%20project/ai-backend/cascadenet_ai/live_webcam.py)
- [Twin reconstruction](/Users/neha/Documents/New%20project/ai-backend/cascadenet_ai/pipelines/digital_twin.py)
- [Graph forecasting](/Users/neha/Documents/New%20project/ai-backend/cascadenet_ai/models/st_gat.py)
- [Cooling optimization](/Users/neha/Documents/New%20project/ai-backend/cascadenet_ai/models/pinn.py)
- [End-to-end backend runner](/Users/neha/Documents/New%20project/ai-backend/cascadenet_ai/run_demo.py)

Architecture notes are in [AI_ARCHITECTURE.md](/Users/neha/Documents/New%20project/docs/AI_ARCHITECTURE.md).

## Demo Modes

### Simulated console mode

The dashboard can run as a deterministic scenario engine for judging and screen recording.

### Live CV artifact mode

The dashboard can also ingest a saved obstruction artifact from the Python pipeline. That means the UI can reflect real file-based CV output instead of only seeded values.

## Screenshots

### Cascade risk

![Cascade risk dashboard](./public/screenshots/dashboard-cascade.png)

### Baseline

![Baseline dashboard](./public/screenshots/dashboard-baseline.png)

### Resolved state

![Resolved dashboard](./public/screenshots/dashboard-resolved.png)

## Local Development

### Web app

```bash
cd "/Users/neha/Documents/New project"
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). If port `3000` is busy, Next.js will automatically choose another local port such as `3001`.

### Python backend

```bash
cd "/Users/neha/Documents/New project/ai-backend"
python3 -m pip install -e .
python3 -m cascadenet_ai.run_demo
```

That writes:

- `ai-backend/artifacts/backend_snapshot.json`

## Live Video-Based CV Demo

If you do not want to grant camera permission, use the included sample rack video:

- [Sample rack feed](/Users/neha/Documents/New%20project/ai-backend/artifacts/sample-rack-feed.mp4)

Run:

```bash
cd "/Users/neha/Documents/New project/ai-backend"
python3 -m pip install opencv-python
python3 -m cascadenet_ai.live_webcam --video "/Users/neha/Documents/New project/ai-backend/artifacts/sample-rack-feed.mp4" --no-preview
```

That writes:

- `ai-backend/artifacts/live_webcam_obstruction.json`
- `ai-backend/artifacts/live_webcam_frame.png`

Then start the web app and set `Data source` to `Live webcam artifact`.

## Judge Walkthrough

Suggested flow:

1. Open the dashboard in `Cascade response`.
2. Explain the Rack 4 to Rack 7 dependency path.
3. Show the selected-rack detail panel and live event log.
4. Switch the data source to the live artifact-backed mode.
5. Show the work orders and risk shift.
6. Close with the AI backend architecture and the deployable product path.

The speaking version is in [DEMO_SCRIPT.md](/Users/neha/Documents/New%20project/docs/DEMO_SCRIPT.md).

## For Recruiters

This repo demonstrates:

- product thinking, not just model experimentation
- full-stack engineering across frontend, API, and backend tooling
- AI systems decomposition into perception, state reconstruction, graph inference, and optimization
- an ability to turn a research-heavy concept into a usable operator-facing interface
- demo engineering for hackathons, reviews, and stakeholder presentations

## Exact Vercel Deployment Steps

These steps match Vercel’s standard GitHub import flow for Next.js projects.

### Option A: Deploy from the Vercel dashboard

1. Push the repo to GitHub.
2. Go to [Vercel New Project](https://vercel.com/new).
3. Import `nehashetty3/CascadeNet-`.
4. Keep the detected framework as `Next.js`.
5. Leave the default build settings unless you intentionally changed them:
   - Install Command: `npm install`
   - Build Command: `next build`
   - Output Directory: leave blank
6. Set the production branch to `main` if prompted.
7. Click `Deploy`.

After that:

- every push to `main` updates production
- pushes to other branches create preview deployments

### Option B: One-click import link

You can also use a Vercel clone/import link:

[Deploy CascadeNet on Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnehashetty3%2FCascadeNet-)

### Recommended production notes

- The web app deploys directly on Vercel.
- The Python `ai-backend` is included in the repo for architecture and local execution, but it is not part of the deployed Next.js runtime.
- If you want live Python inference in production later, the best path is to expose the backend as a separate service and have the Next.js app read its artifacts or API.

## Project Structure

- `app/`: routes, layout, styles, and API endpoints
- `components/`: main dashboard UI
- `lib/`: scenario engine and live-artifact integration
- `ai-backend/`: CV/ML/audio/graph/physics backend
- `docs/`: demo and architecture notes
- `scripts/`: video and screenshot utilities
- `public/`: screenshots and demo media

## Notes

The web app is intentionally deterministic enough to be reliable during judging, screen recording, and GitHub review. The AI backend is where the repo now carries the technical concepts as executable code without forcing heavy ML runtime requirements into the deployed frontend.
