"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import type { OrderWithItems } from "@/lib/services/order-service";
import "./orders.css";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: "Pending", color: "#f59e0b", icon: "⏳" },
  preparing: { label: "Preparing", color: "#3b82f6", icon: "👨‍🍳" },
  ready: { label: "Ready", color: "#22c55e", icon: "✅" },
  served: { label: "Served", color: "#94a3b8", icon: "🍽️" },
};

export default function OrdersPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const tableId = params.tableId as string;

  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [callingWaiter, setCallingWaiter] = useState(false);
  const [waiterCalled, setWaiterCalled] = useState(false);
  const [waiterError, setWaiterError] = useState<string | null>(null);


  // Single effect: initial fetch + realtime subscription
  useEffect(() => {
    let cancelled = false;

    // Fetch orders for this session
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.orders) {
          setOrders(data.orders);
        } else {
          setError(data.error || "Failed to load orders.");
        }
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load orders.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // Realtime subscription for order status updates
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const channel = supabase
      .channel("customer-orders")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          setOrders((prev) =>
            prev.map((order) =>
              order.id === payload.new.id
                ? { ...order, status: payload.new.status as string }
                : order
            )
          );
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  async function handleCallWaiter() {
    setCallingWaiter(true);
    setWaiterError(null);

    try {
      const res = await fetch("/api/waiter-request", { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        setWaiterCalled(true);
        setTimeout(() => setWaiterCalled(false), 60_000);
      } else {
        setWaiterError(data.error || "Failed to call waiter.");
        setTimeout(() => setWaiterError(null), 5000);
      }
    } catch {
      setWaiterError("Something went wrong.");
    } finally {
      setCallingWaiter(false);
    }
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  }

  function getOrderTotal(order: OrderWithItems) {
    return order.items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
  }

  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-loading">
          <div className="orders-spinner" />
          <span>Loading orders…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-page">
        <div className="orders-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      {/* Header */}
      <header className="orders-header">
        <div className="orders-header-inner">
          <button
            className="orders-back-btn"
            onClick={() => router.push(`/${slug}/table/${tableId}`)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Menu
          </button>
          <h1 className="orders-title">Your Orders</h1>
          <button
            className="orders-bill-btn"
            onClick={() => router.push(`/${slug}/table/${tableId}/bill`)}
          >
            Bill
          </button>
        </div>
      </header>

      {/* Orders */}
      <main className="orders-content">
        {orders.length === 0 ? (
          <div className="orders-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h2>No orders yet</h2>
            <p>Add items from the menu and place an order.</p>
            <button
              className="orders-browse-btn"
              onClick={() => router.push(`/${slug}/table/${tableId}`)}
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const config = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
              return (
                <div key={order.id} className="order-card" id={`order-${order.id}`}>
                  <div className="order-card-header">
                    <div className="order-card-info">
                      <span className="order-card-time">
                        {new Date(order.created_at).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div
                      className="order-status-badge"
                      style={{ background: `${config.color}18`, color: config.color, borderColor: `${config.color}40` }}
                    >
                      <span>{config.icon}</span>
                      {config.label}
                    </div>
                  </div>
                  <ul className="order-card-items">
                    {order.items.map((item) => (
                      <li key={item.id} className="order-card-item">
                        <div className="order-card-item-info">
                          <span className="order-card-item-qty">{item.quantity}×</span>
                          <span className="order-card-item-name">{item.name}</span>
                        </div>
                        <span className="order-card-item-price">
                          {formatPrice(item.unit_price * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="order-card-footer">
                    <span className="order-card-total-label">Total</span>
                    <span className="order-card-total">{formatPrice(getOrderTotal(order))}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Call Waiter FAB */}
      <button
        className={`call-waiter-fab ${waiterCalled ? "call-waiter-fab--called" : ""}`}
        onClick={handleCallWaiter}
        disabled={callingWaiter || waiterCalled}
        id="call-waiter-button"
      >
        {waiterCalled ? (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            Waiter Notified
          </>
        ) : callingWaiter ? (
          "Calling…"
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            Call Waiter
          </>
        )}
      </button>

      {waiterError && (
        <div className="waiter-error-toast">{waiterError}</div>
      )}
    </div>
  );
}
