"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  AudioLines,
  Cable,
  Fan,
  Move3D,
  Orbit,
  Sparkles
} from "lucide-react";
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

function HeroLinework() {
  return (
    <svg className="hero-linework" viewBox="0 0 900 420" aria-hidden="true">
      <path d="M38 112C154 38 271 24 426 70C579 115 700 104 860 32" />
      <path d="M64 208C160 170 292 154 396 190C516 232 666 265 838 212" />
      <path d="M110 314C236 272 340 286 448 328C560 372 688 383 834 332" />
      <circle cx="426" cy="70" r="6" />
      <circle cx="396" cy="190" r="5" />
      <circle cx="448" cy="328" r="6" />
    </svg>
  );
}

function TwinLinework() {
  return (
    <svg className="twin-linework" viewBox="0 0 1200 640" preserveAspectRatio="none" aria-hidden="true">
      <path d="M62 134C184 78 314 74 454 120C598 168 762 164 930 112C1028 82 1108 80 1160 94" />
      <path d="M80 502C210 452 346 450 478 502C628 560 784 572 948 524C1032 500 1102 486 1160 492" />
      <path d="M420 138C502 196 554 248 598 318C648 398 734 456 878 510" />
      <path d="M464 122C586 144 688 172 768 216" />
      <path d="M764 216C814 266 856 314 888 380" />
      <circle cx="464" cy="122" r="5" />
      <circle cx="764" cy="216" r="5" />
      <circle cx="888" cy="380" r="5" />
    </svg>
  );
}

function RouteOverlay({ scenario }: { scenario: ScenarioId }) {
  const opacity = scenario === "cascade" ? 1 : scenario === "resolved" ? 0.45 : 0.3;

  return (
    <svg className="route-overlay" viewBox="0 0 1200 640" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="thermalRoute" x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor="rgba(221,158,110,0.12)" />
          <stop offset="35%" stopColor="rgba(221,158,110,0.86)" />
          <stop offset="100%" stopColor="rgba(245,218,179,0.06)" />
        </linearGradient>
        <linearGradient id="powerRoute" x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor="rgba(157,169,213,0.12)" />
          <stop offset="50%" stopColor="rgba(157,169,213,0.7)" />
          <stop offset="100%" stopColor="rgba(201,196,223,0.06)" />
        </linearGradient>
        <filter id="routeGlow">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g opacity={opacity}>
        <path className="route-shadow" d="M464 156C544 166 640 194 744 252C808 288 850 326 884 386" />
        <path className="route-shadow" d="M464 164C540 240 616 294 760 338" />
        <path className="route-shadow power" d="M884 418C936 452 1000 482 1088 506" />

        <path className="route-main thermal" d="M464 156C544 166 640 194 744 252C808 288 850 326 884 386" />
        <path className="route-main airflow" d="M464 164C540 240 616 294 760 338" />
        <path className="route-main power" d="M884 418C936 452 1000 482 1088 506" />

        <g filter="url(#routeGlow)">
          <circle className="route-beacon" cx="464" cy="160" r="5" />
          <circle className="route-beacon" cx="744" cy="252" r="4" />
          <circle className="route-beacon" cx="884" cy="386" r="5" />
        </g>
      </g>
    </svg>
  );
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
    return <div className="shell"><div className="hero-card">Loading CascadeNet...</div></div>;
  }

  if (!snapshot) {
    return <div className="shell"><div className="hero-card">Unable to load dashboard snapshot.</div></div>;
  }

  const primaryOrder = snapshot.workOrders[0];
  const secondaryOrders = snapshot.workOrders.slice(1);

  return (
    <main className="shell">
      <section className="hero-card hero-stage">
        <HeroLinework />
        <div className="hero-frame">
          <div className="hero-copy-column">
            <div className="eyebrow">CascadeNet / HMAX RackSentinel</div>
            <div className="hero-kicker">
              <span>Cross-rack foresight for data halls</span>
              <span>{snapshot.scenario === "cascade" ? "72h event horizon" : "Continuously calibrated twin"}</span>
            </div>
            <h1>{snapshot.headline}</h1>
            <p className="hero-copy">{snapshot.summary}</p>

            <div className="scenario-rail">
              {scenarios.map((item, index) => (
                <button
                  key={item.id}
                  className={item.id === scenario ? "scenario-pill active" : "scenario-pill"}
                  onClick={() => setScenario(item.id)}
                  type="button"
                >
                  <span className="scenario-index">0{index + 1}</span>
                  <div>
                    <span>{item.label}</span>
                    <small>{item.blurb}</small>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="hero-aside">
            <div className="hero-marquee">
              <div className="marquee-topline">
                <Orbit size={15} />
                <span>Live operational composition</span>
              </div>
              <div className="marquee-grid">
                {snapshot.stats.map((stat) => (
                  <div key={stat.label} className="marquee-stat">
                    <small>{stat.label}</small>
                    <strong>{stat.value}</strong>
                    <span>{stat.change}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="signal-stack">
              <div className="signal-card luminous">
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
        </div>
      </section>

      <section className="experience-grid">
        <article className="panel twin-panel">
          <div className="panel-head stage-head">
            <div>
              <span className="section-label">Spatial model</span>
              <h2>Live aisle twin</h2>
            </div>
            <div className="head-note">3D without CAD</div>
          </div>

          <div className="twin-map">
            <TwinLinework />
            <RouteOverlay scenario={snapshot.scenario} />
            <div className="twin-pulse twin-pulse-a" />
            <div className="twin-pulse twin-pulse-b" />
            <div className="lane-shadow lane-shadow-north" />
            <div className="lane-shadow lane-shadow-south" />
            <div className="twin-overlay twin-overlay-north">Aisle north</div>
            <div className="twin-overlay twin-overlay-south">Aisle south</div>

            {snapshot.racks.map((rack) => (
              <div
                key={rack.id}
                className={`rack-node ${rack.status}`}
                style={{ left: `${rack.position.x}%`, top: rack.aisle === "Aisle North" ? "24%" : "68%" }}
              >
                <div className="rack-topline" />
                <div className="rack-face">
                  <span className="rack-id">{rack.name}</span>
                  <div className="rack-slots">
                    <i />
                    <i />
                    <i />
                  </div>
                  <small>{rack.metrics.temperatureC}°C</small>
                </div>
                <div className="rack-footprint" />
              </div>
            ))}

            <div className="route-tag route-tag-thermal">Thermal cascade 73%</div>
            <div className="route-tag route-tag-airflow">Airflow coupling 66%</div>
            <div className="route-tag route-tag-power">Power branch 58%</div>
          </div>

          <div className="zone-ribbon">
            {snapshot.zones.map((zone) => (
              <div key={zone.id} className="zone-card">
                <small>Zone</small>
                <strong>{zone.label}</strong>
                <span>Occupancy {Math.round(zone.occupancy * 100)}%</span>
                <span>Thermal shadow {Math.round(zone.thermalShadow * 100)}%</span>
              </div>
            ))}
          </div>
        </article>

        <aside className="control-column">
          <article className="panel incident-panel">
            <div className="panel-head stage-head">
              <div>
                <span className="section-label">Command brief</span>
                <h2>Incident composition</h2>
              </div>
              <Sparkles size={16} />
            </div>

            <div className="incident-card">
              <span className={`priority ${primaryOrder.priority.toLowerCase()}`}>{primaryOrder.priority}</span>
              <strong>{primaryOrder.title}</strong>
              <p>{primaryOrder.action}</p>
              <div className="incident-meta">
                <div>
                  <small>Impact</small>
                  <span>{primaryOrder.impact}</span>
                </div>
                <div>
                  <small>ROI</small>
                  <span>{primaryOrder.roi}</span>
                </div>
                <div>
                  <small>Confidence</small>
                  <span>{Math.round(primaryOrder.confidence * 100)}%</span>
                </div>
              </div>
            </div>

            <div className="incident-support">
              {secondaryOrders.map((order) => (
                <div key={order.id} className="support-card">
                  <span>{order.title}</span>
                  <small>{order.sustainability}</small>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-head stage-head">
              <div>
                <span className="section-label">Quad-modal sensing</span>
                <h2>Rack health</h2>
              </div>
              <div className="head-note">Airflow, vibration, cable, acoustic</div>
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
        </aside>
      </section>

      <section className="bottom-band">
        <article className="panel order-panel">
          <div className="panel-head stage-head">
            <div>
              <span className="section-label">Action queue</span>
              <h2>HMAX work orders</h2>
            </div>
            <div className="head-note">Prioritized, ROI-aware, ready to sync</div>
          </div>

          <div className="order-list editorial-orders">
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
                <div className="order-meta-grid">
                  <small>{order.impact}</small>
                  <small>{order.roi}</small>
                  <small>{order.sustainability}</small>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel loop-panel">
          <div className="panel-head stage-head">
            <div>
              <span className="section-label">Verification loop</span>
              <h2>Decision trace</h2>
            </div>
            <div className="head-note">From anomaly to verified closure</div>
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
