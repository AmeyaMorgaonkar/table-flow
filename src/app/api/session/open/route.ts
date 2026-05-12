import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/supabase/auth";
import { openSession } from "@/lib/services/session-service";

/**
 * POST /api/session/open
 * Waiter opens a new table session. Auth required.
 * Body: { restaurantId, tableId }
 */
export async function POST(request: Request) {
  const user = await getServerUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { restaurantId, tableId } = await request.json();

    if (!restaurantId || !tableId) {
      return NextResponse.json(
        { error: "restaurantId and tableId are required" },
        { status: 400 }
      );
    }

    const result = await openSession(restaurantId, tableId);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    return NextResponse.json({ session: result.session });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
