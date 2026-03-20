import { NextRequest, NextResponse } from "next/server";
import { requireBearerAuth } from "@/lib/auth/bearer-token";
import { writeStockMovementLog } from "@/lib/activityLog";
import { stockMovementLogInputSchema } from "@/lib/validation/stockMovement";
import { listLogs } from "@/lib/logs/service";

/**
 * POST /api/stock-movements-logs
 * Creates a new stock movement log entry
 * Called by the Bin Location Extension via Bearer token auth
 */
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
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    console.error("Error logging stock movement:", error);
    return NextResponse.json(
      { success: false, message: "Failed to log stock movement" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/stock-movements-logs
 * Returns recent stock movement logs
 * Called by the Bin Location Extension via Bearer token auth
 */
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
    return NextResponse.json(
      { success: false, message: "Failed to fetch stock movements" },
      { status: 500 }
    );
  }
}