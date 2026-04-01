export type ScenarioId = "baseline" | "cascade" | "resolved";

export type RackModality = {
  airflow: number;
  vibration: number;
  cable: number;
  acoustic: number;
  temperatureC: number;
  confidence: number;
};

export type RackNode = {
  id: string;
  name: string;
  aisle: string;
  row: string;
  position: { x: number; y: number; z: number };
  status: "healthy" | "watch" | "critical";
  issue?: string;
  metrics: RackModality;
  predictedFailureHours?: number;
};

export type RackEdge = {
  source: string;
  target: string;
  type: "thermal" | "airflow" | "power";
  weight: number;
  explanation: string;
};

export type TwinZone = {
  id: string;
  label: string;
  occupancy: number;
  thermalShadow: number;
};

export type WorkOrder = {
  id: string;
  priority: "P1" | "P2" | "P3";
  title: string;
  action: string;
  impact: string;
  roi: string;
  sustainability: string;
  confidence: number;
};

export type DashboardStat = {
  label: string;
  value: string;
  change: string;
};

export type MaintenanceMode = "observe" | "dispatch" | "closed";

export type OperatorInputs = {
  scenario: ScenarioId;
  obstructionPct: number;
  dependencyScale: number;
  fanAssistPct: number;
  maintenanceMode: MaintenanceMode;
};

export type TimelineEvent = {
  minute: number;
  title: string;
  detail: string;
};

export type EventLogEntry = {
  id: string;
  time: string;
  severity: "info" | "warning" | "critical" | "success";
  source: string;
  message: string;
};

export type DashboardSnapshot = {
  scenario: ScenarioId;
  inputs: OperatorInputs;
  headline: string;
  summary: string;
  racks: RackNode[];
  edges: RackEdge[];
  zones: TwinZone[];
  workOrders: WorkOrder[];
  stats: DashboardStat[];
  timeline: TimelineEvent[];
  eventLog: EventLogEntry[];
  hmaxPayload: Record<string, unknown>;
};
