import { notFound } from "next/navigation";
import { getSessionToken } from "@/lib/session-token";
import { isSessionActive } from "@/lib/services/session-service";
import { getRestaurantBySlug } from "@/lib/services/menu-service";
import { getSessionBill } from "@/lib/services/order-service";
import type { Metadata } from "next";
import "./bill.css";

export const metadata: Metadata = {
  title: "Bill — TableFlow",
  description: "View your itemized bill.",
};

export default async function BillPage({
  params,
}: {
  params: Promise<{ slug: string; tableId: string }>;
}) {
  const { slug, tableId } = await params;

  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) notFound();

  // Verify session
  const token = await getSessionToken();
  if (
    !token ||
    token.tableId !== tableId ||
    token.restaurantId !== restaurant.id
  ) {
    return (
      <div className="bill-page">
        <div className="bill-error">
          <h2>No Active Session</h2>
          <p>Please scan the QR code and enter your OTP to view your bill.</p>
        </div>
      </div>
    );
  }

  const active = await isSessionActive(token.sessionId);
  const { orders, grandTotal } = await getSessionBill(
    restaurant.id,
    token.sessionId
  );

  const brandColor = restaurant.brand_color || "#6366f1";
  const currency = restaurant.currency || "INR";

  function formatPrice(price: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  }

  return (
    <div className="bill-page" style={{ "--brand-color": brandColor } as React.CSSProperties}>
      {/* Header */}
      <header className="bill-header">
        <div className="bill-header-inner">
          <div className="bill-restaurant">
            {restaurant.logo_url && (
              <img src={restaurant.logo_url} alt="" className="bill-logo" />
            )}
            <div>
              <h1 className="bill-restaurant-name">{restaurant.name}</h1>
              <p className="bill-subtitle">Bill Summary</p>
            </div>
          </div>
          {!active && (
            <span className="bill-session-badge">Session Closed</span>
          )}
        </div>
      </header>

      {/* Bill Content */}
      <main className="bill-content">
        {orders.length === 0 ? (
          <div className="bill-empty">
            <h2>No orders placed</h2>
            <p>You haven&apos;t placed any orders in this session.</p>
          </div>
        ) : (
          <>
            {orders.map((order, idx) => (
              <section key={order.id} className="bill-order">
                <div className="bill-order-header">
                  <span className="bill-order-label">
                    Order {orders.length - idx}
                  </span>
                  <span className="bill-order-time">
                    {new Date(order.created_at).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <table className="bill-table">
                  <thead>
                    <tr>
                      <th className="bill-th-item">Item</th>
                      <th className="bill-th-qty">Qty</th>
                      <th className="bill-th-price">Price</th>
                      <th className="bill-th-total">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="bill-td-item">{item.name}</td>
                        <td className="bill-td-qty">{item.quantity}</td>
                        <td className="bill-td-price">
                          {formatPrice(item.unit_price)}
                        </td>
                        <td className="bill-td-total">
                          {formatPrice(item.unit_price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="bill-order-subtotal">
                  <span>Subtotal</span>
                  <span>
                    {formatPrice(
                      order.items.reduce(
                        (sum, i) => sum + i.unit_price * i.quantity,
                        0
                      )
                    )}
                  </span>
                </div>
              </section>
            ))}

            {/* Grand Total */}
            <div className="bill-grand-total">
              <span className="bill-grand-total-label">Grand Total</span>
              <span className="bill-grand-total-amount">
                {formatPrice(grandTotal)}
              </span>
            </div>

            {/* Pay at counter */}
            <div className="bill-pay-notice">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <path d="M2 10h20" />
              </svg>
              <p>Please pay at the counter</p>
              <span>Thank you for dining with us!</span>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
