import { getScenarioEdges, getScenarioRacks, getScenarioTimeline, getScenarioZones } from "@/lib/demo-data";
import type { DashboardSnapshot, DashboardStat, RackNode, ScenarioId, WorkOrder } from "@/lib/types";

function averageRisk(racks: RackNode[]): number {
  const total = racks.reduce((sum, rack) => {
    const modalityRisk =
      (1 - rack.metrics.airflow) * 0.34 +
      rack.metrics.vibration * 0.26 +
      rack.metrics.cable * 0.16 +
      rack.metrics.acoustic * 0.24;

    return sum + modalityRisk;
  }, 0);

  return Number(((total / racks.length) * 100).toFixed(1));
}

function buildStats(scenario: ScenarioId, racks: RackNode[]): DashboardStat[] {
  const avgRisk = averageRisk(racks);

  if (scenario === "baseline") {
    return [
      { label: "Cascade Risk", value: `${avgRisk}%`, change: "Nominal network state" },
      { label: "PUE Opportunity", value: "1.47", change: "Potential 4.3% efficiency gain" },
      { label: "Twin Refresh", value: "<30s", change: "Geometry stable" },
      { label: "Open Orders", value: "0", change: "Observation only" }
    ];
  }

  if (scenario === "resolved") {
    return [
      { label: "Cascade Risk", value: "12%", change: "Down 75 points after fix" },
      { label: "Cooling Saved", value: "28 kWh", change: "8.2 kW row optimization active" },
      { label: "CO2 Reduced", value: "12 tons", change: "Weekly avoided impact" },
      { label: "Model Gain", value: "+3.2%", change: "Continual learning validated" }
    ];
  }

  return [
    { label: "Cascade Risk", value: "87%", change: "Rack 7 at 72 hour failure risk" },
    { label: "Downtime Avoided", value: "$250K", change: "Predicted single incident impact" },
    { label: "Cooling Saved", value: "8.2 kW", change: "PINN fan recommendation" },
    { label: "Open Orders", value: "2", change: "1 critical, 1 optimization" }
  ];
}

function buildWorkOrders(scenario: ScenarioId): WorkOrder[] {
  if (scenario === "baseline") {
    return [
      {
        id: "WO-OBS-101",
        priority: "P3",
        title: "Continue aisle observation",
        action: "No intervention required. Maintain passive scanning cadence.",
        impact: "Twin is stable with no active cascade signature.",
        roi: "Preserve technician bandwidth.",
        sustainability: "Baseline energy profile maintained.",
        confidence: 0.94
      }
    ];
  }

  if (scenario === "resolved") {
    return [
      {
        id: "WO-CLS-204",
        priority: "P3",
        title: "Close cascade incident and log learning signal",
        action: "Archive corrective action and retain optimized fan curves.",
        impact: "Rack 7 bearing stress normalized within the same validation cycle.",
        roi: "$47K weekly savings preserved.",
        sustainability: "12 tons CO2 reduction verified.",
        confidence: 0.97
      }
    ];
  }

  return [
    {
      id: "WO-P1-184",
      priority: "P1",
      title: "Clean Rack 4 intake filters",
      action: "Dispatch technician with AR guidance to remove blockage on Rack 4.",
      impact: "Prevents Rack 7 bearing failure within 72 hours.",
      roi: "Avoid $250K outage exposure.",
      sustainability: "Restores cooler intake path and reduces over-fan usage.",
      confidence: 0.91
    },
    {
      id: "WO-P2-188",
      priority: "P2",
      title: "Apply Row B fan optimization",
      action: "Increase Rack 4 fan curve by 12% and reduce Rack 7 by 8%.",
      impact: "Suppresses thermal shadow while relieving downstream fan stress.",
      roi: "Save $2.1K per month in cooling energy.",
      sustainability: "Estimated 3.4 tons CO2 reduced per month.",
      confidence: 0.88
    }
  ];
}

function buildHeadline(scenario: ScenarioId): Pick<DashboardSnapshot, "headline" | "summary"> {
  if (scenario === "baseline") {
    return {
      headline: "The aisle is calm, mapped, and continuously learning.",
      summary:
        "RackSentinel keeps a live digital twin of the data hall and watches for subtle cross-rack dependencies before they become outages."
    };
  }

  if (scenario === "resolved") {
    return {
      headline: "The cascade was interrupted before it became downtime.",
      summary:
        "The fix on Rack 4 collapsed the thermal shadow, restored confidence, and fed a verified learning signal back into the model."
    };
  }

  return {
    headline: "Rack 4 is now a system problem, not a single-rack alert.",
    summary:
      "Quad-modal sensing, spatial dependency modeling, and physics-aware optimization converge into one HMAX-ready intervention plan."
  };
}

function buildPayload(scenario: ScenarioId, racks: RackNode[], workOrders: WorkOrder[]) {
  const critical = racks.filter((rack) => rack.status === "critical").map((rack) => rack.name);

  return {
    source: "RackSentinel",
    scenario,
    site: "Demo Data Hall - Row B",
    criticalRacks: critical,
    workOrders,
    timestamp: new Date("2026-04-01T21:30:00+05:30").toISOString(),
    integration: {
      target: "HMAX Cloud",
      format: "JSON",
      sync: "MQTT bridge"
    }
  };
}

export function getDashboardSnapshot(scenario: ScenarioId): DashboardSnapshot {
  const racks = getScenarioRacks(scenario);
  const edges = getScenarioEdges(scenario);
  const zones = getScenarioZones(scenario);
  const stats = buildStats(scenario, racks);
  const workOrders = buildWorkOrders(scenario);
  const timeline = getScenarioTimeline(scenario);
  const { headline, summary } = buildHeadline(scenario);

  return {
    scenario,
    headline,
    summary,
    racks,
    edges,
    zones,
    workOrders,
    stats,
    timeline,
    hmaxPayload: buildPayload(scenario, racks, workOrders)
  };
}
