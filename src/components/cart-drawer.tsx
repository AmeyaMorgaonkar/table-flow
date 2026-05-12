"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-store";
import { useSession } from "@/lib/session-context";
import { useParams, useRouter } from "next/navigation";
import "./cart-drawer.css";

interface CartDrawerProps {
  currency: string;
}

/**
 * Cart drawer that slides in from the bottom on mobile.
 * Always rendered in the DOM — visibility toggled via state.
 * Includes checkout flow: place order via API, clear cart, show confirmation.
 */
export function CartDrawer({ currency }: CartDrawerProps) {
  const {
    items,
    isOpen,
    totalItems,
    totalPrice,
    updateQuantity,
    removeItem,
    clearCart,
    closeDrawer,
  } = useCart();
  const { hasSession } = useSession();
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const tableId = params.tableId as string;

  const [placing, setPlacing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function formatPrice(price: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  }

  async function handlePlaceOrder() {
    if (!hasSession || items.length === 0) return;

    setPlacing(true);
    setError(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            menuItemId: i.menuItem.id,
            name: i.menuItem.name,
            quantity: i.quantity,
            unitPrice: i.menuItem.price,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to place order.");
      } else {
        setOrderPlaced(data.order.id);
        clearCart();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  function handleViewOrders() {
    closeDrawer();
    setOrderPlaced(null);
    router.push(`/${slug}/table/${tableId}/orders`);
  }

  function handleContinueBrowsing() {
    setOrderPlaced(null);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`cart-backdrop ${isOpen ? "cart-backdrop--visible" : ""}`}
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <div
        className={`cart-drawer ${isOpen ? "cart-drawer--open" : ""}`}
        role="dialog"
        aria-modal={isOpen}
        aria-label="Shopping Cart"
      >
        {/* Header */}
        <div className="cart-header">
          <div className="cart-header-left">
            <h2 className="cart-title">Your Order</h2>
            {totalItems > 0 && (
              <span className="cart-count">{totalItems} item{totalItems !== 1 ? "s" : ""}</span>
            )}
          </div>
          <button
            className="cart-close"
            onClick={closeDrawer}
            aria-label="Close cart"
            id="cart-close-button"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Order Confirmation */}
        {orderPlaced ? (
          <div className="cart-confirmation">
            <div className="cart-confirmation-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h3 className="cart-confirmation-title">Order Placed!</h3>
            <p className="cart-confirmation-text">
              Your order has been sent to the kitchen.
            </p>
            <div className="cart-confirmation-actions">
              <button
                className="cart-checkout-btn"
                onClick={handleViewOrders}
                id="view-orders-button"
              >
                View Orders
              </button>
              <button
                className="cart-secondary-btn"
                onClick={handleContinueBrowsing}
              >
                Continue Browsing
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="cart-body">
              {items.length === 0 ? (
                <div className="cart-empty">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 01-8 0" />
                  </svg>
                  <p>Your cart is empty</p>
                  <span>Add items from the menu to get started</span>
                </div>
              ) : (
                <ul className="cart-items">
                  {items.map(({ menuItem, quantity }) => (
                    <li key={menuItem.id} className="cart-item" id={`cart-item-${menuItem.id}`}>
                      <div className="cart-item-info">
                        <span className="cart-item-name">{menuItem.name}</span>
                        <span className="cart-item-price">
                          {formatPrice(menuItem.price * quantity)}
                        </span>
                      </div>
                      <div className="cart-item-controls">
                        <button
                          className="cart-qty-btn"
                          onClick={() => updateQuantity(menuItem.id, quantity - 1)}
                          aria-label={`Decrease ${menuItem.name} quantity`}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                        </button>
                        <span className="cart-qty">{quantity}</span>
                        <button
                          className="cart-qty-btn"
                          onClick={() => updateQuantity(menuItem.id, quantity + 1)}
                          aria-label={`Increase ${menuItem.name} quantity`}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                        </button>
                        <button
                          className="cart-remove-btn"
                          onClick={() => removeItem(menuItem.id)}
                          aria-label={`Remove ${menuItem.name}`}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="cart-footer">
                <div className="cart-total">
                  <span>Total</span>
                  <span className="cart-total-price">{formatPrice(totalPrice)}</span>
                </div>

                {error && (
                  <div className="cart-error" role="alert">{error}</div>
                )}

                <button
                  className="cart-checkout-btn"
                  id="cart-checkout-button"
                  onClick={handlePlaceOrder}
                  disabled={placing || !hasSession}
                >
                  {placing ? "Placing Order…" : "Place Order"}
                </button>

                {!hasSession && (
                  <p className="cart-footer-note">
                    Enter OTP to place your order
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
