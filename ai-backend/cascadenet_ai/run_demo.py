from __future__ import annotations

import json
from pathlib import Path

from .models.pinn import optimize_cooling
from .models.st_gat import build_graph, predict_cascades
from .pipelines.audio import infer_audio_signals
from .pipelines.digital_twin import reconstruct_twin
from .pipelines.slam import estimate_camera_poses
from .pipelines.vision import infer_vision_signals
from .synthetic import build_demo_observations, build_demo_pose_track
from .types import BackendSnapshot


def main() -> None:
    observations = build_demo_observations()
    poses = estimate_camera_poses(build_demo_pose_track())
    vision = infer_vision_signals(observations)
    audio = infer_audio_signals(observations)
    twin = reconstruct_twin(observations, poses, vision, audio)
    graph = build_graph(twin)
    predictions = predict_cascades(graph)
    actions = optimize_cooling(twin)

    snapshot = BackendSnapshot(
        observations=observations,
        poses=poses,
        twin=twin,
        edges=graph.edges,
        predictions=predictions[:6],
        actions=actions[:6],
    )

    output_dir = Path(__file__).resolve().parents[1] / "artifacts"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "backend_snapshot.json"
    output_path.write_text(json.dumps(snapshot.to_dict(), indent=2), encoding="utf-8")

    print("CascadeNet AI backend pipeline executed.")
    print(f"Observations processed: {len(observations)}")
    print(f"Camera poses estimated: {len(poses)}")
    print(f"Digital twin rack states: {len(twin)}")
    print("Top cascade predictions:")
    for prediction in predictions[:3]:
        print(f"  - {prediction.rack_id}: {prediction.risk_72h:.2%} risk in 72h")
    print("Top cooling actions:")
    for action in actions[:3]:
        print(
            f"  - {action.rack_id}: fan {action.fan_delta_pct:+.1f}% | "
            f"{action.expected_temp_drop_c:.2f}C drop | {action.expected_kw_savings:.2f} kW savings"
        )
    print(f"Wrote snapshot to {output_path}")


if __name__ == "__main__":
    main()
