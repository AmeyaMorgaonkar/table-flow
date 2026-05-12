import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * PATCH /api/admin/waiter-request
 * Acknowledge a waiter request. Auth required.
 * Body: { requestId, restaurantId }
 */
export async function PATCH(request: Request) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { requestId, restaurantId } = await request.json();

    if (!requestId || !restaurantId) {
      return NextResponse.json(
        { error: "requestId and restaurantId are required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("waiter_requests")
      .update({ status: "acknowledged" })
      .eq("id", requestId)
      .eq("restaurant_id", restaurantId);

    if (error) {
      return NextResponse.json(
        { error: "Failed to acknowledge request" },
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
