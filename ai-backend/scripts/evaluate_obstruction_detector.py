from __future__ import annotations

import json
from pathlib import Path

import numpy as np

from cascadenet_ai.pipelines.live_obstruction import center_roi, estimate_obstruction, extract_intake_features
from cascadenet_ai.synthetic_video import draw_rack_scene, ensure_cv2


def classification_label(obstruction_pct: float) -> str:
    if obstruction_pct >= 30:
        return "high"
    if obstruction_pct >= 15:
        return "moderate"
    return "low"


def main() -> None:
    ensure_cv2()
    rng = np.random.default_rng(7)
    baseline_obstructions = [0, 1, 2, 3, 4, 5]
    evaluation_obstructions = [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 46, 52, 58]

    baseline_features = []
    previous_roi = None
    frame_index = 0

    for obstruction_pct in baseline_obstructions:
        frame = draw_rack_scene(obstruction_pct=obstruction_pct, frame_index=frame_index, noise_level=2.2)
        x, y, w, h = center_roi(frame)
        roi = frame[y : y + h, x : x + w]
        features = extract_intake_features(roi, previous_roi)
        baseline_features.append(features)
        previous_roi = roi.copy()
        frame_index += 1

    baseline = baseline_features[0]
    if len(baseline_features) > 1:
        baseline = type(baseline)(
            brightness=float(np.mean([item.brightness for item in baseline_features])),
            edge_density=float(np.mean([item.edge_density for item in baseline_features])),
            texture_std=float(np.mean([item.texture_std for item in baseline_features])),
            motion_score=float(np.mean([item.motion_score for item in baseline_features])),
            darkness_ratio=float(np.mean([item.darkness_ratio for item in baseline_features])),
        )

    rows = []
    previous_roi = None
    for obstruction_pct in evaluation_obstructions:
        for repeat_index in range(5):
            frame = draw_rack_scene(
                obstruction_pct=obstruction_pct,
                frame_index=frame_index,
                noise_level=2.0 + repeat_index * 0.6,
            )
            x, y, w, h = center_roi(frame)
            roi = frame[y : y + h, x : x + w]
            features = extract_intake_features(roi, previous_roi)
            prediction = estimate_obstruction(features, baseline)
            rows.append(
                {
                    "true_obstruction_pct": float(obstruction_pct),
                    "predicted_obstruction_pct": float(prediction.obstruction_pct),
                    "absolute_error": float(abs(prediction.obstruction_pct - obstruction_pct)),
                    "true_class": classification_label(obstruction_pct),
                    "predicted_class": classification_label(prediction.obstruction_pct),
                    "confidence": float(prediction.confidence),
                }
            )
            previous_roi = roi.copy()
            frame_index += 1

    y_true = np.array([row["true_obstruction_pct"] for row in rows], dtype=float)
    y_pred = np.array([row["predicted_obstruction_pct"] for row in rows], dtype=float)
    mae = float(np.mean(np.abs(y_pred - y_true)))
    rmse = float(np.sqrt(np.mean((y_pred - y_true) ** 2)))
    mape = float(np.mean(np.abs((y_pred - y_true) / np.maximum(y_true, 1.0))) * 100.0)
    class_accuracy = float(np.mean([row["true_class"] == row["predicted_class"] for row in rows]))
    threshold_accuracy = float(
        np.mean([(row["true_obstruction_pct"] >= 15) == (row["predicted_obstruction_pct"] >= 15) for row in rows])
    )
    avg_confidence = float(np.mean([row["confidence"] for row in rows]))

    report = {
        "dataset": {
            "baseline_samples": len(baseline_obstructions),
            "evaluation_samples": len(rows),
            "obstruction_levels": evaluation_obstructions,
            "notes": "Synthetic rack-intake benchmark with controlled obstruction levels and image noise."
        },
        "metrics": {
            "mae_pct": round(mae, 2),
            "rmse_pct": round(rmse, 2),
            "mape_pct": round(mape, 2),
            "three_class_accuracy": round(class_accuracy, 4),
            "threshold_accuracy_15pct": round(threshold_accuracy, 4),
            "average_confidence": round(avg_confidence, 4),
        },
        "samples": rows[:12],
    }

    artifacts_dir = Path(__file__).resolve().parents[1] / "artifacts"
    artifacts_dir.mkdir(parents=True, exist_ok=True)
    report_path = artifacts_dir / "obstruction_evaluation.json"
    report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")

    print(json.dumps(report["metrics"], indent=2))
    print(f"Wrote evaluation report to {report_path}")


if __name__ == "__main__":
    main()
