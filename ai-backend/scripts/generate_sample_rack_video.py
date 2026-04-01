from __future__ import annotations

from pathlib import Path

import cv2
import numpy as np


WIDTH = 1280
HEIGHT = 720
FPS = 24
SECONDS = 10


def draw_rack_scene(frame_index: int) -> np.ndarray:
    frame = np.zeros((HEIGHT, WIDTH, 3), dtype=np.uint8)
    frame[:] = (20, 24, 28)

    for x in range(0, WIDTH, 48):
        cv2.line(frame, (x, 0), (x, HEIGHT), (28, 34, 40), 1)
    for y in range(0, HEIGHT, 44):
        cv2.line(frame, (0, y), (WIDTH, y), (24, 30, 36), 1)

    rack_left = 340
    rack_top = 110
    rack_width = 600
    rack_height = 500
    cv2.rectangle(frame, (rack_left, rack_top), (rack_left + rack_width, rack_top + rack_height), (42, 48, 56), -1)
    cv2.rectangle(frame, (rack_left, rack_top), (rack_left + rack_width, rack_top + rack_height), (84, 92, 104), 2)

    for slot in range(12):
        y = rack_top + 24 + slot * 38
        slot_color = (56, 64, 74) if slot % 2 == 0 else (50, 58, 68)
        cv2.rectangle(frame, (rack_left + 36, y), (rack_left + rack_width - 36, y + 20), slot_color, -1)

    intake_x = rack_left + 160
    intake_y = rack_top + 160
    intake_w = 280
    intake_h = 170
    cv2.rectangle(frame, (intake_x, intake_y), (intake_x + intake_w, intake_y + intake_h), (72, 84, 96), -1)
    cv2.rectangle(frame, (intake_x, intake_y), (intake_x + intake_w, intake_y + intake_h), (152, 164, 178), 2)

    for slat in range(16):
        sx = intake_x + 10 + slat * 16
        cv2.line(frame, (sx, intake_y + 10), (sx, intake_y + intake_h - 10), (138, 150, 164), 2)

    cycle = frame_index / FPS
    obstruction_phase = min(max((cycle - 3.2) / 4.0, 0.0), 1.0)
    obstruction_width = int(intake_w * 0.54 * obstruction_phase)

    if obstruction_width > 0:
        cv2.rectangle(
            frame,
            (intake_x + 20, intake_y + 18),
            (intake_x + 20 + obstruction_width, intake_y + intake_h - 18),
            (36, 40, 44),
            -1,
        )

    shimmer = 0.85 + 0.15 * np.sin(frame_index / 5)
    overlay = frame.copy()
    cv2.rectangle(
        overlay,
        (intake_x, intake_y),
        (intake_x + intake_w, intake_y + intake_h),
        (int(40 * shimmer), int(68 * shimmer), int(96 * shimmer)),
        -1,
    )
    cv2.addWeighted(overlay, 0.08, frame, 0.92, 0, frame)

    cv2.putText(frame, "CascadeNet Sample Rack Feed", (44, 54), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (214, 220, 226), 2, cv2.LINE_AA)
    cv2.putText(frame, "Intake inspection region centered in frame", (44, 92), cv2.FONT_HERSHEY_SIMPLEX, 0.74, (170, 180, 190), 2, cv2.LINE_AA)
    cv2.putText(frame, f"Frame {frame_index:03d}", (44, HEIGHT - 32), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (160, 170, 182), 2, cv2.LINE_AA)

    return frame


def main() -> None:
    output_path = Path(__file__).resolve().parents[1] / "artifacts" / "sample-rack-feed.mp4"
    output_path.parent.mkdir(parents=True, exist_ok=True)

    writer = cv2.VideoWriter(
        str(output_path),
        cv2.VideoWriter_fourcc(*"mp4v"),
        FPS,
        (WIDTH, HEIGHT),
    )

    total_frames = FPS * SECONDS
    for frame_index in range(total_frames):
        writer.write(draw_rack_scene(frame_index))

    writer.release()
    print(output_path)


if __name__ == "__main__":
    main()
