import { NextResponse } from "next/server";
import { getActiveSession } from "@/lib/services/session-service";

/**
 * GET /api/session/status?tableId=xxx
 * Returns current session status for a table. Public.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tableId = searchParams.get("tableId");

    if (!tableId) {
      return NextResponse.json(
        { error: "tableId query parameter is required" },
        { status: 400 }
      );
    }

    const session = await getActiveSession(tableId);

    if (!session) {
      return NextResponse.json({ active: false, session: null });
    }

    // Don't expose OTP to the public — only return safe fields
    return NextResponse.json({
      active: true,
      session: {
        id: session.id,
        tableId: session.table_id,
        restaurantId: session.restaurant_id,
        status: session.status,
        openedAt: session.opened_at,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
