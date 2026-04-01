from pathlib import Path

import imageio.v2 as imageio


root = Path(__file__).resolve().parent
frames_dir = root / "tmp" / "mock-video-frames"
output_dir = root.parent / "public" / "mock-video"
output_dir.mkdir(parents=True, exist_ok=True)

frames = sorted(frames_dir.glob("frame-*.png"))
if not frames:
    raise SystemExit("No frames found")

writer = imageio.get_writer(
    output_dir / "cascadenet-mock-demo.mp4",
    fps=4,
    codec="libx264",
    quality=8,
    pixelformat="yuv420p",
    macro_block_size=1,
)

for frame_path in frames:
    writer.append_data(imageio.imread(frame_path))

writer.close()
