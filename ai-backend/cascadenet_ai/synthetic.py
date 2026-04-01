from __future__ import annotations

from math import sin

from .types import CameraPose, RackObservation


def build_demo_observations() -> list[RackObservation]:
    template = [
        ("rack-01", 10, "Aisle North", 4, 24.2, 0.08, 0.08, 0.10),
        ("rack-02", 22, "Aisle North", 7, 24.8, 0.10, 0.10, 0.11),
        ("rack-03", 34, "Aisle North", 12, 26.1, 0.14, 0.30, 0.17),
        ("rack-04", 46, "Aisle North", 40, 34.0, 0.28, 0.12, 0.46),
        ("rack-05", 58, "Aisle North", 18, 29.7, 0.20, 0.16, 0.25),
        ("rack-06", 70, "Aisle South", 8, 25.0, 0.10, 0.11, 0.13),
        ("rack-07", 82, "Aisle South", 14, 31.8, 0.66, 0.21, 0.60),
        ("rack-08", 94, "Aisle South", 10, 27.7, 0.24, 0.39, 0.28),
    ]

    return [
        RackObservation(
            rack_id=rack_id,
            position_x=position_x,
            aisle=aisle,
            obstruction_pct=obstruction_pct,
            thermal_c=thermal_c,
            vibration_mm=vibration_mm,
            cable_risk=cable_risk,
            audio_distress=audio_distress,
        )
        for rack_id, position_x, aisle, obstruction_pct, thermal_c, vibration_mm, cable_risk, audio_distress in template
    ]


def build_demo_pose_track(frame_count: int = 24) -> list[CameraPose]:
    poses: list[CameraPose] = []
    for frame_id in range(frame_count):
      x = 0.35 * frame_id
      y = 1.8 + sin(frame_id / 6) * 0.04
      z = 1.55
      yaw_deg = 4.0 + sin(frame_id / 4) * 1.2
      poses.append(CameraPose(frame_id=frame_id, x=x, y=y, z=z, yaw_deg=yaw_deg))
    return poses
