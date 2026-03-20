import { NextRequest, NextResponse } from "next/server";
import { requireBearerAuth } from "@/lib/auth/bearer-token";
import { writeStockMovementLog } from "@/lib/activityLog";
import { stockMovementLogInputSchema } from "@/lib/validation/stockMovement";
import { listLogs } from "@/lib/logs/service";
import { handleRouteError } from "@/lib/http";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireBearerAuth(request);
    const body = await request.json();
    const input = stockMovementLogInputSchema.parse(body);

    await writeStockMovementLog({
      ...input,
      user: input.user ?? auth.userId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error logging stock movement:", error);
    return handleRouteError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireBearerAuth(request);

    const logs = await listLogs({
      sortBy: "createdAt",
      sortDirection: "desc",
    });

    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    console.error("Error fetching stock movements:", error);
    return handleRouteError(error);
  }
}