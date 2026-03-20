import { NextResponse } from 'next/server';
import { requireShopifySession } from '@/lib/auth/require-auth';
import { handleRouteError } from '@/lib/http';
import { userPrefsSchema } from '@/lib/validation/prefs';
import { parseOrThrow } from '@/lib/validation/utils';
import { getUserPrefs, updateUserPrefs } from '@/lib/user-prefs/service';

export async function GET(request: Request) {
  try {
    const session = await requireShopifySession(request, { csrf: false });
    return NextResponse.json(await getUserPrefs(session));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireShopifySession(request);
    const body = (await request.json()) as unknown;
    const parsed = parseOrThrow(userPrefsSchema, body, "Invalid user preferences payload");
    return NextResponse.json(await updateUserPrefs(session, parsed));
  } catch (error) {
    return handleRouteError(error);
  }
}
