# AI Architecture

CascadeNet now contains two layers:

1. The existing Next.js command console for operator workflow and product storytelling.
2. A Python AI backend under `ai-backend/` that implements the core technical concepts from the pitch.

## Backend mapping

- Computer vision:
  - `ai-backend/cascadenet_ai/pipelines/vision.py`
  - Estimates airflow loss, obstruction severity, and thermal risk per rack.
  - `ai-backend/cascadenet_ai/pipelines/live_obstruction.py`
  - Adds a real webcam inference path for live obstruction scoring on an intake region.
- Audio models:
  - `ai-backend/cascadenet_ai/pipelines/audio.py`
  - Converts rack-level distress observations into arcing, bearing, and panel-rattle scores.
- SLAM:
  - `ai-backend/cascadenet_ai/pipelines/slam.py`
  - Preserves the contract for stereo pose tracking and can be replaced with ORB-SLAM3 output.
- Digital twin reconstruction:
  - `ai-backend/cascadenet_ai/pipelines/digital_twin.py`
  - Fuses observations, pose tracks, and modality signals into a live rack-state twin.
- ST-GAT training / inference scaffold:
  - `ai-backend/cascadenet_ai/models/st_gat.py`
  - Defines a lightweight graph model contract and spatial risk propagation logic.
- PINN optimization scaffold:
  - `ai-backend/cascadenet_ai/models/pinn.py`
  - Encodes cooling optimization outputs and a physics-informed neural network shell.

## Why this split matters

The frontend stays stable and presentation-friendly, while the backend can grow into real ingest, training, and inference without bloating the web app.

## Current maturity

- Executable today:
  - End-to-end synthetic backend demo
  - JSON artifact generation
  - Graph edges, risk ranking, and cooling recommendations
  - Live webcam obstruction detection with saved artifact output
- Ready for real model replacement:
  - ORB-SLAM3 pose ingestion
  - Gaussian Splatting / radiance-field twin reconstruction
  - PyTorch ST-GAT training loops
  - PINN training with CFD-informed losses

## Suggested next step

Bridge the live webcam artifact into the web app API so the dashboard can switch from seeded obstruction values to real camera-derived obstruction values.
