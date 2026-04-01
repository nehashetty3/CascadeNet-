from __future__ import annotations

from dataclasses import dataclass

from ..pipelines.shared import clamp
from ..types import CascadePrediction, GraphEdge, TwinRackState

try:
    import torch
    from torch import nn
except Exception:  # pragma: no cover - optional dependency
    torch = None
    nn = None

BaseModule = nn.Module if nn is not None else object


@dataclass
class GraphBundle:
    nodes: list[TwinRackState]
    edges: list[GraphEdge]


class SimpleSTGAT(BaseModule):  # type: ignore[misc]
    def __init__(self, in_features: int = 4, hidden_size: int = 16) -> None:
        if torch is None:
            raise RuntimeError("PyTorch is not installed.")
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Linear(in_features, hidden_size),
            nn.GELU(),
            nn.Linear(hidden_size, hidden_size),
            nn.GELU(),
        )
        self.head = nn.Linear(hidden_size, 1)

    def forward(self, features):  # pragma: no cover - requires torch
        encoded = self.encoder(features)
        return self.head(encoded).sigmoid()


def build_graph(nodes: list[TwinRackState]) -> GraphBundle:
    edges: list[GraphEdge] = []
    nodes_by_id = {node.rack_id: node for node in nodes}

    if "rack-04" in nodes_by_id and "rack-07" in nodes_by_id:
        edges.append(GraphEdge(source="rack-04", target="rack-07", edge_type="thermal", weight=0.78))
    if "rack-04" in nodes_by_id and "rack-05" in nodes_by_id:
        edges.append(GraphEdge(source="rack-04", target="rack-05", edge_type="airflow", weight=0.62))
    if "rack-07" in nodes_by_id and "rack-08" in nodes_by_id:
        edges.append(GraphEdge(source="rack-07", target="rack-08", edge_type="power", weight=0.57))

    for node in nodes:
        if node.rack_id not in {"rack-04", "rack-05", "rack-07", "rack-08"}:
            if node.x < 46:
                edges.append(GraphEdge(source=node.rack_id, target="rack-04", edge_type="airflow", weight=0.18))
            else:
                edges.append(GraphEdge(source="rack-07", target=node.rack_id, edge_type="thermal", weight=0.16))

    return GraphBundle(nodes=nodes, edges=edges)


def predict_cascades(bundle: GraphBundle) -> list[CascadePrediction]:
    predictions: list[CascadePrediction] = []
    weights_by_target: dict[str, float] = {}

    for edge in bundle.edges:
        weights_by_target[edge.target] = weights_by_target.get(edge.target, 0.0) + edge.weight

    for node in bundle.nodes:
        base = (
            (1.0 - node.airflow_score) * 0.35
            + node.vibration_risk * 0.3
            + node.cable_risk * 0.13
            + node.acoustic_risk * 0.22
        )
        coupled = weights_by_target.get(node.rack_id, 0.0) * 0.22
        thermal = clamp((node.thermal_c - 24.0) / 12.0, 0.0, 0.9) * 0.2
        risk_72h = clamp(base + coupled + thermal, 0.04, 0.98)
        predictions.append(
            CascadePrediction(
                rack_id=node.rack_id,
                risk_72h=risk_72h,
                explanation=f"Base risk {base:.2f} plus spatial coupling {coupled:.2f} and thermal pressure {thermal:.2f}.",
            )
        )
    return sorted(predictions, key=lambda item: item.risk_72h, reverse=True)
