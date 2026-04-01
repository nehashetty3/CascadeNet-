import { NextResponse } from "next/server";
import { getDashboardSnapshot } from "@/lib/engine";
import type { ScenarioId } from "@/lib/types";

const scenarios: ScenarioId[] = ["baseline", "cascade", "resolved"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scenario = (searchParams.get("scenario") as ScenarioId) || "cascade";
  const selected = scenarios.includes(scenario) ? scenario : "cascade";

  return NextResponse.json(getDashboardSnapshot(selected));
}
