import { NextResponse } from "next/server";
import { getDashboardSnapshot } from "@/lib/engine";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  return NextResponse.json(
    getDashboardSnapshot({
      scenario: searchParams.get("scenario"),
      obstructionPct: searchParams.get("obstructionPct"),
      dependencyScale: searchParams.get("dependencyScale"),
      fanAssistPct: searchParams.get("fanAssistPct"),
      maintenanceMode: searchParams.get("maintenanceMode")
    })
  );
}
