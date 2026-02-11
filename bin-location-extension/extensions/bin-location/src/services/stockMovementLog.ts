interface CorrectionLogInput {
  user?: string | null;
  barcode?: string | null;
  variantTitle?: string | null;
  destinationLocation?: string | null;
  destinationQty?: number | null;
  referenceDoc?: string | null;
  token?: string | null;
}

/**
 * IMPORTANT: This enum must stay in sync with prisma/schema.prisma Activity enum.
 * If you add/remove values here, update the Prisma schema too
 */
enum Activity {
  CORRECTION = "CORRECTION",
  GOODS_RECEIPT = "GOODS_RECEIPT",
  MOVEMENT = "MOVEMENT",
  PICKING = "PICKING",
  GOODS_ISSUE = "GOODS_ISSUE",
  INV_COUNTING = "INV_COUNTING",
  PUTAWAY = "PUTAWAY",
}

interface CorrectionStockMovementPayload {
  activity: Activity.CORRECTION;
  barcode?: string | null;
  variantTitle?: string | null;
  srcLocation?: string | null;
  srcQty?: number | null;
  destinationLocation?: string | null;
  destinationQty?: number | null;
  referenceDoc?: string | null;
  user?: string | null;
}

import { API_STOCK_MOVEMENTS_LOGS } from '../config';

/**
 * Returns the stock movement API endpoint URL.
 * URL is defined in config.ts for easy environment switching
 */
function getEndpoint(): string {
  return API_STOCK_MOVEMENTS_LOGS;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Extracts user ID from a JWT token
 * 
 */
type JwtPayload = Record<string, any>;

function parseJwtPayload(token: string): JwtPayload | null {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

/**
 * Extracts user ID from a JWT token
 * ID is in the format: gid://shopify/StaffMember/1234567890
 */
export function extractUserIdFromToken(token: string): string | null {
  try {
    const payload = parseJwtPayload(token);
    return payload?.sub ?? null;
  } catch {
    console.warn("Failed to parse JWT token for user ID");
    return null;
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Logs a stock correction movement to the database.
 * Called when quantities are updated via the Admin UI extension.
 * 
 * @param input - The correction details to log
 */
export async function logCorrectionMovement(input: CorrectionLogInput): Promise<void> {
  const endpoint = getEndpoint();

  // Resolve user ID from input or token
  const userId = input.user ?? (input.token ? extractUserIdFromToken(input.token) : null);

  const payload: CorrectionStockMovementPayload = {
    activity: Activity.CORRECTION,
    barcode: input.barcode ?? null,
    variantTitle: input.variantTitle ?? null,
    srcLocation: null, // Corrections don't have a source
    srcQty: null,
    destinationLocation: input.destinationLocation ?? null,
    destinationQty: input.destinationQty ?? null,
    referenceDoc: input.referenceDoc ?? null, // No ref doc for Admin UI corrections
    user: userId,
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (input.token) {
    // authentification header
    headers.Authorization = `Bearer ${input.token}`;
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`Stock movement log failed: ${response.status}`, text);
    } else {
      console.log("Stock movement logged successfully");
    }
  } catch (error) {
    console.error("Stock movement logging failed:", error);
  }
}