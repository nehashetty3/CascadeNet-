# CascadeNet

**CascadeNet is a multi-modal data center operations prototype that predicts cross-rack cascading failures before they become downtime.**  
It combines a digital twin control console, live CV artifact ingestion, graph-based risk propagation, and HMAX-style maintenance actions in a system designed to feel like an operator product, not just a model demo.

![CascadeNet Dashboard](./public/screenshots/dashboard-cascade.png)

## Why This Project Matters

Most monitoring stacks tell operators that a rack is already hot, noisy, or unstable.

CascadeNet asks a higher-value question:

**What fails next, why does it fail next, and what intervention prevents the cascade?**

That shift matters in data centers, because costly outages often emerge from dependencies across airflow, thermal spill, vibration, and shared power infrastructure, not from one isolated metric crossing a threshold.

## What CascadeNet Does

- models a row of racks as an interconnected physical system
- visualizes the aisle as a digital twin instead of a flat dashboard
- tracks multi-modal rack health across airflow, vibration, cable, and acoustic signals
- predicts downstream risk propagation rather than only local anomalies
- converts risk into action through prioritized maintenance recommendations
- supports both deterministic demo mode and live CV artifact-driven mode



## System Overview

CascadeNet is built in two layers.

### 1. Operator Console

The web app is a polished control-room interface built with:

- `Next.js 15`
- `React 19`
- `TypeScript`
- App Router API routes
- custom CSS

It handles:

- digital twin visualization
- operator controls
- event logs
- rack inspection views
- work orders
- live artifact display logic



### 2. AI Backend

The Python backend under `ai-backend/` contains executable scaffolding for:

- computer vision
- machine learning
- audio models
- SLAM pose handling
- digital twin reconstruction
- ST-GAT-style graph forecasting
- PINN-style cooling optimization

Architecture notes:

- `docs/AI_ARCHITECTURE.md`

## Product Flow

The UI is intentionally organized around operator decision-making.

### Header

The top section summarizes the current operational state with business-facing KPIs such as cascade risk, downtime exposure, cooling adjustment, and current source mode.

### Operator Inputs

The left control panel lets the user:

- switch between baseline, cascade, and resolved operating states
- tune dependency scale and fan assist
- choose between simulated mode and live CV artifact mode

### Active Event Log

This converts model state into operationally readable narrative: airflow restriction, route changes, downstream bearing stress, and workflow status.

### Digital Twin

The twin renders racks as physical nodes and overlays airflow, thermal, and power coupling paths so the user can see why risk is propagating through the aisle.

### Rack Detail

Selecting a rack surfaces:

- location
- temperature
- confidence
- failure window
- modality-level health bars

### Work Orders

The system does not stop at detection. It outputs maintenance recommendations with operational impact, ROI, and sustainability framing.

## Live CV Artifact Mode

CascadeNet is not limited to seeded UI states.

The dashboard can ingest a saved obstruction artifact from the Python backend. That means the web app can reflect real CV-derived obstruction values rather than only a hard-coded demo scenario.

Supported sources:

- live webcam feed
- prerecorded rack/server video

## Screenshots

### Cascade Response

![Cascade Response](./public/screenshots/dashboard-cascade.png)

### Baseline State

![Baseline State](./public/screenshots/dashboard-baseline.png)

### Resolved State

![Resolved State](./public/screenshots/dashboard-resolved.png)



## Measured Obstruction Detector Results

The current obstruction detector has a synthetic evaluation pipeline so the repo includes measurable results, not just architecture claims.

Latest synthetic benchmark results:

- `MAE`: `0.47%`
- `RMSE`: `0.62%`
- `MAPE`: `2.12%`
- `3-class accuracy`: `100%`
- `Threshold accuracy at 15% obstruction`: `100%`
- `Average confidence`: `74.87%`

Benchmark artifact:

- `ai-backend/artifacts/obstruction_evaluation.json`

Important note:

These numbers are for the current synthetic benchmark are as calibrated prototype metrics, not production-validated real-world accuracy.


