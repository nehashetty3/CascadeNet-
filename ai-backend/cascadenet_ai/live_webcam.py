from __future__ import annotations

import argparse
import json
import time
from pathlib import Path

from .pipelines.live_obstruction import (
    IntakeFeatures,
    center_roi,
    estimate_obstruction,
    extract_intake_features,
    save_frame,
)

try:
    import cv2
except Exception:  # pragma: no cover - optional dependency
    cv2 = None


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Live obstruction detection for CascadeNet from webcam or video.")
    parser.add_argument("--camera-index", type=int, default=0, help="OpenCV camera index.")
    parser.add_argument("--video", help="Optional path to a video file of racks/servers instead of a live camera.")
    parser.add_argument("--baseline-seconds", type=float, default=3.0, help="Seconds to observe a clean intake before scoring.")
    parser.add_argument("--baseline-frames", type=int, default=60, help="Frames to use for baseline calibration when processing a video file.")
    parser.add_argument("--rack-id", default="rack-04", help="Rack id associated with the current camera view.")
    parser.add_argument("--output", default="artifacts/live_webcam_obstruction.json", help="Artifact JSON path.")
    parser.add_argument("--snapshot", default="artifacts/live_webcam_frame.png", help="Annotated frame output path.")
    parser.add_argument("--no-preview", action="store_true", help="Disable the OpenCV preview window.")
    return parser.parse_args()


def ensure_cv2() -> None:
    if cv2 is None:  # pragma: no cover - depends on optional dependency
        raise RuntimeError("OpenCV is not installed. Run `pip install -e \".[full]\"` inside ai-backend.")


def average_features(items: list[IntakeFeatures]) -> IntakeFeatures:
    count = max(len(items), 1)
    return IntakeFeatures(
        brightness=sum(item.brightness for item in items) / count,
        edge_density=sum(item.edge_density for item in items) / count,
        texture_std=sum(item.texture_std for item in items) / count,
        motion_score=sum(item.motion_score for item in items) / count,
        darkness_ratio=sum(item.darkness_ratio for item in items) / count,
    )


def main() -> None:
    args = parse_args()
    ensure_cv2()
    capture = cv2.VideoCapture(args.video if args.video else args.camera_index)
    if not capture.isOpened():
        source = args.video if args.video else f"camera index {args.camera_index}"
        raise RuntimeError(f"Unable to open {source}.")

    baseline_features: list[IntakeFeatures] = []
    previous_roi = None
    baseline_deadline = time.time() + args.baseline_seconds
    latest_estimate = None
    latest_frame = None
    latest_roi = None
    frame_index = 0
    from_video = bool(args.video)
    preview_enabled = not args.no_preview and not from_video

    print("CascadeNet obstruction monitor")
    print(f"Source: {args.video if from_video else f'camera {args.camera_index}'}")
    print("Controls: q quit | b recalibrate baseline | s save current artifact")

    try:
        while True:
            ok, frame = capture.read()
            if not ok:
                if from_video:
                    break
                continue

            x, y, w, h = center_roi(frame)
            roi = frame[y : y + h, x : x + w]
            features = extract_intake_features(roi, previous_roi)
            previous_roi = roi.copy()
            frame_index += 1

            calibrating = (
                frame_index <= args.baseline_frames if from_video else time.time() < baseline_deadline or not baseline_features
            )
            if calibrating:
                baseline_features.append(features)
                baseline = average_features(baseline_features)
            else:
                baseline = average_features(baseline_features)

            latest_estimate = estimate_obstruction(features, baseline)
            latest_frame = frame.copy()
            latest_roi = (x, y, w, h)

            color = (70, 180, 110) if latest_estimate.obstruction_pct < 18 else (40, 140, 220) if latest_estimate.obstruction_pct < 40 else (70, 70, 220)
            cv2.rectangle(latest_frame, (x, y), (x + w, y + h), color, 2)
            label = f"{args.rack_id} obstruction {latest_estimate.obstruction_pct:.1f}% | airflow {latest_estimate.airflow_score:.2f}"
            cv2.putText(latest_frame, label, (20, 34), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2, cv2.LINE_AA)
            state = "Calibrating baseline" if calibrating else f"Confidence {latest_estimate.confidence:.2f}"
            cv2.putText(latest_frame, state, (20, 62), cv2.FONT_HERSHEY_SIMPLEX, 0.58, (220, 226, 232), 1, cv2.LINE_AA)
            if from_video:
                cv2.putText(latest_frame, f"Video frame {frame_index}", (20, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.54, (200, 208, 214), 1, cv2.LINE_AA)

            key = -1
            if preview_enabled:
                cv2.imshow("CascadeNet Live Obstruction", latest_frame)
                key = cv2.waitKey(1) & 0xFF

            if key == ord("q"):
                break
            if key == ord("b"):
                baseline_features = []
                baseline_deadline = time.time() + args.baseline_seconds
                frame_index = 0
            if key == ord("s") and latest_estimate is not None and latest_frame is not None and latest_roi is not None:
                write_artifact(args, latest_estimate, latest_frame, latest_roi)
                print(f"Saved artifact to {args.output}")
    finally:
        capture.release()
        if preview_enabled:
            cv2.destroyAllWindows()

    if latest_estimate is not None and latest_frame is not None and latest_roi is not None:
        write_artifact(args, latest_estimate, latest_frame, latest_roi)
        print(json.dumps(load_json(Path(args.output)), indent=2))


def write_artifact(args: argparse.Namespace, estimate, frame, roi) -> None:
    output_path = Path(args.output)
    snapshot_path = Path(args.snapshot)
    x, y, w, h = roi

    artifact = {
        "rack_id": args.rack_id,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "camera_index": args.camera_index,
        "source_type": "video" if args.video else "camera",
        "source_path": args.video,
        "roi": {"x": x, "y": y, "width": w, "height": h},
        "estimate": estimate.to_dict(),
        "snapshot": str(snapshot_path),
    }

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(artifact, indent=2), encoding="utf-8")
    save_frame(snapshot_path, frame)


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


if __name__ == "__main__":
    main()
