import { NextResponse } from "next/server";
import { getSessionToken } from "@/lib/session-token";
import { isSessionActive } from "@/lib/services/session-service";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/waiter-request — Customer calls the waiter.
 * Requires active session cookie.
 */
export async function POST() {
  try {
    const token = await getSessionToken();
    if (!token) {
      return NextResponse.json(
        { error: "No active session." },
        { status: 401 }
      );
    }

    const active = await isSessionActive(token.sessionId);
    if (!active) {
      return NextResponse.json(
        { error: "Session has ended." },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    // Check for recent request (debounce: 60 seconds)
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
    const { data: recent } = await supabase
      .from("waiter_requests")
      .select("id")
      .eq("session_id", token.sessionId)
      .eq("status", "pending")
      .gte("created_at", oneMinuteAgo)
      .limit(1)
      .maybeSingle();

    if (recent) {
      return NextResponse.json(
        { error: "A waiter has already been notified. Please wait." },
        { status: 429 }
      );
    }

    const { error } = await supabase.from("waiter_requests").insert({
      session_id: token.sessionId,
      restaurant_id: token.restaurantId,
      status: "pending",
    });

    if (error) {
      return NextResponse.json(
        { error: "Failed to call waiter." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
