import type { AuthenticatedSession } from '@/lib/auth/session-token';
import { runShopifyGraphql } from '@/lib/shopify/graphql';
import { STAFF_MEMBER_FOR_AUDIT_QUERY } from '@/lib/shopify/queries/staffQuery';

interface StaffMemberLookupResponse {
  staffMember: {
    firstName: string;
    lastName: string;
  } | null;
}

function toStaffMemberGid(userId: string): string | null {
  if (!userId) {
    return null;
  }

  if (userId.startsWith("gid://shopify/StaffMember/")) {
    return userId;
  }

  // Check if the userId is a number
  if (/^\d+$/.test(userId)) {
    return `gid://shopify/StaffMember/${userId}`;
  }

  return null;
}

export async function resolveUserDisplay(session: AuthenticatedSession): Promise<string> {
  const fallback: string = session.userId || "";
  const staffMemberId = toStaffMemberGid(session.userId);

  if (!staffMemberId) {
    return fallback;
  }

  try {
    const data = await runShopifyGraphql<StaffMemberLookupResponse>(
      session,
      STAFF_MEMBER_FOR_AUDIT_QUERY,
      { id: staffMemberId }
    );

    const firstName = data.staffMember?.firstName?.trim() || "";
    const lastName = data.staffMember?.lastName?.trim() || "";
    
    if (!firstName && !lastName) {
      return fallback;
    }

    return `${firstName} ${lastName}`.trim();

  } catch (error) {
    console.error("Failed to resolve staff member display name:", error);
    return fallback;
  }
}