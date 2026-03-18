import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Activity } from "@prisma/client";
import { shopify } from "@/lib/shopify-auth";

// ============================================================================
// API Handlers
// ============================================================================


/*
* Helper function to extract Bearer token from Authorization header
Bearer is the standard way to send access tokens in HTTP requests.
The client includes an Authorization header with the value
*/
function getBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return null;
  }

  // ^Bearer — the chain starts with "Bearer"
  // \s+ — followed by one or more whitespace characters
  // (.+) — captured group for the token itself (one or more of any character)
  // $ — end of the string
  // i — case-insensitive match
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

async function authenticateLogRequest(
  request: NextRequest
): Promise<{ userId: string } | null> {
  const token = getBearerToken(request);
  if (!token) {
    return null;
  }

  try {
    const payload = await shopify.session.decodeSessionToken(token, {
      checkAudience: true,
    });

    const expectedShop = process.env.SHOPIFY_STORE_DOMAIN;
    if (expectedShop) {
      const tokenShop = new URL(payload.dest).hostname;
      if (tokenShop !== expectedShop) {
        return null;
      }
    }

    return { userId: payload.sub };
  } catch {
    return null;
  }
}

/**
 * POST /api/stock-movements
 * Creates a new stock movement log entry
 */
export async function POST(request: NextRequest) {
  try {
    const authenticatedUser = await authenticateLogRequest(request);
    if (!authenticatedUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      activity,
      barcode,
      variantTitle,
      srcLocation,
      srcQty,
      destinationLocation,
      destinationQty,
      referenceDoc,
      user,
    } = body;

    // Validate activity
    if (!activity || !Object.values(Activity).includes(activity)) {
      return NextResponse.json(
        { success: false, message: `Invalid activity. Must be one of: ${Object.values(Activity).join(", ")}` },
        { status: 400 }
      );
    }

    const log = await prisma.stockMovementLog.create({
      data: {
        activity: activity as Activity,
        barcode: barcode ?? null,
        variantTitle: variantTitle ?? null,
        srcLocation: srcLocation ?? null,
        srcQty: typeof srcQty === "number" ? srcQty : null,
        destinationLocation: destinationLocation ?? null,
        destinationQty: typeof destinationQty === "number" ? destinationQty : null,
        referenceDoc: referenceDoc ?? null,
        user: user ?? authenticatedUser.userId,
      },
    });

    return NextResponse.json({
      success: true,
      data: { id: log.id, createdAt: log.createdAt },
    });
  } catch (error) {
    console.error("Error logging stock movement:", error);
    return NextResponse.json(
      { success: false, message: "Failed to log stock movement" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/stock-movements-logs
 * Returns the latest 100 stock movement logs
 */
export async function GET(request: NextRequest) {
  try {
    const logs = await prisma.stockMovementLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // Format dates to EST timezone for display
    const logToEST = logs.map(log => ({
      ...log,
      createdAt: log.createdAt.toLocaleString("en-US", { timeZone: "America/New_York" }),
    }));

    return NextResponse.json({ success: true, data: logToEST });
  } catch (error) {
    console.error("Error fetching stock movements:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch stock movements" },
      { status: 500 }
    );
  }
}
