# CascadeNet Demo Script

## One-line pitch

CascadeNet predicts cross-rack cascading failures before they cause downtime, then turns that prediction into an ROI-aware maintenance action your operations team can execute immediately.

## 90-second judge flow

### 1. Open on the risk state

Start the demo on the default `Cascade Risk` view.

Say:

> Traditional monitoring tells you one rack is hot. CascadeNet tells you which neighboring rack fails next, when it fails, and what fix prevents it.

Point to:

- headline and calm luxury UI
- `87%` cascade risk
- `$250K` downtime avoided
- `8.2 kW` cooling saved

### 2. Show the live twin

Say:

> We create a live twin of the aisle without needing CAD files. Every rack becomes part of a spatial system, not an isolated sensor reading.

Point to:

- rack positions in the twin
- thermal, airflow, and power dependency edges
- zone cards showing thermal shadow intensity

### 3. Show the cross-rack prediction

Say:

> In this scenario, Rack 4 is partially blocked. That changes pressure and heat flow across the aisle, which raises the predicted failure risk for Rack 7 within 72 hours.

Point to:

- Rack 4 marked `critical`
- Rack 7 marked `critical`
- modality bars for airflow, vibration, cable, and acoustic stress

### 4. Show the action layer

Say:

> CascadeNet does not stop at detection. It generates the exact HMAX-style work order with financial and sustainability context.

Point to:

- `Clean Rack 4 intake filters`
- `Apply Row B fan optimization`
- ROI and CO2 impact lines
- HMAX JSON payload card

### 5. Close the loop

Switch to `Resolved Loop`.

Say:

> After the technician performs the fix, risk collapses, cooling improves, and the system learns from the verified outcome. That creates a self-improving maintenance loop, not just another dashboard.

Point to:

- `12%` cascade risk
- `+3.2%` model gain
- resolved timeline

## 30-second version

> CascadeNet is a live data center nervous system. It watches airflow, vibration, cables, and sound across entire rack rows, predicts cascading failures up to 72 hours ahead, and issues ROI-aware work orders that prevent outages before they spread.

## Backup answers if judges ask

### Why is this different?

- It models rack-to-rack dependencies instead of isolated alerts.
- It turns perception into action through work orders and business impact.
- It is demoable with commodity cameras and a simulated inference layer.

### What is real in this prototype?

- Full product experience
- Scenario engine and dependency graph
- HMAX-style decision output
- Clear architecture for expansion into CV, SLAM, PINNs, and ST-GAT

### What would you build next?

- Replace seeded signals with live camera and telemetry ingestion
- Add persistent event history and operator authentication
- Export incidents directly into enterprise maintenance workflows
