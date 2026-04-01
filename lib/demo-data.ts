import type { RackEdge, RackNode, ScenarioId, TimelineEvent, TwinZone } from "@/lib/types";

const rackTemplate: RackNode[] = [
  {
    id: "rack-01",
    name: "Rack 1",
    aisle: "Aisle North",
    row: "Row B",
    position: { x: 10, y: 0, z: 0 },
    status: "healthy",
    metrics: { airflow: 0.92, vibration: 0.11, cable: 0.08, acoustic: 0.12, temperatureC: 24, confidence: 0.96 }
  },
  {
    id: "rack-02",
    name: "Rack 2",
    aisle: "Aisle North",
    row: "Row B",
    position: { x: 22, y: 0, z: 0 },
    status: "healthy",
    metrics: { airflow: 0.88, vibration: 0.14, cable: 0.09, acoustic: 0.11, temperatureC: 25, confidence: 0.94 }
  },
  {
    id: "rack-03",
    name: "Rack 3",
    aisle: "Aisle North",
    row: "Row B",
    position: { x: 34, y: 0, z: 0 },
    status: "watch",
    issue: "Light cable sag",
    metrics: { airflow: 0.84, vibration: 0.2, cable: 0.32, acoustic: 0.18, temperatureC: 26, confidence: 0.91 }
  },
  {
    id: "rack-04",
    name: "Rack 4",
    aisle: "Aisle North",
    row: "Row B",
    position: { x: 46, y: 0, z: 0 },
    status: "critical",
    issue: "Filter obstruction and thermal bloom",
    predictedFailureHours: 72,
    metrics: { airflow: 0.42, vibration: 0.36, cable: 0.13, acoustic: 0.48, temperatureC: 34, confidence: 0.93 }
  },
  {
    id: "rack-05",
    name: "Rack 5",
    aisle: "Aisle North",
    row: "Row B",
    position: { x: 58, y: 0, z: 0 },
    status: "watch",
    issue: "Warm intake corridor",
    predictedFailureHours: 80,
    metrics: { airflow: 0.67, vibration: 0.29, cable: 0.14, acoustic: 0.31, temperatureC: 30, confidence: 0.89 }
  },
  {
    id: "rack-06",
    name: "Rack 6",
    aisle: "Aisle South",
    row: "Row B",
    position: { x: 70, y: 0, z: 0 },
    status: "healthy",
    metrics: { airflow: 0.9, vibration: 0.16, cable: 0.11, acoustic: 0.15, temperatureC: 25, confidence: 0.94 }
  },
  {
    id: "rack-07",
    name: "Rack 7",
    aisle: "Aisle South",
    row: "Row B",
    position: { x: 82, y: 0, z: 0 },
    status: "critical",
    issue: "Bearing stress from thermal shadow",
    predictedFailureHours: 72,
    metrics: { airflow: 0.61, vibration: 0.71, cable: 0.22, acoustic: 0.62, temperatureC: 32, confidence: 0.9 }
  },
  {
    id: "rack-08",
    name: "Rack 8",
    aisle: "Aisle South",
    row: "Row B",
    position: { x: 94, y: 0, z: 0 },
    status: "watch",
    issue: "Shared PDU stress",
    predictedFailureHours: 96,
    metrics: { airflow: 0.74, vibration: 0.3, cable: 0.38, acoustic: 0.29, temperatureC: 28, confidence: 0.88 }
  }
];

const edgeTemplate: RackEdge[] = [
  {
    source: "rack-04",
    target: "rack-05",
    type: "airflow",
    weight: 0.66,
    explanation: "Blocked intake increases adjacent pressure drop."
  },
  {
    source: "rack-04",
    target: "rack-07",
    type: "thermal",
    weight: 0.73,
    explanation: "Rack 7 draws Rack 4 exhaust through the aisle crossover."
  },
  {
    source: "rack-07",
    target: "rack-08",
    type: "power",
    weight: 0.58,
    explanation: "Shared PDU branch sees instability under fan surge."
  }
];

const zonesTemplate: TwinZone[] = [
  { id: "zone-a", label: "Cold Aisle", occupancy: 0.82, thermalShadow: 0.22 },
  { id: "zone-b", label: "Hot Exhaust Corridor", occupancy: 0.91, thermalShadow: 0.68 },
  { id: "zone-c", label: "PDU Spine", occupancy: 0.63, thermalShadow: 0.31 }
];

const timelineTemplate: Record<ScenarioId, TimelineEvent[]> = {
  baseline: [
    { minute: 0, title: "Twin calibrated", detail: "Stereo vision locked aisle geometry with 1 cm precision." },
    { minute: 12, title: "Modalities synchronized", detail: "Airflow, vibration, cable, and acoustic streams aligned." },
    { minute: 24, title: "System watching", detail: "No priority work orders required." }
  ],
  cascade: [
    { minute: 0, title: "Airflow anomaly", detail: "Rack 4 shows a 40% CFM reduction from filter obstruction." },
    { minute: 30, title: "Cascade learned", detail: "ST-GAT scores Rack 7 at 87% failure risk in 72 hours." },
    { minute: 60, title: "HMAX ticket drafted", detail: "Priority maintenance and fan optimization issued with ROI." }
  ],
  resolved: [
    { minute: 0, title: "Filter cleaned", detail: "Rack 4 obstruction removed and thermal bloom collapsed." },
    { minute: 25, title: "Risk re-evaluated", detail: "Rack 7 drops to 12% risk with normal bearing load." },
    { minute: 55, title: "Learning loop closed", detail: "Verified fix is stored for continual model improvement." }
  ]
};

export function getScenarioRacks(scenario: ScenarioId): RackNode[] {
  if (scenario === "baseline") {
    return rackTemplate.map((rack) =>
      rack.id === "rack-04" || rack.id === "rack-07"
        ? {
            ...rack,
            status: "healthy",
            issue: undefined,
            predictedFailureHours: undefined,
            metrics: {
              ...rack.metrics,
              airflow: rack.id === "rack-04" ? 0.88 : 0.84,
              vibration: rack.id === "rack-07" ? 0.24 : 0.18,
              acoustic: rack.id === "rack-07" ? 0.21 : 0.19,
              temperatureC: rack.id === "rack-04" ? 26 : 27,
              confidence: 0.94
            }
          }
        : rack
    );
  }

  if (scenario === "resolved") {
    return rackTemplate.map((rack) =>
      rack.id === "rack-04"
        ? {
            ...rack,
            status: "healthy",
            issue: "Resolved after filter cleaning",
            predictedFailureHours: undefined,
            metrics: {
              ...rack.metrics,
              airflow: 0.91,
              vibration: 0.16,
              acoustic: 0.14,
              temperatureC: 25,
              confidence: 0.97
            }
          }
        : rack.id === "rack-07"
          ? {
              ...rack,
              status: "watch",
              issue: "Residual monitoring only",
              predictedFailureHours: undefined,
              metrics: {
                ...rack.metrics,
                airflow: 0.82,
                vibration: 0.27,
                acoustic: 0.23,
                temperatureC: 27,
                confidence: 0.95
              }
            }
          : rack
    );
  }

  return rackTemplate;
}

export function getScenarioEdges(scenario: ScenarioId): RackEdge[] {
  if (scenario === "baseline") {
    return edgeTemplate.map((edge) => ({ ...edge, weight: Number((edge.weight * 0.45).toFixed(2)) }));
  }

  if (scenario === "resolved") {
    return edgeTemplate.map((edge) => ({ ...edge, weight: Number((edge.weight * 0.22).toFixed(2)) }));
  }

  return edgeTemplate;
}

export function getScenarioZones(scenario: ScenarioId): TwinZone[] {
  if (scenario === "baseline") {
    return zonesTemplate.map((zone) => ({
      ...zone,
      thermalShadow: Number((zone.thermalShadow * 0.5).toFixed(2))
    }));
  }

  if (scenario === "resolved") {
    return zonesTemplate.map((zone) => ({
      ...zone,
      thermalShadow: Number((zone.thermalShadow * 0.28).toFixed(2))
    }));
  }

  return zonesTemplate;
}

export function getScenarioTimeline(scenario: ScenarioId): TimelineEvent[] {
  return timelineTemplate[scenario];
}
