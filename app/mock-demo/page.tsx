type Scene = {
  title: string;
  subtitle: string;
  risk: string;
  money: string;
  workOrder: string;
  routeOpacity: number;
  routeProgress: number;
  rack4Heat: number;
  rack7Risk: number;
  resolved: boolean;
};

function getScene(frame: number): Scene {
  if (frame < 18) {
    return {
      title: "Aisle twin locks into place",
      subtitle: "Stereo vision composes a live rack map without CAD files.",
      risk: "12%",
      money: "Observation only",
      workOrder: "No intervention required",
      routeOpacity: 0.14,
      routeProgress: 0.2,
      rack4Heat: 0.2,
      rack7Risk: 0.18,
      resolved: false
    };
  }

  if (frame < 40) {
    const t = (frame - 18) / 22;
    return {
      title: "Rack 4 airflow anomaly detected",
      subtitle: "A filter obstruction compresses airflow and begins a thermal bloom.",
      risk: `${Math.round(18 + t * 24)}%`,
      money: "Thermal spill emerging",
      workOrder: "Investigate Rack 4 intake restriction",
      routeOpacity: 0.38 + t * 0.28,
      routeProgress: 0.35 + t * 0.24,
      rack4Heat: 0.45 + t * 0.35,
      rack7Risk: 0.22 + t * 0.2,
      resolved: false
    };
  }

  if (frame < 68) {
    const t = (frame - 40) / 28;
    return {
      title: "Cascade risk propagates to Rack 7",
      subtitle: "Graph routing connects Rack 4 heat shadow to Rack 7 bearing stress in 72 hours.",
      risk: `${Math.round(56 + t * 31)}%`,
      money: "$250K downtime avoided",
      workOrder: "Clean Rack 4 + apply fan curve optimization",
      routeOpacity: 0.72 + t * 0.22,
      routeProgress: 0.62 + t * 0.26,
      rack4Heat: 0.78 + t * 0.16,
      rack7Risk: 0.45 + t * 0.42,
      resolved: false
    };
  }

  const t = Math.min((frame - 68) / 28, 1);
  return {
    title: "The fix collapses the cascade",
    subtitle: "Once Rack 4 is cleaned, the route cools, the risk drops, and the model learns.",
    risk: `${Math.round(87 - t * 75)}%`,
    money: "$47K saved this week",
    workOrder: "Close incident and retain optimized fan profile",
    routeOpacity: 0.94 - t * 0.64,
    routeProgress: 0.92,
    rack4Heat: 0.92 - t * 0.7,
    rack7Risk: 0.87 - t * 0.64,
    resolved: t > 0.45
  };
}

function formatPct(value: number) {
  return `${Math.round(value * 100)}%`;
}

export default async function MockDemoPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawFrame = Array.isArray(params.frame) ? params.frame[0] : params.frame;
  const frame = Number(rawFrame ?? "0");
  const scene = getScene(frame);

  return (
    <main className="mock-video-shell">
      <section className="mock-video-stage">
        <div className="mock-video-copy">
          <span className="mock-kicker">CascadeNet system narrative</span>
          <h1>{scene.title}</h1>
          <p>{scene.subtitle}</p>
        </div>

        <div className="mock-video-grid">
          <article className="mock-twin">
            <div className="mock-twin-head">
              <span>Live digital twin</span>
              <span>Frame {String(frame).padStart(2, "0")}</span>
            </div>

            <div className="mock-twin-stage">
              <svg className="mock-route-svg" viewBox="0 0 1200 680" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="mockRoute" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" stopColor="rgba(242,181,122,0.05)" />
                    <stop offset="45%" stopColor="rgba(242,181,122,0.88)" />
                    <stop offset="100%" stopColor="rgba(247,225,197,0.08)" />
                  </linearGradient>
                  <filter id="mockGlow">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <path className="mock-grid-line" d="M0 340H1200" />
                <path
                  className="mock-route-shadow"
                  d="M454 180C560 186 664 214 774 278C846 321 900 378 952 458"
                  style={{ opacity: scene.routeOpacity }}
                />
                <path
                  className="mock-route-main"
                  d="M454 180C560 186 664 214 774 278C846 321 900 378 952 458"
                  pathLength={100}
                  style={{ opacity: scene.routeOpacity, strokeDashoffset: `${100 - scene.routeProgress * 100}` }}
                />
                <circle cx="454" cy="180" r="7" className="mock-route-node" style={{ opacity: scene.routeOpacity }} filter="url(#mockGlow)" />
                <circle cx="774" cy="278" r="6" className="mock-route-node" style={{ opacity: scene.routeOpacity }} filter="url(#mockGlow)" />
                <circle cx="952" cy="458" r="7" className="mock-route-node" style={{ opacity: scene.routeOpacity }} filter="url(#mockGlow)" />
              </svg>

              <div className="mock-aisle-label north">Aisle north</div>
              <div className="mock-aisle-label south">Aisle south</div>

              {[
                { name: "Rack 1", x: 14, y: 20, tone: 0.14 },
                { name: "Rack 2", x: 27, y: 20, tone: 0.16 },
                { name: "Rack 3", x: 40, y: 20, tone: 0.22 },
                { name: "Rack 4", x: 53, y: 20, tone: scene.rack4Heat },
                { name: "Rack 5", x: 66, y: 20, tone: 0.32 + scene.routeOpacity * 0.16 },
                { name: "Rack 6", x: 79, y: 62, tone: 0.18 },
                { name: "Rack 7", x: 92, y: 62, tone: scene.rack7Risk },
                { name: "Rack 8", x: 105, y: 62, tone: 0.26 + scene.routeOpacity * 0.12 }
              ].map((rack, index) => (
                <div
                  key={rack.name}
                  className={`mock-rack ${rack.name === "Rack 4" || rack.name === "Rack 7" ? "focus" : ""} ${scene.resolved && rack.name === "Rack 7" ? "resolved" : ""}`}
                  style={{
                    left: `${rack.x}%`,
                    top: `${rack.y}%`,
                    ["--rack-tone" as string]: String(rack.tone),
                    animationDelay: `${index * 120}ms`
                  }}
                >
                  <div className="mock-rack-cap" />
                  <div className="mock-rack-face">
                    <strong>{rack.name}</strong>
                    <div className="mock-rack-slots">
                      <span />
                      <span />
                      <span />
                    </div>
                    <small>{formatPct(rack.tone)}</small>
                  </div>
                  <div className="mock-rack-shadow" />
                </div>
              ))}

              <div className="mock-tag thermal" style={{ opacity: scene.routeOpacity }}>
                Thermal route
              </div>
              <div className="mock-tag ticket" style={{ opacity: frame >= 40 ? 1 : 0.22 }}>
                Work order generated
              </div>
            </div>
          </article>

          <aside className="mock-side">
            <article className="mock-card lead">
              <span>Predicted cascade risk</span>
              <strong>{scene.risk}</strong>
              <p>{scene.money}</p>
            </article>

            <article className="mock-card">
              <span>Recommended action</span>
              <strong>{scene.workOrder}</strong>
              <p>Priority-1 HMAX ticket with ROI and sustainability context.</p>
            </article>

            <article className={`mock-card ${scene.resolved ? "success" : ""}`}>
              <span>Validation loop</span>
              <strong>{scene.resolved ? "Fix verified" : "Monitoring active"}</strong>
              <p>{scene.resolved ? "Risk collapses and the model gains a confirmed learning signal." : "Multi-modal sensing is still tracking the cascade path."}</p>
            </article>
          </aside>
        </div>
      </section>
    </main>
  );
}
