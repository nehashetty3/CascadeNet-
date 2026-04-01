from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any


@dataclass
class RackObservation:
    rack_id: str
    position_x: float
    aisle: str
    obstruction_pct: float
    thermal_c: float
    vibration_mm: float
    cable_risk: float
    audio_distress: float


@dataclass
class VisionSignal:
    rack_id: str
    airflow_score: float
    obstruction_score: float
    thermal_risk: float


@dataclass
class AudioSignal:
    rack_id: str
    arcing_score: float
    bearing_score: float
    panel_rattle_score: float


@dataclass
class CameraPose:
    frame_id: int
    x: float
    y: float
    z: float
    yaw_deg: float


@dataclass
class TwinRackState:
    rack_id: str
    x: float
    y: float
    z: float
    airflow_score: float
    vibration_risk: float
    cable_risk: float
    acoustic_risk: float
    thermal_c: float


@dataclass
class GraphEdge:
    source: str
    target: str
    edge_type: str
    weight: float


@dataclass
class CascadePrediction:
    rack_id: str
    risk_72h: float
    explanation: str


@dataclass
class CoolingAction:
    rack_id: str
    fan_delta_pct: float
    expected_kw_savings: float
    expected_temp_drop_c: float


@dataclass
class BackendSnapshot:
    observations: list[RackObservation] = field(default_factory=list)
    poses: list[CameraPose] = field(default_factory=list)
    twin: list[TwinRackState] = field(default_factory=list)
    edges: list[GraphEdge] = field(default_factory=list)
    predictions: list[CascadePrediction] = field(default_factory=list)
    actions: list[CoolingAction] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)
