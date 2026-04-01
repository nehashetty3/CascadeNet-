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


## Project Structure

- `app/`: routes, layout, styles, and API endpoints
- `components/`: main dashboard UI
- `lib/`: scenario engine and live-artifact integration
- `ai-backend/`: CV/ML/audio/graph/physics backend
- `docs/`: demo and architecture notes
- `scripts/`: video and screenshot utilities
- `public/`: screenshots and demo media


