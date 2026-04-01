from __future__ import annotations

from ..pipelines.shared import clamp
from ..types import CoolingAction, TwinRackState

try:
    import torch
    from torch import nn
except Exception:  # pragma: no cover - optional dependency
    torch = None
    nn = None

BaseModule = nn.Module if nn is not None else object


class CoolingPINN(BaseModule):  # type: ignore[misc]
    def __init__(self, in_features: int = 3, hidden_size: int = 24) -> None:
        if torch is None:
            raise RuntimeError("PyTorch is not installed.")
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(in_features, hidden_size),
            nn.Tanh(),
            nn.Linear(hidden_size, hidden_size),
            nn.Tanh(),
            nn.Linear(hidden_size, 2),
        )

    def forward(self, features):  # pragma: no cover - requires torch
        return self.network(features)


def optimize_cooling(twin: list[TwinRackState]) -> list[CoolingAction]:
    actions: list[CoolingAction] = []
    for rack in twin:
        thermal_load = clamp((rack.thermal_c - 24.0) / 10.0, 0.0, 1.0)
        instability = clamp((1.0 - rack.airflow_score) * 0.6 + rack.vibration_risk * 0.4, 0.0, 1.0)
        fan_delta_pct = round((thermal_load * 14.0 - instability * 3.5), 1)
        kw_savings = round(clamp(6.5 - fan_delta_pct * 0.18 + (1.0 - thermal_load) * 1.2, 0.8, 8.4), 2)
        temp_drop = round(clamp(fan_delta_pct * 0.18 + thermal_load * 2.6, 0.2, 4.4), 2)
        actions.append(
            CoolingAction(
                rack_id=rack.rack_id,
                fan_delta_pct=fan_delta_pct,
                expected_kw_savings=kw_savings,
                expected_temp_drop_c=temp_drop,
            )
        )
    return sorted(actions, key=lambda item: abs(item.fan_delta_pct), reverse=True)
