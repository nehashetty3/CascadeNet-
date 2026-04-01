from __future__ import annotations

from .shared import clamp
from ..types import RackObservation, VisionSignal


def infer_vision_signals(observations: list[RackObservation]) -> list[VisionSignal]:
    signals: list[VisionSignal] = []
    for rack in observations:
        obstruction_score = clamp(rack.obstruction_pct / 100.0, 0.0, 1.0)
        airflow_score = clamp(0.97 - obstruction_score * 1.18, 0.18, 0.97)
        thermal_risk = clamp((rack.thermal_c - 23.0) / 14.0 + obstruction_score * 0.18, 0.04, 0.98)
        signals.append(
            VisionSignal(
                rack_id=rack.rack_id,
                airflow_score=airflow_score,
                obstruction_score=obstruction_score,
                thermal_risk=thermal_risk,
            )
        )
    return signals
