import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/supabase/auth";
import { getActiveOrdersByRestaurant } from "@/lib/services/order-service";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/admin/kitchen?restaurantId=xxx
 * Returns active orders and pending waiter requests. Auth required.
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

  try {
    const orders = await getActiveOrdersByRestaurant(restaurantId);

    // Get pending waiter requests
    const supabase = createAdminClient();
    const { data: requests } = await supabase
      .from("waiter_requests")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    // Enrich waiter requests with table labels
    const enrichedRequests = await Promise.all(
      (requests ?? []).map(async (req) => {
        const { data: session } = await supabase
          .from("table_sessions")
          .select("table_id")
          .eq("id", req.session_id)
          .single();

        if (session) {
          const { data: table } = await supabase
            .from("tables")
            .select("label")
            .eq("id", session.table_id)
            .single();

          return { ...req, table_label: table?.label ?? "Unknown" };
        }
        return { ...req, table_label: "Unknown" };
      })
    );

    return NextResponse.json({
      orders,
      waiterRequests: enrichedRequests,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
