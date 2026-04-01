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

export type TimelineEvent = {
  minute: number;
  title: string;
  detail: string;
};

export type DashboardSnapshot = {
  scenario: ScenarioId;
  headline: string;
  summary: string;
  racks: RackNode[];
  edges: RackEdge[];
  zones: TwinZone[];
  workOrders: WorkOrder[];
  stats: DashboardStat[];
  timeline: TimelineEvent[];
  hmaxPayload: Record<string, unknown>;
};
