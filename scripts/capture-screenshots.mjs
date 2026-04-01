import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const outputDir = join(__dirname, "..", "public", "screenshots");
const baseUrl = process.env.CAPTURE_URL ?? "http://127.0.0.1:3000";

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1512, height: 982 }, deviceScaleFactor: 2 });

await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.screenshot({ path: join(outputDir, "dashboard-cascade.png"), fullPage: true });

await page.getByRole("button", { name: /Calm State/i }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: join(outputDir, "dashboard-baseline.png"), fullPage: true });

await page.getByRole("button", { name: /Resolved Loop/i }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: join(outputDir, "dashboard-resolved.png"), fullPage: true });

await browser.close();
