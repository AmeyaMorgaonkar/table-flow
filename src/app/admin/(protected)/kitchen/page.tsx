import { requireAuth } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveOrdersByRestaurant } from "@/lib/services/order-service";
import { KitchenView } from "./kitchen-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kitchen — TableFlow Admin",
  description: "Live order feed for kitchen and waiters.",
};

export default async function KitchenPage() {
  await requireAuth();

  const supabase = createAdminClient();
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .limit(1)
    .single();

  if (!restaurant) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#71717A" }}>
        <h2>No Restaurant Found</h2>
        <p>Please set up your restaurant first.</p>
      </div>
    );
  }

  const orders = await getActiveOrdersByRestaurant(restaurant.id);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Kitchen Dashboard</h1>
          <p className="admin-page-subtitle">
            Live orders — updates in real time
          </p>
        </div>
      </div>
      <KitchenView restaurantId={restaurant.id} initialOrders={orders} />
    </div>
  );
}
