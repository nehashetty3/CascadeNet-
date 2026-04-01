import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const baseUrl = process.env.CAPTURE_URL ?? "http://127.0.0.1:3000";
const framesDir = join(__dirname, "tmp", "mock-video-frames");

await mkdir(framesDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 2 });

for (let frame = 0; frame <= 95; frame += 5) {
  await page.goto(`${baseUrl}/mock-demo?frame=${frame}`, { waitUntil: "networkidle" });
  await page.screenshot({ path: join(framesDir, `frame-${String(frame).padStart(3, "0")}.png`) });
}

await browser.close();
