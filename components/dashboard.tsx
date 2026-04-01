"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, AudioLines, Cable, Fan, Move3D } from "lucide-react";
import type { DashboardSnapshot, MaintenanceMode, RackNode, ScenarioId } from "@/lib/types";

type ControlState = {
  scenario: ScenarioId;
  obstructionPct: number;
  dependencyScale: number;
  fanAssistPct: number;
  maintenanceMode: MaintenanceMode;
  useLive: boolean;
};

const initialControls: ControlState = {
  scenario: "cascade",
  obstructionPct: 40,
  dependencyScale: 1,
  fanAssistPct: 12,
  maintenanceMode: "dispatch",
  useLive: true
};

function modalityBars(rack: RackNode) {
  return [
    { label: "Airflow", value: rack.metrics.airflow, inverse: false, icon: Fan },
    { label: "Vibration", value: rack.metrics.vibration, inverse: true, icon: Move3D },
    { label: "Cable", value: rack.metrics.cable, inverse: true, icon: Cable },
    { label: "Acoustic", value: rack.metrics.acoustic, inverse: true, icon: AudioLines }
  ];
}

function TwinRouteOverlay({ snapshot }: { snapshot: DashboardSnapshot }) {
  const thermal = snapshot.edges.find((edge) => edge.type === "thermal");
  const airflow = snapshot.edges.find((edge) => edge.type === "airflow");
  const power = snapshot.edges.find((edge) => edge.type === "power");

  return (
    <svg className="ops-route-overlay" viewBox="0 0 1200 640" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="opsThermalRoute" x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor="rgba(237,146,112,0.08)" />
          <stop offset="45%" stopColor="rgba(237,146,112,0.86)" />
          <stop offset="100%" stopColor="rgba(237,146,112,0.05)" />
        </linearGradient>
        <linearGradient id="opsAirRoute" x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor="rgba(138,172,189,0.05)" />
          <stop offset="55%" stopColor="rgba(138,172,189,0.72)" />
          <stop offset="100%" stopColor="rgba(138,172,189,0.05)" />
        </linearGradient>
        <linearGradient id="opsPowerRoute" x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor="rgba(149,155,192,0.05)" />
          <stop offset="50%" stopColor="rgba(149,155,192,0.72)" />
          <stop offset="100%" stopColor="rgba(149,155,192,0.05)" />
        </linearGradient>
      </defs>

      <path className="ops-route thermal" style={{ opacity: thermal?.weight ?? 0 }} d="M452 162C530 176 626 208 728 264C812 312 878 366 952 444" />
      <path className="ops-route airflow" style={{ opacity: airflow?.weight ?? 0 }} d="M452 170C530 236 610 286 768 332" />
      <path className="ops-route power" style={{ opacity: power?.weight ?? 0 }} d="M952 458C1012 486 1064 506 1126 526" />
    </svg>
  );
}

export function Dashboard() {
  const [controls, setControls] = useState<ControlState>(initialControls);
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
  const [selectedRackId, setSelectedRackId] = useState<string>("rack-04");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const loadSnapshot = (preserveLoading: boolean) => {
      if (!preserveLoading) {
        setLoading(true);
      }

      const params = new URLSearchParams({
        scenario: controls.scenario,
        obstructionPct: String(controls.obstructionPct),
        dependencyScale: String(controls.dependencyScale),
        fanAssistPct: String(controls.fanAssistPct),
        maintenanceMode: controls.maintenanceMode,
        useLive: String(controls.useLive)
      });

      fetch(`/api/dashboard?${params.toString()}`, { cache: "no-store" })
        .then((res) => res.json())
        .then((data: DashboardSnapshot) => {
          if (active) {
            setSnapshot(data);
            setLoading(false);
          }
        })
        .catch(() => {
          if (active) {
            setLoading(false);
          }
        });
    };

    loadSnapshot(false);

    if (controls.useLive) {
      intervalId = setInterval(() => loadSnapshot(true), 3000);
    }

    return () => {
      active = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [controls]);

  if (!snapshot && loading) {
    return <div className="shell"><div className="ops-panel">Loading CascadeNet console...</div></div>;
  }

  if (!snapshot) {
    return <div className="shell"><div className="ops-panel">Unable to load CascadeNet console.</div></div>;
  }

  const selectedRack =
    snapshot.racks.find((rack) => rack.id === selectedRackId) ??
    snapshot.racks.find((rack) => rack.status === "critical") ??
    snapshot.racks[0];

  return (
    <main className="shell ops-shell">
      <section className="ops-header">
        <div>
          <div className="ops-kicker">CascadeNet operations console</div>
          <h1>{snapshot.headline}</h1>
          <p className="ops-summary">{snapshot.summary}</p>
          <p className="ops-summary">
            Data source: <strong>{snapshot.dataSource.mode === "live-webcam" ? "Live webcam artifact" : "Simulated scenario engine"}</strong>
            {snapshot.dataSource.mode === "live-webcam" && snapshot.dataSource.artifactUpdatedAt
              ? ` • updated ${snapshot.dataSource.artifactUpdatedAt}`
              : ""}
          </p>
        </div>
        <div className="ops-status-strip">
          {snapshot.stats.map((stat) => (
            <div key={stat.label} className="ops-stat">
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              <small>{stat.change}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="ops-grid">
        <aside className="ops-sidebar">
          <article className="ops-panel">
            <div className="ops-section-head">
              <h2>Operator Inputs</h2>
              <span>Live adjustment surface</span>
            </div>

            <label className="ops-field">
              <span>Data source</span>
              <select
                value={controls.useLive ? "live" : "simulated"}
                onChange={(event) =>
                  setControls((current) => ({ ...current, useLive: event.target.value === "live" }))
                }
              >
                <option value="live">Live webcam artifact</option>
                <option value="simulated">Manual simulation</option>
              </select>
              <small>
                {snapshot.dataSource.mode === "live-webcam"
                  ? `Reading ${snapshot.dataSource.liveRackId ?? "rack"} at ${Math.round(snapshot.dataSource.liveObstructionPct ?? 0)}% obstruction`
                  : "Fallback to local simulation if no live artifact is present"}
              </small>
            </label>

            <label className="ops-field">
              <span>Operating state</span>
              <select
                value={controls.scenario}
                onChange={(event) => setControls((current) => ({ ...current, scenario: event.target.value as ScenarioId }))}
              >
                <option value="baseline">Baseline</option>
                <option value="cascade">Cascade response</option>
                <option value="resolved">Resolved closure</option>
              </select>
            </label>

            <label className="ops-field">
              <span>Rack 4 obstruction</span>
              <input
                type="range"
                min="0"
                max="60"
                value={controls.obstructionPct}
                disabled={controls.useLive && snapshot.dataSource.mode === "live-webcam"}
                onChange={(event) => setControls((current) => ({ ...current, obstructionPct: Number(event.target.value) }))}
              />
              <small>
                {controls.useLive && snapshot.dataSource.mode === "live-webcam"
                  ? `${Math.round(snapshot.dataSource.liveObstructionPct ?? controls.obstructionPct)}% from live camera artifact`
                  : `${controls.obstructionPct}% restriction`}
              </small>
            </label>

            <label className="ops-field">
              <span>Dependency scale</span>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.05"
                value={controls.dependencyScale}
                onChange={(event) => setControls((current) => ({ ...current, dependencyScale: Number(event.target.value) }))}
              />
              <small>{controls.dependencyScale.toFixed(2)}x route sensitivity</small>
            </label>

            <label className="ops-field">
              <span>Temporary fan assist</span>
              <input
                type="range"
                min="0"
                max="25"
                value={controls.fanAssistPct}
                onChange={(event) => setControls((current) => ({ ...current, fanAssistPct: Number(event.target.value) }))}
              />
              <small>{controls.fanAssistPct}% assist profile</small>
            </label>

            <label className="ops-field">
              <span>Maintenance workflow</span>
              <select
                value={controls.maintenanceMode}
                onChange={(event) =>
                  setControls((current) => ({ ...current, maintenanceMode: event.target.value as MaintenanceMode }))
                }
              >
                <option value="observe">Observe</option>
                <option value="dispatch">Dispatch active</option>
                <option value="closed">Closed and verified</option>
              </select>
            </label>
          </article>

          <article className="ops-panel">
            <div className="ops-section-head">
              <h2>Active Event Log</h2>
              <span>Telemetry and operator state</span>
            </div>
            <div className="ops-log">
              {snapshot.eventLog.map((entry) => (
                <div key={entry.id} className={`ops-log-entry ${entry.severity}`}>
                  <div className="ops-log-meta">
                    <span>{entry.time}</span>
                    <strong>{entry.source}</strong>
                  </div>
                  <p>{entry.message}</p>
                </div>
              ))}
            </div>
          </article>
        </aside>

        <section className="ops-main">
          <article className="ops-panel">
            <div className="ops-section-head">
              <h2>Digital Twin</h2>
              <span>Topology, propagation paths, and rack state</span>
            </div>

            <div className="ops-twin">
              <TwinRouteOverlay snapshot={snapshot} />
              <div className="ops-aisle-label north">Aisle north</div>
              <div className="ops-aisle-label south">Aisle south</div>

              {snapshot.racks.map((rack) => (
                <button
                  key={rack.id}
                  type="button"
                  className={`ops-rack ${rack.status} ${selectedRack.id === rack.id ? "selected" : ""}`}
                  style={{ left: `${rack.position.x}%`, top: rack.aisle === "Aisle North" ? "24%" : "68%" }}
                  onClick={() => setSelectedRackId(rack.id)}
                  aria-pressed={selectedRack.id === rack.id}
                >
                  <div className="ops-rack-top" />
                  <div className="ops-rack-face">
                    <strong>{rack.name}</strong>
                    <div className="ops-rack-slots">
                      <span />
                      <span />
                      <span />
                    </div>
                    <small>{rack.metrics.temperatureC}°C</small>
                  </div>
                  <div className="ops-rack-shadow" />
                </button>
              ))}

              <div className="ops-route-label thermal">Thermal path</div>
              <div className="ops-route-label airflow">Airflow path</div>
              <div className="ops-route-label power">Power path</div>
            </div>

            <div className="ops-zone-row">
              {snapshot.zones.map((zone) => (
                <div key={zone.id} className="ops-zone">
                  <strong>{zone.label}</strong>
                  <span>Occupancy {Math.round(zone.occupancy * 100)}%</span>
                  <span>Shadow {Math.round(zone.thermalShadow * 100)}%</span>
                </div>
              ))}
            </div>
          </article>

          <div className="ops-lower">
            <article className="ops-panel">
              <div className="ops-section-head">
                <h2>Rack Detail</h2>
                <span>Click any rack in the twin or list</span>
              </div>

              <div className="ops-detail-card">
                <div className="ops-rack-card-head">
                  <div>
                    <strong>{selectedRack.name}</strong>
                    <p>{selectedRack.issue ?? "Nominal"}</p>
                  </div>
                  <span className={`ops-badge ${selectedRack.status}`}>{selectedRack.status}</span>
                </div>

                <div className="ops-detail-grid">
                  <div className="ops-detail-stat">
                    <span>Aisle</span>
                    <strong>{selectedRack.aisle}</strong>
                  </div>
                  <div className="ops-detail-stat">
                    <span>Temperature</span>
                    <strong>{selectedRack.metrics.temperatureC}°C</strong>
                  </div>
                  <div className="ops-detail-stat">
                    <span>Confidence</span>
                    <strong>{Math.round(selectedRack.metrics.confidence * 100)}%</strong>
                  </div>
                  <div className="ops-detail-stat">
                    <span>Predicted window</span>
                    <strong>{selectedRack.predictedFailureHours ? `${selectedRack.predictedFailureHours}h` : "Stable"}</strong>
                  </div>
                </div>

                <div className="ops-modality-list">
                  {modalityBars(selectedRack).map((item) => {
                    const percentage = Math.round((item.inverse ? item.value : 1 - item.value) * 100);
                    const Icon = item.icon;

                    return (
                      <div key={item.label} className="ops-metric-row">
                        <label>
                          <Icon size={14} />
                          {item.label}
                        </label>
                        <div className="ops-metric-bar">
                          <span style={{ width: `${percentage}%` }} />
                        </div>
                        <small>{percentage}%</small>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="ops-rack-list">
                {snapshot.racks.map((rack) => (
                  <button
                    key={rack.id}
                    type="button"
                    className={`ops-rack-card ${selectedRack.id === rack.id ? "selected" : ""}`}
                    onClick={() => setSelectedRackId(rack.id)}
                    aria-pressed={selectedRack.id === rack.id}
                  >
                    <div className="ops-rack-card-head">
                      <div>
                        <strong>{rack.name}</strong>
                        <p>{rack.issue ?? "Nominal"}</p>
                      </div>
                      <span className={`ops-badge ${rack.status}`}>{rack.status}</span>
                    </div>

                    <div className="ops-rack-card-foot">
                      <span>{rack.metrics.temperatureC}°C</span>
                      <span>{Math.round(rack.metrics.confidence * 100)}% confidence</span>
                      <span>{rack.predictedFailureHours ? `${rack.predictedFailureHours}h window` : "No active window"}</span>
                    </div>
                  </button>
                ))}
              </div>
            </article>

            <article className="ops-panel">
              <div className="ops-section-head">
                <h2>Work Orders</h2>
                <span>HMAX-aligned maintenance actions</span>
              </div>

              <div className="ops-work-orders">
                {snapshot.workOrders.map((order) => (
                  <div key={order.id} className="ops-order-card">
                    <div className="ops-order-head">
                      <span className={`ops-priority ${order.priority.toLowerCase()}`}>{order.priority}</span>
                      <strong>{order.title}</strong>
                    </div>
                    <p>{order.action}</p>
                    <small>{order.impact}</small>
                    <small>{order.roi}</small>
                    <small>{order.sustainability}</small>
                  </div>
                ))}
              </div>

              <div className="ops-sync-note">
                <AlertTriangle size={14} />
                <p>
                  HMAX sync is active for the current operator state. Work order content, rack priorities, and aisle risk
                  update whenever the calibration inputs change.
                </p>
              </div>
            </article>
          </div>
        </section>
      </section>
    </main>
  );
}
