import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/supabase/auth";
import { getTablesWithSessions } from "@/lib/services/session-service";

/**
 * GET /api/admin/tables?restaurantId=xxx
 * Returns all tables for a restaurant with their active session info.
 * Auth required.
 */
export async function GET(request: Request) {
  const user = await getServerUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const restaurantId = searchParams.get("restaurantId");

  if (!restaurantId) {
    return NextResponse.json(
      { error: "restaurantId is required" },
      { status: 400 }
    );
  }

  const tables = await getTablesWithSessions(restaurantId);

  return NextResponse.json({ tables });
}
