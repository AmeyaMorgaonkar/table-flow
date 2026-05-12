import { createAdminClient } from "@/lib/supabase/admin";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — TableFlow Admin",
  description: "Restaurant overview and key metrics.",
};

interface DashboardStats {
  todayRevenue: number;
  monthRevenue: number;
  todayOrders: number;
  activeSessions: number;
  totalTables: number;
  totalMenuItems: number;
  topItems: { name: string; count: number }[];
}

async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createAdminClient();

  // Get restaurant
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .limit(1)
    .single();

  const restaurantId = restaurant?.id;
  if (!restaurantId) {
    return {
      todayRevenue: 0,
      monthRevenue: 0,
      todayOrders: 0,
      activeSessions: 0,
      totalTables: 0,
      totalMenuItems: 0,
      topItems: [],
    };
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Parallel queries for speed
  const [
    todayOrdersRes,
    monthOrdersRes,
    activeSessionsRes,
    tablesRes,
    menuItemsRes,
    topItemsRes,
  ] = await Promise.all([
    // Today's orders
    supabase
      .from("orders")
      .select("id")
      .eq("restaurant_id", restaurantId)
      .gte("created_at", todayStart),

    // Month's orders (for revenue we need items)
    supabase
      .from("orders")
      .select("id")
      .eq("restaurant_id", restaurantId)
      .gte("created_at", monthStart),

    // Active sessions
    supabase
      .from("table_sessions")
      .select("id")
      .eq("restaurant_id", restaurantId)
      .eq("status", "active"),

    // Total tables
    supabase
      .from("tables")
      .select("id")
      .eq("restaurant_id", restaurantId),

    // Menu items
    supabase
      .from("menu_items")
      .select("id")
      .eq("restaurant_id", restaurantId),

    // Top ordered items (from order_items)
    supabase
      .from("order_items")
      .select("name, quantity"),
  ]);

  // Calculate revenue from order items
  const todayOrderIds = (todayOrdersRes.data ?? []).map((o) => o.id);
  const monthOrderIds = (monthOrdersRes.data ?? []).map((o) => o.id);

  let todayRevenue = 0;
  let monthRevenue = 0;

  if (todayOrderIds.length > 0) {
    const { data: todayItems } = await supabase
      .from("order_items")
      .select("unit_price, quantity")
      .in("order_id", todayOrderIds);

    todayRevenue = (todayItems ?? []).reduce(
      (sum, i) => sum + i.unit_price * i.quantity,
      0
    );
  }

  if (monthOrderIds.length > 0) {
    const { data: monthItems } = await supabase
      .from("order_items")
      .select("unit_price, quantity")
      .in("order_id", monthOrderIds);

    monthRevenue = (monthItems ?? []).reduce(
      (sum, i) => sum + i.unit_price * i.quantity,
      0
    );
  }

  // Aggregate top items
  const itemCounts: Record<string, number> = {};
  for (const item of topItemsRes.data ?? []) {
    itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
  }
  const topItems = Object.entries(itemCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    todayRevenue,
    monthRevenue,
    todayOrders: todayOrderIds.length,
    activeSessions: (activeSessionsRes.data ?? []).length,
    totalTables: (tablesRes.data ?? []).length,
    totalMenuItems: (menuItemsRes.data ?? []).length,
    topItems,
  };
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div>
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle">
            Overview of your restaurant today
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <span className="admin-stat-label">Today&apos;s Revenue</span>
          <span className="admin-stat-value">{formatCurrency(stats.todayRevenue)}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">This Month</span>
          <span className="admin-stat-value">{formatCurrency(stats.monthRevenue)}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Orders Today</span>
          <span className="admin-stat-value">{stats.todayOrders}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Active Tables</span>
          <span className="admin-stat-value">
            {stats.activeSessions}
            <span style={{ fontSize: "0.875rem", fontWeight: 400, color: "#A1A1AA", marginLeft: "0.25rem" }}>
              / {stats.totalTables}
            </span>
          </span>
        </div>
      </div>

      {/* Content Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        {/* Quick Info */}
        <div className="admin-card">
          <h2 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1A1A1A", margin: "0 0 1rem", letterSpacing: "-0.01em" }}>
            Restaurant Info
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.8125rem", color: "#71717A" }}>Total Tables</span>
              <span style={{ fontSize: "0.8125rem", fontWeight: 600 }}>{stats.totalTables}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #F4F4F5", paddingTop: "0.75rem" }}>
              <span style={{ fontSize: "0.8125rem", color: "#71717A" }}>Menu Items</span>
              <span style={{ fontSize: "0.8125rem", fontWeight: 600 }}>{stats.totalMenuItems}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #F4F4F5", paddingTop: "0.75rem" }}>
              <span style={{ fontSize: "0.8125rem", color: "#71717A" }}>Active Sessions</span>
              <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: stats.activeSessions > 0 ? "#16A34A" : "#A1A1AA" }}>
                {stats.activeSessions > 0 ? `${stats.activeSessions} active` : "None"}
              </span>
            </div>
          </div>
        </div>

        {/* Top Items */}
        <div className="admin-card">
          <h2 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1A1A1A", margin: "0 0 1rem", letterSpacing: "-0.01em" }}>
            Popular Items
          </h2>
          {stats.topItems.length === 0 ? (
            <p style={{ fontSize: "0.8125rem", color: "#A1A1AA", margin: 0 }}>
              No orders yet — top items will appear here.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {stats.topItems.map((item, i) => (
                <div
                  key={item.name}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: i > 0 ? "1px solid #F4F4F5" : undefined,
                    paddingTop: i > 0 ? "0.75rem" : undefined,
                  }}
                >
                  <span style={{ fontSize: "0.8125rem", color: "#1A1A1A" }}>{item.name}</span>
                  <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "#71717A", background: "#F4F4F5", padding: "0.125rem 0.5rem", borderRadius: "4px" }}>
                    {item.count} ordered
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
