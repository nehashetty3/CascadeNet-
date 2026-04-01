from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent
frames_dir = root / "tmp" / "mock-video-frames"
output_dir = root.parent / "public" / "mock-video"
output_dir.mkdir(parents=True, exist_ok=True)

frames = [Image.open(path).convert("P", palette=Image.Palette.ADAPTIVE) for path in sorted(frames_dir.glob("frame-*.png"))]
if not frames:
    raise SystemExit("No frames found")

frames[0].save(
    output_dir / "cascadenet-mock-demo.gif",
    save_all=True,
    append_images=frames[1:],
    duration=280,
    loop=0,
    optimize=False,
    disposal=2,
)

hero = Image.open(sorted(frames_dir.glob("frame-*.png"))[10]).convert("RGB")
hero.save(output_dir / "cascadenet-mock-demo-cover.png", quality=92)
