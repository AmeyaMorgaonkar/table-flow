import { NextResponse } from "next/server";
import { getSessionToken } from "@/lib/session-token";
import { isSessionActive } from "@/lib/services/session-service";
import {
  placeOrder,
  getOrdersBySession,
  type PlaceOrderItem,
} from "@/lib/services/order-service";

/**
 * POST /api/orders — Place a new order. Requires session cookie.
 * Body: { items: [{ menuItemId, name, quantity, unitPrice }] }
 */
export async function POST(request: Request) {
  try {
    const token = await getSessionToken();
    if (!token) {
      return NextResponse.json(
        { error: "No active session. Please enter the table OTP first." },
        { status: 401 }
      );
    }

    const { items } = (await request.json()) as { items: PlaceOrderItem[] };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Order must contain at least one item." },
        { status: 400 }
      );
    }

    const result = await placeOrder(token.sessionId, token.restaurantId, items);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ order: result.order });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orders — Get all orders for the current session.
 * Requires session cookie.
 */
export async function GET() {
  try {
    const token = await getSessionToken();
    if (!token) {
      return NextResponse.json(
        { error: "No active session." },
        { status: 401 }
      );
    }

    // Verify session is still active
    const active = await isSessionActive(token.sessionId);
    if (!active) {
      return NextResponse.json(
        { error: "Session has ended." },
        { status: 401 }
      );
    }

    const orders = await getOrdersBySession(
      token.restaurantId,
      token.sessionId
    );

    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
