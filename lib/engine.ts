import { getScenarioEdges, getScenarioRacks, getScenarioTimeline, getScenarioZones } from "@/lib/demo-data";
import type {
  DashboardSnapshot,
  DashboardStat,
  EventLogEntry,
  MaintenanceMode,
  OperatorInputs,
  RackEdge,
  RackNode,
  ScenarioId,
  WorkOrder
} from "@/lib/types";

type RackStatus = RackNode["status"];

export const defaultInputs: OperatorInputs = {
  scenario: "cascade",
  obstructionPct: 40,
  dependencyScale: 1,
  fanAssistPct: 12,
  maintenanceMode: "dispatch"
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

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

function deriveInputs(raw: Partial<Record<keyof OperatorInputs, string | null>>): OperatorInputs {
  const scenario = (raw.scenario as ScenarioId) || defaultInputs.scenario;

  return {
    scenario: scenario === "baseline" || scenario === "cascade" || scenario === "resolved" ? scenario : "cascade",
    obstructionPct: clamp(Number(raw.obstructionPct ?? defaultInputs.obstructionPct), 0, 60),
    dependencyScale: clamp(Number(raw.dependencyScale ?? defaultInputs.dependencyScale), 0.5, 1.5),
    fanAssistPct: clamp(Number(raw.fanAssistPct ?? defaultInputs.fanAssistPct), 0, 25),
    maintenanceMode: (raw.maintenanceMode as MaintenanceMode) || defaultInputs.maintenanceMode
  };
}

function applyOperatorInputs(inputs: OperatorInputs, racks: RackNode[], edges: RackEdge[]) {
  const normalizedObstruction = inputs.obstructionPct / 100;
  const dependencyScale = inputs.dependencyScale;
  const fanAssist = inputs.fanAssistPct / 100;
  const maintenanceRelief =
    inputs.maintenanceMode === "closed" ? 0.54 : inputs.maintenanceMode === "dispatch" ? 0.24 : 0;

  const nextRacks: RackNode[] = racks.map((rack): RackNode => {
    if (rack.id === "rack-04") {
      const airflow = clamp(0.92 - normalizedObstruction * 1.12 + fanAssist * 0.22 + maintenanceRelief * 0.34, 0.28, 0.96);
      const temperatureC = Math.round(clamp(24 + normalizedObstruction * 22 - fanAssist * 6 - maintenanceRelief * 9, 23, 38));
      const acoustic = clamp(0.14 + normalizedObstruction * 0.8 - maintenanceRelief * 0.32, 0.1, 0.94);
      const vibration = clamp(0.16 + normalizedObstruction * 0.42 - maintenanceRelief * 0.2, 0.1, 0.76);

      const status: RackStatus =
        inputs.obstructionPct > 28 && inputs.maintenanceMode !== "closed" ? "critical" : inputs.obstructionPct > 12 ? "watch" : "healthy";

      return {
        ...rack,
        status,
        issue:
          inputs.obstructionPct > 10
            ? `${inputs.obstructionPct}% intake obstruction under operator review`
            : inputs.maintenanceMode === "closed"
              ? "Maintenance closed and verified"
              : "Nominal intake path",
        predictedFailureHours: inputs.obstructionPct > 20 && inputs.maintenanceMode !== "closed" ? 72 : undefined,
        metrics: {
          ...rack.metrics,
          airflow,
          temperatureC,
          acoustic,
          vibration,
          confidence: clamp(0.96 - normalizedObstruction * 0.08 + maintenanceRelief * 0.05, 0.82, 0.99)
        }
      };
    }

    if (rack.id === "rack-07") {
      const propagated = clamp(normalizedObstruction * 0.78 * dependencyScale - fanAssist * 0.22 - maintenanceRelief * 0.34, 0, 1);
      const temperatureC = Math.round(clamp(25 + propagated * 11, 24, 34));
      const status: RackStatus = propagated > 0.44 ? "critical" : propagated > 0.2 ? "watch" : "healthy";

      return {
        ...rack,
        status,
        issue:
          propagated > 0.18
            ? "Downstream bearing stress from thermal route"
            : inputs.maintenanceMode === "closed"
              ? "Bearing load normalized"
              : "Nominal downstream load",
        predictedFailureHours: propagated > 0.42 ? 72 : propagated > 0.22 ? 96 : undefined,
        metrics: {
          ...rack.metrics,
          airflow: clamp(0.9 - propagated * 0.36, 0.55, 0.92),
          vibration: clamp(0.2 + propagated * 0.74, 0.18, 0.93),
          acoustic: clamp(0.18 + propagated * 0.62, 0.16, 0.88),
          temperatureC,
          confidence: clamp(0.95 - propagated * 0.08 + maintenanceRelief * 0.05, 0.82, 0.99)
        }
      };
    }

    if (rack.id === "rack-05" || rack.id === "rack-08") {
      const tertiary = clamp(normalizedObstruction * 0.42 * dependencyScale - maintenanceRelief * 0.22, 0, 0.5);
      const status: RackStatus = tertiary > 0.2 ? "watch" : "healthy";
      return {
        ...rack,
        status,
        issue: tertiary > 0.18 ? "Secondary coupling under observation" : rack.id === "rack-08" ? "Shared branch stable" : "Nominal",
        metrics: {
          ...rack.metrics,
          acoustic: clamp(rack.metrics.acoustic + tertiary * 0.18, 0.1, 0.66),
          cable: clamp(rack.metrics.cable + tertiary * 0.12, 0.08, 0.62),
          temperatureC: Math.round(clamp(rack.metrics.temperatureC + tertiary * 5, 24, 31))
        }
      };
    }

    return rack;
  });

  const nextEdges: RackEdge[] = edges.map((edge): RackEdge => {
    const weightBase =
      edge.type === "thermal"
        ? normalizedObstruction * 1.2
        : edge.type === "airflow"
          ? normalizedObstruction * 0.9
          : normalizedObstruction * 0.7;

    return {
      ...edge,
      weight: Number(clamp(edge.weight * dependencyScale * (0.4 + weightBase) - maintenanceRelief * 0.18, 0.08, 0.96).toFixed(2))
    };
  });

  return { racks: nextRacks, edges: nextEdges };
}

function buildStats(inputs: OperatorInputs, racks: RackNode[], workOrders: WorkOrder[]): DashboardStat[] {
  const avgRisk = averageRisk(racks);
  const openOrders = workOrders.filter((order) => order.priority !== "P3").length;
  const downtime = Math.round(avgRisk * 2900);
  const coolingKw = Math.max(2.2, Number((inputs.fanAssistPct * 0.54 + inputs.dependencyScale * 2.8).toFixed(1)));

  return [
    { label: "Cascade Risk", value: `${Math.round(avgRisk)}%`, change: inputs.maintenanceMode === "closed" ? "Risk reduced after closure" : "Computed from active rack couplings" },
    { label: "Downtime Exposure", value: `$${downtime.toLocaleString()}`, change: "Estimated from current propagation path" },
    { label: "Cooling Adjustment", value: `${coolingKw} kW`, change: `Fan assist set to ${inputs.fanAssistPct}%` },
    { label: "Open Orders", value: String(openOrders), change: `${inputs.maintenanceMode === "dispatch" ? "Dispatch workflow active" : "Operations state synchronized"}` }
  ];
}

function buildWorkOrders(inputs: OperatorInputs, racks: RackNode[]): WorkOrder[] {
  const rack4 = racks.find((rack) => rack.id === "rack-04");
  const rack7 = racks.find((rack) => rack.id === "rack-07");
  const risk = averageRisk(racks);

  if (inputs.maintenanceMode === "closed") {
    return [
      {
        id: "WO-CLS-410",
        priority: "P3",
        title: "Close incident and archive operator validation",
        action: "Record restored airflow, reduced downstream stress, and retain current optimized fan setpoints.",
        impact: "Rack 7 recovered to monitored state without further escalation.",
        roi: `$${Math.round(risk * 420).toLocaleString()} weekly savings retained.`,
        sustainability: "Cooling load reduced after verified corrective action.",
        confidence: 0.97
      }
    ];
  }

  const primaryRisk = rack7?.status === "critical" ? "P1" : rack4?.status === "watch" ? "P2" : "P3";

  return [
    {
      id: "WO-ACT-301",
      priority: primaryRisk,
      title: `Clear Rack 4 intake obstruction (${inputs.obstructionPct}% estimated)`,
      action: "Dispatch floor technician to inspect filter path, remove blockage, and confirm restored intake volume.",
      impact: rack7?.status === "critical" ? "Prevents downstream Rack 7 failure window within 72 hours." : "Contains upstream anomaly before it broadens across the row.",
      roi: `Avoid approximately $${Math.round(risk * 2800).toLocaleString()} in downtime exposure.`,
      sustainability: "Reduces over-fan behavior and lowers thermal spill across the aisle.",
      confidence: 0.91
    },
    {
      id: "WO-ACT-302",
      priority: inputs.fanAssistPct > 0 ? "P2" : "P3",
      title: "Apply temporary fan assist profile",
      action: `Increase local fan assist by ${inputs.fanAssistPct}% while maintenance is in progress.`,
      impact: "Suppresses thermal route intensity and stabilizes downstream vibration signatures.",
      roi: `Supports ${Math.round(inputs.fanAssistPct * 170)} dollars per day in avoided cooling inefficiency.`,
      sustainability: "Balances cooling response without overspending power across the row.",
      confidence: 0.88
    }
  ];
}

function buildHeadline(inputs: OperatorInputs, racks: RackNode[]): Pick<DashboardSnapshot, "headline" | "summary"> {
  const rack7 = racks.find((rack) => rack.id === "rack-07");
  const rack4 = racks.find((rack) => rack.id === "rack-04");

  if (inputs.maintenanceMode === "closed") {
    return {
      headline: "Incident closed. Digital twin confirms the aisle is stable.",
      summary: "Operator controls, route analytics, and maintenance closure are aligned. The system has retained the verified fix in the active operating picture."
    };
  }

  if (rack7?.status === "critical") {
    return {
      headline: "Rack 4 is driving a cross-rack risk condition toward Rack 7.",
      summary: "The current obstruction level and dependency weighting produce a failure path that operations should address immediately."
    };
  }

  if (rack4?.status === "watch") {
    return {
      headline: "An upstream obstruction is contained, but still operationally relevant.",
      summary: "CascadeNet is showing early coupling behavior while the aisle remains serviceable under operator supervision."
    };
  }

  return {
    headline: "The aisle is stable, logged, and under continuous operator control.",
    summary: "Live operating inputs now modulate the digital twin directly, allowing engineering teams to rehearse escalation, dispatch, and closure states."
  };
}

function buildEventLog(inputs: OperatorInputs, racks: RackNode[], edges: RackEdge[]): EventLogEntry[] {
  const rack4 = racks.find((rack) => rack.id === "rack-04");
  const rack7 = racks.find((rack) => rack.id === "rack-07");
  const thermal = edges.find((edge) => edge.type === "thermal");

  return [
    {
      id: "evt-001",
      time: "21:24:08",
      severity: inputs.obstructionPct > 18 ? "warning" : "info",
      source: "RackFlow",
      message: `Rack 4 intake restriction estimated at ${inputs.obstructionPct}%.`
    },
    {
      id: "evt-002",
      time: "21:24:16",
      severity: thermal && thermal.weight > 0.58 ? "critical" : "info",
      source: "Graph Engine",
      message: `Thermal route weight updated to ${Math.round((thermal?.weight ?? 0) * 100)}% with dependency scale ${inputs.dependencyScale.toFixed(2)}.`
    },
    {
      id: "evt-003",
      time: "21:24:27",
      severity: rack7?.status === "critical" ? "critical" : rack7?.status === "watch" ? "warning" : "info",
      source: "VibeGuard",
      message: `Rack 7 bearing stress now in ${rack7?.status ?? "healthy"} state.`
    },
    {
      id: "evt-004",
      time: "21:24:36",
      severity: inputs.maintenanceMode === "closed" ? "success" : inputs.maintenanceMode === "dispatch" ? "warning" : "info",
      source: "Operations",
      message:
        inputs.maintenanceMode === "closed"
          ? "Maintenance closure acknowledged and verification log stored."
          : inputs.maintenanceMode === "dispatch"
            ? "Dispatch workflow active with temporary fan assist applied."
            : "Observation mode active. No dispatch confirmed yet."
    }
  ];
}

function buildPayload(inputs: OperatorInputs, racks: RackNode[], workOrders: WorkOrder[]) {
  const critical = racks.filter((rack) => rack.status === "critical").map((rack) => rack.name);

  return {
    source: "RackSentinel",
    scenario: inputs.scenario,
    site: "Demo Data Hall - Row B",
    operatorInputs: inputs,
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

export function getDashboardSnapshot(rawInputs?: Partial<Record<keyof OperatorInputs, string | null>>): DashboardSnapshot {
  const inputs = deriveInputs(rawInputs ?? {});
  const baseRacks = getScenarioRacks(inputs.scenario);
  const baseEdges = getScenarioEdges(inputs.scenario);
  const zones = getScenarioZones(inputs.scenario);
  const timeline = getScenarioTimeline(inputs.scenario);
  const { racks, edges } = applyOperatorInputs(inputs, baseRacks, baseEdges);
  const workOrders = buildWorkOrders(inputs, racks);
  const stats = buildStats(inputs, racks, workOrders);
  const eventLog = buildEventLog(inputs, racks, edges);
  const { headline, summary } = buildHeadline(inputs, racks);

  return {
    scenario: inputs.scenario,
    inputs,
    headline,
    summary,
    racks,
    edges,
    zones,
    workOrders,
    stats,
    timeline,
    eventLog,
    hmaxPayload: buildPayload(inputs, racks, workOrders)
  };
}
