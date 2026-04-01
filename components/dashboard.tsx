"use client";

import { useEffect, useState } from "react";
import { AlertCircle, ArrowRight, AudioLines, Cable, Fan, Move3D } from "lucide-react";
import type { DashboardSnapshot, RackNode, ScenarioId } from "@/lib/types";

const scenarios: { id: ScenarioId; label: string; blurb: string }[] = [
  { id: "baseline", label: "Calm State", blurb: "Healthy aisle with live twin tracking." },
  { id: "cascade", label: "Cascade Risk", blurb: "Rack 4 obstruction propagates into Rack 7." },
  { id: "resolved", label: "Resolved Loop", blurb: "Fix validated and learning captured." }
];

function modalityBars(rack: RackNode) {
  return [
    { label: "Airflow", value: rack.metrics.airflow, inverse: false, icon: Fan },
    { label: "Vibration", value: rack.metrics.vibration, inverse: true, icon: Move3D },
    { label: "Cable", value: rack.metrics.cable, inverse: true, icon: Cable },
    { label: "Acoustic", value: rack.metrics.acoustic, inverse: true, icon: AudioLines }
  ];
}

export function Dashboard() {
  const [scenario, setScenario] = useState<ScenarioId>("cascade");
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetch(`/api/dashboard?scenario=${scenario}`)
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

    return () => {
      active = false;
    };
  }, [scenario]);

  if (!snapshot && loading) {
    return <div className="shell"><div className="hero-card">Loading RackSentinel...</div></div>;
  }

  if (!snapshot) {
    return <div className="shell"><div className="hero-card">Unable to load dashboard snapshot.</div></div>;
  }

  return (
    <main className="shell">
      <section className="hero-card">
        <div className="eyebrow">HMAX RackSentinel</div>
        <div className="hero-grid">
          <div>
            <h1>{snapshot.headline}</h1>
            <p className="hero-copy">{snapshot.summary}</p>
            <div className="scenario-switch">
              {scenarios.map((item) => (
                <button
                  key={item.id}
                  className={item.id === scenario ? "scenario-pill active" : "scenario-pill"}
                  onClick={() => setScenario(item.id)}
                  type="button"
                >
                  <span>{item.label}</span>
                  <small>{item.blurb}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="hero-side">
            <div className="signal-card">
              <span>Live Twin Status</span>
              <strong>99% pose lock</strong>
              <small>30 fps stereo reconstruction with silent refresh under 30 seconds.</small>
            </div>
            <div className="signal-card">
              <span>Decision Layer</span>
              <strong>{snapshot.scenario === "cascade" ? "Priority intervention" : "Stable autonomy"}</strong>
              <small>Physics, vision residuals, and graph attention aligned.</small>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-grid">
        {snapshot.stats.map((stat) => (
          <article key={stat.label} className="panel stat-card">
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <small>{stat.change}</small>
          </article>
        ))}
      </section>

      <section className="content-grid">
        <article className="panel">
          <div className="panel-head">
            <h2>Live Aisle Twin</h2>
            <span>3D without CAD</span>
          </div>
          <div className="twin-map">
            {snapshot.racks.map((rack) => (
              <div
                key={rack.id}
                className={`rack-node ${rack.status}`}
                style={{ left: `${rack.position.x}%`, top: rack.aisle === "Aisle North" ? "26%" : "66%" }}
              >
                <b>{rack.name}</b>
                <small>{rack.metrics.temperatureC}°C</small>
              </div>
            ))}

            {snapshot.edges.map((edge) => (
              <div
                key={`${edge.source}-${edge.target}`}
                className={`edge edge-${edge.type}`}
                style={{
                  left: edge.source === "rack-04" ? "46%" : "82%",
                  top: edge.target === "rack-07" ? "39%" : edge.target === "rack-08" ? "69%" : "29%",
                  width: `${Math.max(edge.weight * 24, 8)}%`
                }}
              >
                <span>{edge.type}</span>
                <small>{Math.round(edge.weight * 100)}%</small>
              </div>
            ))}
          </div>
          <div className="zone-grid">
            {snapshot.zones.map((zone) => (
              <div key={zone.id} className="zone-card">
                <strong>{zone.label}</strong>
                <span>Occupancy {Math.round(zone.occupancy * 100)}%</span>
                <span>Thermal shadow {Math.round(zone.thermalShadow * 100)}%</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <h2>Quad-Modal Rack Health</h2>
            <span>Airflow, vibration, cable, acoustic</span>
          </div>
          <div className="rack-list">
            {snapshot.racks.map((rack) => (
              <div key={rack.id} className="rack-card">
                <div className="rack-header">
                  <div>
                    <strong>{rack.name}</strong>
                    <p>{rack.issue ?? "Nominal"}</p>
                  </div>
                  <div className={`status-badge ${rack.status}`}>{rack.status}</div>
                </div>
                <div className="modality-list">
                  {modalityBars(rack).map((item) => {
                    const percentage = Math.round((item.inverse ? item.value : 1 - item.value) * 100);
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="metric-row">
                        <label>
                          <Icon size={14} />
                          {item.label}
                        </label>
                        <div className="metric-bar">
                          <span style={{ width: `${percentage}%` }} />
                        </div>
                        <small>{percentage}% risk</small>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="content-grid lower">
        <article className="panel">
          <div className="panel-head">
            <h2>HMAX Work Orders</h2>
            <span>Prioritized, ROI-aware, ready to sync</span>
          </div>
          <div className="order-list">
            {snapshot.workOrders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-top">
                  <div>
                    <span className={`priority ${order.priority.toLowerCase()}`}>{order.priority}</span>
                    <strong>{order.title}</strong>
                  </div>
                  <span>{Math.round(order.confidence * 100)}% confidence</span>
                </div>
                <p>{order.action}</p>
                <small>{order.impact}</small>
                <small>{order.roi}</small>
                <small>{order.sustainability}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <h2>Decision Loop</h2>
            <span>From anomaly to verified closure</span>
          </div>
          <div className="timeline">
            {snapshot.timeline.map((event) => (
              <div key={event.minute} className="timeline-item">
                <div className="timeline-mark">{event.minute}</div>
                <div>
                  <strong>{event.title}</strong>
                  <p>{event.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="payload-card">
            <div className="payload-head">
              <AlertCircle size={16} />
              <strong>HMAX JSON Payload</strong>
              <ArrowRight size={16} />
            </div>
            <pre>{JSON.stringify(snapshot.hmaxPayload, null, 2)}</pre>
          </div>
        </article>
      </section>
    </main>
  );
}
