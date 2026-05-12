import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/supabase/auth";
import { updateOrderStatus } from "@/lib/services/order-service";

/**
 * PATCH /api/orders/[orderId]/status
 * Update order status. Waiter/kitchen auth required.
 * Body: { status: "pending" | "preparing" | "ready" | "served", restaurantId: string }
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orderId } = await params;
    const { status, restaurantId } = await request.json();

    if (!status || !restaurantId) {
      return NextResponse.json(
        { error: "status and restaurantId are required" },
        { status: 400 }
      );
    }

    const result = await updateOrderStatus(restaurantId, orderId, status);

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
