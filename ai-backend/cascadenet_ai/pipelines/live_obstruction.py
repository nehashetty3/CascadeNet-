from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np

from .shared import clamp

try:
    import cv2
except Exception:  # pragma: no cover - optional dependency
    cv2 = None


@dataclass
class IntakeFeatures:
    brightness: float
    edge_density: float
    texture_std: float
    motion_score: float
    darkness_ratio: float


@dataclass
class ObstructionEstimate:
    obstruction_pct: float
    airflow_score: float
    confidence: float
    features: IntakeFeatures

    def to_dict(self) -> dict[str, Any]:
        return {
            "obstruction_pct": self.obstruction_pct,
            "airflow_score": self.airflow_score,
            "confidence": self.confidence,
            "features": {
                "brightness": self.features.brightness,
                "edge_density": self.features.edge_density,
                "texture_std": self.features.texture_std,
                "motion_score": self.features.motion_score,
                "darkness_ratio": self.features.darkness_ratio,
            },
        }


def _ensure_cv2() -> None:
    if cv2 is None:  # pragma: no cover - depends on optional dependency
        raise RuntimeError("OpenCV is not installed. Run `pip install -e \".[full]\"` inside ai-backend.")


def center_roi(frame: np.ndarray, width_ratio: float = 0.38, height_ratio: float = 0.34) -> tuple[int, int, int, int]:
    height, width = frame.shape[:2]
    roi_width = int(width * width_ratio)
    roi_height = int(height * height_ratio)
    x = (width - roi_width) // 2
    y = (height - roi_height) // 2
    return x, y, roi_width, roi_height


def extract_intake_features(roi_bgr: np.ndarray, previous_roi_bgr: np.ndarray | None = None) -> IntakeFeatures:
    _ensure_cv2()
    gray = cv2.cvtColor(roi_bgr, cv2.COLOR_BGR2GRAY)
    brightness = float(gray.mean() / 255.0)
    texture_std = float(gray.std() / 255.0)
    edges = cv2.Canny(gray, 60, 140)
    edge_density = float(np.count_nonzero(edges) / edges.size)
    darkness_ratio = float(np.mean(gray < 52))

    if previous_roi_bgr is None:
        motion_score = 0.0
    else:
        prev_gray = cv2.cvtColor(previous_roi_bgr, cv2.COLOR_BGR2GRAY)
        diff = cv2.absdiff(gray, prev_gray)
        motion_score = float(np.mean(diff) / 255.0)

    return IntakeFeatures(
        brightness=brightness,
        edge_density=edge_density,
        texture_std=texture_std,
        motion_score=motion_score,
        darkness_ratio=darkness_ratio,
    )


def estimate_obstruction(
    features: IntakeFeatures,
    baseline: IntakeFeatures | None = None,
) -> ObstructionEstimate:
    if baseline is None:
        brightness_delta = 0.0
        edge_delta = 0.0
        texture_delta = 0.0
        motion_delta = 0.0
        darkness_delta = features.darkness_ratio
    else:
        brightness_delta = clamp(baseline.brightness - features.brightness, -1.0, 1.0)
        edge_delta = clamp(baseline.edge_density - features.edge_density, -1.0, 1.0)
        texture_delta = clamp(baseline.texture_std - features.texture_std, -1.0, 1.0)
        motion_delta = clamp(baseline.motion_score - features.motion_score, -1.0, 1.0)
        darkness_delta = clamp(features.darkness_ratio - baseline.darkness_ratio, -1.0, 1.0)

    obstruction_score = (
        brightness_delta * 1821.8227501519893
        + edge_delta * 83.67680529354071
        - texture_delta * 2208.9304257343088
        - motion_delta * 11.835605244549097
        + darkness_delta * 28.374697631880753
        - (brightness_delta**2) * 60749.858063483756
        - (edge_delta**2) * 70246.99918429085
        - (texture_delta**2) * 113278.69589866509
        - (darkness_delta**2) * 715.5407653906631
        + (brightness_delta * darkness_delta) * 13729.633268944111
        - (edge_delta * darkness_delta) * 13111.806866175197
        + (brightness_delta * edge_delta) * 144848.92911464183
        + 3.202736901768083
    )

    obstruction_pct = round(clamp(obstruction_score, 0.0, 100.0), 1)
    airflow_score = round(clamp(0.98 - obstruction_pct / 100.0 * 1.08, 0.05, 0.98), 3)
    confidence_proxy = (
        abs(brightness_delta) * 1.5
        + abs(edge_delta) * 0.8
        + abs(texture_delta) * 0.8
        + abs(darkness_delta) * 0.7
    )
    confidence = round(clamp(0.72 + confidence_proxy * 0.5, 0.72, 0.99), 3)

    return ObstructionEstimate(
        obstruction_pct=obstruction_pct,
        airflow_score=airflow_score,
        confidence=confidence,
        features=features,
    )


def save_frame(path: Path, frame_bgr: np.ndarray) -> None:
    _ensure_cv2()
    path.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(path), frame_bgr)
