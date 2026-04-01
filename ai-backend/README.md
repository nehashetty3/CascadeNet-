# CascadeNet AI Backend

This package adds real technical scaffolding behind the CascadeNet product demo. It is intentionally lightweight enough for a hackathon repo, but the modules map directly to the concepts in the pitch:

- computer vision
- audio modeling
- SLAM and digital twin reconstruction
- ST-GAT style graph forecasting
- PINN-style optimization

## What is implemented

- `vision.py`: airflow, obstruction, and thermal-risk feature extraction from synthetic stereo observations
- `live_obstruction.py`: live webcam ROI feature extraction and obstruction scoring from real frames
- `audio.py`: spectral feature extraction and acoustic distress scoring
- `slam.py`: pose-track builder that mirrors a SLAM front-end contract
- `digital_twin.py`: live rack-state reconstruction from pose tracks and sensor observations
- `st_gat.py`: a lightweight spatio-temporal graph attention model with a deterministic fallback
- `pinn.py`: a compact physics-informed optimizer for cooling recommendations with a deterministic fallback
- `run_demo.py`: orchestrates the full pipeline and exports a frontend-compatible snapshot
- `live_webcam.py`: opens a webcam, calibrates a clean intake baseline, and scores real obstruction live

## Install

Minimal:

```bash
cd ai-backend
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
```

Extended local research setup:

```bash
pip install -e ".[full]"
```

## Run the backend demo

```bash
cd ai-backend
python3 -m cascadenet_ai.run_demo
```

This prints a multi-stage inference summary and writes:

- `ai-backend/artifacts/backend_snapshot.json`

## Run live obstruction detection

Install the base package and OpenCV:

```bash
cd ai-backend
python3 -m pip install -e .
python3 -m pip install opencv-python
```

Then run from a webcam:

```bash
python3 -m cascadenet_ai.live_webcam
```

What it does:

- opens your webcam or reads a rack video file
- uses the center region as the intake inspection ROI
- spends a few seconds calibrating a clean baseline
- estimates obstruction percentage and airflow score from the live feed
- lets you press `b` to recalibrate, `s` to save, and `q` to quit

To use a prerecorded server/rack video instead of camera permission:

```bash
python3 -m cascadenet_ai.live_webcam --video "/absolute/path/to/rack-video.mp4" --no-preview
```

That will process the video, write the latest obstruction artifact, and let the Next.js dashboard pick it up automatically.

Artifacts written on save or exit:

- `ai-backend/artifacts/live_webcam_obstruction.json`
- `ai-backend/artifacts/live_webcam_frame.png`

## Design note

The current frontend remains deterministic for presentation reliability. This backend gives the repo a serious ML/CV foundation without forcing heavy native dependencies into the web app runtime.
