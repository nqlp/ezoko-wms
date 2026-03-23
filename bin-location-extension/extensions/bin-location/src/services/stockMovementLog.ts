import { Activity, CorrectionLogInput, StockMovementLogInput} from "@shared/types/index";
import { APP_URL } from "src/config";

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

function getEndpoint(): string {
  return `${APP_URL}/api/stock-movement-logs`;
}

/**
 * Logs a stock correction movement to the database.
 * Called when quantities are updated via the Admin UI extension.
 * 
 * @param input - The correction details to log
 */
export interface LogResult {
  success: boolean;
  error?: string;
}

export async function logCorrectionActivity(input: CorrectionLogInput): Promise<LogResult> {
  const endpoint = getEndpoint();

  // Resolve user ID from input or token
  const userId = input.user ?? (input.token ? extractUserIdFromToken(input.token) : null);

  const payload: StockMovementLogInput = {
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
      const errorMsg = `Log failed (${response.status}): ${text}`;
      console.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Network error";
    console.error("Stock movement logging failed:", errorMsg);
    return { success: false, error: errorMsg };
  }
}