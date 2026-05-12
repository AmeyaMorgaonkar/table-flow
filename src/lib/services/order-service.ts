import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSessionActive } from "@/lib/services/session-service";
import type { Tables } from "@/types/supabase";

type Order = Tables<"orders">;
type OrderItem = Tables<"order_items">;

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface PlaceOrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

/**
 * Place a new order for an active session.
 * Validates session is still active, then creates order + order_items
 * with snapshot prices (prices at time of order, not current menu prices).
 */
export async function placeOrder(
  sessionId: string,
  restaurantId: string,
  items: PlaceOrderItem[]
): Promise<{ order: OrderWithItems | null; error?: string }> {
  // Validate session is active
  const active = await isSessionActive(sessionId);
  if (!active) {
    return {
      order: null,
      error: "Your session has ended. Please ask your waiter to reopen the table.",
    };
  }

  if (!items.length) {
    return { order: null, error: "Cannot place an empty order." };
  }

  const supabase = createAdminClient();

  // Create order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      session_id: sessionId,
      restaurant_id: restaurantId,
      status: "pending",
    })
    .select()
    .single();

  if (orderError || !order) {
    return {
      order: null,
      error: `Failed to create order: ${orderError?.message ?? "Unknown error"}`,
    };
  }

  // Create order items with snapshot prices
  const orderItems = items.map((item) => ({
    order_id: order.id,
    restaurant_id: restaurantId,
    menu_item_id: item.menuItemId,
    name: item.name,
    quantity: item.quantity,
    unit_price: item.unitPrice,
  }));

  const { data: createdItems, error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems)
    .select();

  if (itemsError) {
    // Rollback: delete the order if items failed
    await supabase.from("orders").delete().eq("id", order.id);
    return {
      order: null,
      error: `Failed to create order items: ${itemsError.message}`,
    };
  }

  return {
    order: { ...order, items: createdItems ?? [] },
  };
}

/**
 * Get all orders for a specific session with their items.
 */
export async function getOrdersBySession(
  restaurantId: string,
  sessionId: string
): Promise<OrderWithItems[]> {
  const supabase = createAdminClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false });

  if (!orders || orders.length === 0) return [];

  const orderIds = orders.map((o) => o.id);
  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .in("order_id", orderIds);

  return orders.map((order) => ({
    ...order,
    items: (items ?? []).filter((i) => i.order_id === order.id),
  }));
}

/**
 * Get all active orders for a restaurant (for kitchen dashboard).
 * Active = not yet "served".
 */
export async function getActiveOrdersByRestaurant(
  restaurantId: string
): Promise<(OrderWithItems & { table_label: string })[]> {
  const supabase = createAdminClient();

  // Get orders that aren't served yet
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .in("status", ["pending", "preparing", "ready"])
    .order("created_at", { ascending: true });

  if (!orders || orders.length === 0) return [];

  // Get order items
  const orderIds = orders.map((o) => o.id);
  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .in("order_id", orderIds);

  // Get session → table mapping for table labels
  const sessionIds = [...new Set(orders.map((o) => o.session_id))];
  const { data: sessions } = await supabase
    .from("table_sessions")
    .select("id, table_id")
    .in("id", sessionIds);

  const tableIds = [...new Set((sessions ?? []).map((s) => s.table_id))];
  const { data: tables } = await supabase
    .from("tables")
    .select("id, label")
    .in("id", tableIds);

  // Build lookup maps
  const sessionTableMap = new Map(
    (sessions ?? []).map((s) => [s.id, s.table_id])
  );
  const tableLabelMap = new Map(
    (tables ?? []).map((t) => [t.id, t.label])
  );

  return orders.map((order) => {
    const tableId = sessionTableMap.get(order.session_id);
    const tableLabel = tableId ? tableLabelMap.get(tableId) ?? "Unknown" : "Unknown";
    return {
      ...order,
      items: (items ?? []).filter((i) => i.order_id === order.id),
      table_label: tableLabel,
    };
  });
}

/**
 * Update order status. Waiter/kitchen only.
 * Valid transitions: pending → preparing → ready → served
 */
export async function updateOrderStatus(
  restaurantId: string,
  orderId: string,
  status: string
): Promise<{ success: boolean; error?: string }> {
  const validStatuses = ["pending", "preparing", "ready", "served"];
  if (!validStatuses.includes(status)) {
    return { success: false, error: `Invalid status: ${status}` };
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .eq("restaurant_id", restaurantId);

  if (error) {
    return { success: false, error: `Failed to update: ${error.message}` };
  }

  return { success: true };
}

/**
 * Get itemized bill for a session — all orders, all items, grand total.
 */
export async function getSessionBill(
  restaurantId: string,
  sessionId: string
): Promise<{
  orders: OrderWithItems[];
  grandTotal: number;
}> {
  const orders = await getOrdersBySession(restaurantId, sessionId);

  const grandTotal = orders.reduce(
    (total, order) =>
      total +
      order.items.reduce(
        (orderTotal, item) => orderTotal + item.unit_price * item.quantity,
        0
      ),
    0
  );

  return { orders, grandTotal };
}
