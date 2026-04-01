from __future__ import annotations

from pathlib import Path

import cv2

from cascadenet_ai.synthetic_video import FPS, HEIGHT, SECONDS, WIDTH, draw_rack_scene


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
        cycle = frame_index / FPS
        obstruction_pct = min(max((cycle - 3.2) / 4.0, 0.0), 1.0) * 54
        writer.write(draw_rack_scene(obstruction_pct=obstruction_pct, frame_index=frame_index))

    writer.release()
    print(output_path)


if __name__ == "__main__":
    main()
