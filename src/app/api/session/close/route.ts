import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/supabase/auth";
import { closeSession } from "@/lib/services/session-service";

/**
 * POST /api/session/close
 * Waiter closes an active table session. Auth required.
 * Body: { restaurantId, sessionId }
 */
export async function POST(request: Request) {
  const user = await getServerUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { restaurantId, sessionId } = await request.json();

    if (!restaurantId || !sessionId) {
      return NextResponse.json(
        { error: "restaurantId and sessionId are required" },
        { status: 400 }
      );
    }

    const result = await closeSession(restaurantId, sessionId);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
