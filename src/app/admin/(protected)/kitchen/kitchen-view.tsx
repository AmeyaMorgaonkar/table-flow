"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { OrderWithItems } from "@/lib/services/order-service";
import "./kitchen.css";

interface KitchenOrder extends OrderWithItems {
  table_label: string;
}

interface WaiterRequest {
  id: string;
  session_id: string;
  status: string;
  created_at: string;
  table_label?: string;
}

interface KitchenViewProps {
  restaurantId: string;
  initialOrders: KitchenOrder[];
}

const STATUS_FLOW: Record<string, { next: string; label: string; color: string }> = {
  pending: { next: "preparing", label: "Start Preparing", color: "#2563EB" },
  preparing: { next: "ready", label: "Mark Ready", color: "#16A34A" },
  ready: { next: "served", label: "Mark Served", color: "#1A1A1A" },
};

const STATUS_BADGE: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: "Pending", color: "#D97706", icon: "⏳" },
  preparing: { label: "Preparing", color: "#2563EB", icon: "👨‍🍳" },
  ready: { label: "Ready", color: "#16A34A", icon: "✅" },
  served: { label: "Served", color: "#71717A", icon: "🍽️" },
};

export function KitchenView({ restaurantId, initialOrders }: KitchenViewProps) {
  const [orders, setOrders] = useState<KitchenOrder[]>(initialOrders);
  const [waiterRequests, setWaiterRequests] = useState<WaiterRequest[]>([]);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  // Track current time in state so timeAgo doesn't call impure Date.now() during render
  const [now, setNow] = useState(() => Date.now());

  // Refresh "time ago" display every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  // Realtime subscriptions + polling fallback
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    function refetch() {
      fetch(`/api/admin/kitchen?restaurantId=${restaurantId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.orders) setOrders(data.orders);
          if (data.waiterRequests) setWaiterRequests(data.waiterRequests);
        })
        .catch(() => console.error("Failed to fetch kitchen data"));
    }

    // Initial fetch (loads waiter requests not available from SSR)
    refetch();

    // Realtime subscription
    const channel = supabase
      .channel("kitchen-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => refetch()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "waiter_requests" },
        () => refetch()
      )
      .subscribe();

    // Polling fallback — refetch every 15s in case realtime isn't enabled
    const poll = setInterval(refetch, 15_000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(poll);
    };
  }, [restaurantId]);

  async function handleStatusUpdate(orderId: string, newStatus: string) {
    setUpdatingOrder(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, restaurantId }),
      });

      if (res.ok) {
        setOrders((prev) =>
          newStatus === "served"
            ? prev.filter((o) => o.id !== orderId)
            : prev.map((o) =>
                o.id === orderId ? { ...o, status: newStatus } : o
              )
        );
      }
    } catch {
      console.error("Failed to update order status");
    } finally {
      setUpdatingOrder(null);
    }
  }

  async function handleAcknowledgeRequest(requestId: string) {
    try {
      const res = await fetch("/api/admin/waiter-request", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, restaurantId }),
      });

      if (res.ok) {
        setWaiterRequests((prev) => prev.filter((r) => r.id !== requestId));
      }
    } catch {
      console.error("Failed to acknowledge request");
    }
  }

  function timeAgo(dateStr: string) {
    const mins = Math.floor((now - new Date(dateStr).getTime()) / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  }

  // Sort: pending first, then preparing, then ready
  const sortedOrders = [...orders].sort((a, b) => {
    const priority: Record<string, number> = { pending: 0, preparing: 1, ready: 2 };
    return (priority[a.status] ?? 3) - (priority[b.status] ?? 3);
  });

  return (
    <div className="kitchen-layout">
      {/* Waiter Request Alerts */}
      {waiterRequests.length > 0 && (
        <div className="waiter-alerts">
          {waiterRequests.map((req) => (
            <div key={req.id} className="waiter-alert" id={`waiter-req-${req.id}`}>
              <div className="waiter-alert-info">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                <div>
                  <span className="waiter-alert-label">
                    {req.table_label || "Table"} needs assistance
                  </span>
                  <span className="waiter-alert-time">{timeAgo(req.created_at)}</span>
                </div>
              </div>
              <button
                className="waiter-alert-btn"
                onClick={() => handleAcknowledgeRequest(req.id)}
              >
                Acknowledge
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Orders Grid */}
      {sortedOrders.length === 0 ? (
        <div className="kitchen-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h2>No active orders</h2>
          <p>New orders will appear here in real time.</p>
        </div>
      ) : (
        <div className="kitchen-grid">
          {sortedOrders.map((order) => {
            const badge = STATUS_BADGE[order.status] ?? STATUS_BADGE.pending;
            const flow = STATUS_FLOW[order.status];
            const isUpdating = updatingOrder === order.id;
            const total = order.items.reduce(
              (sum, i) => sum + i.unit_price * i.quantity,
              0
            );

            return (
              <div
                key={order.id}
                className={`kitchen-card kitchen-card--${order.status}`}
                id={`kitchen-order-${order.id}`}
              >
                <div className="kitchen-card-header">
                  <div className="kitchen-card-table">
                    <span className="kitchen-card-table-label">
                      {order.table_label}
                    </span>
                    <span className="kitchen-card-time">
                      {timeAgo(order.created_at)}
                    </span>
                  </div>
                  <span
                    className="kitchen-status-badge"
                    style={{
                      background: `${badge.color}18`,
                      color: badge.color,
                      borderColor: `${badge.color}40`,
                    }}
                  >
                    {badge.icon} {badge.label}
                  </span>
                </div>

                <ul className="kitchen-card-items">
                  {order.items.map((item) => (
                    <li key={item.id} className="kitchen-card-item">
                      <span className="kitchen-item-qty">{item.quantity}×</span>
                      <span className="kitchen-item-name">{item.name}</span>
                    </li>
                  ))}
                </ul>

                <div className="kitchen-card-footer">
                  <span className="kitchen-card-total">{formatPrice(total)}</span>
                  {flow && (
                    <button
                      className="kitchen-action-btn"
                      style={{ background: flow.color }}
                      onClick={() => handleStatusUpdate(order.id, flow.next)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? "Updating…" : flow.label}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
