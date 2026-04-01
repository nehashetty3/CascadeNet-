from __future__ import annotations

from .shared import clamp
from ..types import AudioSignal, RackObservation


def infer_audio_signals(observations: list[RackObservation]) -> list[AudioSignal]:
    signals: list[AudioSignal] = []
    for rack in observations:
        arcing = clamp(rack.cable_risk * 0.72 + rack.audio_distress * 0.24, 0.02, 0.92)
        bearing = clamp(rack.vibration_mm * 1.05 + rack.audio_distress * 0.45, 0.04, 0.97)
        panel_rattle = clamp(rack.audio_distress * 0.88 + rack.vibration_mm * 0.2, 0.03, 0.91)
        signals.append(
            AudioSignal(
                rack_id=rack.rack_id,
                arcing_score=arcing,
                bearing_score=bearing,
                panel_rattle_score=panel_rattle,
            )
        )
    return signals
