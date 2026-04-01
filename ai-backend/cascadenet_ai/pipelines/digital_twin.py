from __future__ import annotations

from .shared import clamp
from ..types import AudioSignal, CameraPose, RackObservation, TwinRackState, VisionSignal


def reconstruct_twin(
    observations: list[RackObservation],
    poses: list[CameraPose],
    vision: list[VisionSignal],
    audio: list[AudioSignal],
) -> list[TwinRackState]:
    del poses

    by_vision = {item.rack_id: item for item in vision}
    by_audio = {item.rack_id: item for item in audio}
    twin: list[TwinRackState] = []

    for rack in observations:
        vision_signal = by_vision[rack.rack_id]
        audio_signal = by_audio[rack.rack_id]
        twin.append(
            TwinRackState(
                rack_id=rack.rack_id,
                x=rack.position_x,
                y=0.0 if rack.aisle == "Aisle North" else 1.0,
                z=0.0,
                airflow_score=vision_signal.airflow_score,
                vibration_risk=clamp(audio_signal.bearing_score, 0.02, 0.99),
                cable_risk=clamp(rack.cable_risk * 0.78 + audio_signal.arcing_score * 0.22, 0.02, 0.94),
                acoustic_risk=clamp(audio_signal.panel_rattle_score, 0.02, 0.96),
                thermal_c=rack.thermal_c,
            )
        )

    return twin
