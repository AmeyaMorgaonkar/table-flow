"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRestaurant } from "@/lib/restaurant-context";
import { useSession } from "@/lib/session-context";
import { useCart } from "@/lib/cart-store";
import { OtpModal } from "@/components/otp-modal";
import { CartDrawer } from "@/components/cart-drawer";
import type { MenuCategoryWithItems } from "@/lib/services/menu-service";
import type { Tables } from "@/types/supabase";
import "./table-menu-view.css";

type MenuItem = Tables<"menu_items">;

interface TableMenuViewProps {
  menu: MenuCategoryWithItems[];
  tableId: string;
  slug: string;
  restaurantId: string;
  initialHasSession: boolean;
}

/**
 * Main customer-facing menu view.
 * Handles category navigation, add-to-cart, OTP gating, and cart drawer.
 */
export function TableMenuView({
  menu,
  tableId,
  initialHasSession,
}: TableMenuViewProps) {
  const { restaurant } = useRestaurant();
  const { hasSession } = useSession();
  const { addItem, totalItems, totalPrice, openDrawer } = useCart();
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  // OTP modal state
  const [showOtp, setShowOtp] = useState(false);
  const [otpInitialState, setOtpInitialState] = useState<"choice" | "otp">("choice");
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Call waiter state
  const [callingWaiter, setCallingWaiter] = useState(false);
  const [waiterCalled, setWaiterCalled] = useState(false);

  // Category navigation
  const [activeCategory, setActiveCategory] = useState<string>(
    menu[0]?.id ?? ""
  );
  const categoryRefs = useRef<Record<string, HTMLElement | null>>({});
  const navRef = useRef<HTMLElement>(null);

  // Prevent hydration mismatch — cart loads from localStorage on client only
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const cartCount = mounted ? totalItems : 0;
  const cartTotal = mounted ? totalPrice : 0;

  // Auto-show OTP modal after 1s delay on first load if no session
  useEffect(() => {
    if (!initialHasSession) {
      const timer = setTimeout(() => {
        setOtpInitialState("choice");
        setPendingAction(null);
        setShowOtp(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [initialHasSession]);

  // Scroll to category
  const scrollToCategory = useCallback((categoryId: string) => {
    setActiveCategory(categoryId);
    const el = categoryRefs.current[categoryId];
    if (el) {
      const offset = 120; // Account for sticky header + nav
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, []);

  // Scroll spy for active category
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id);
            // Scroll nav tab into view
            const navEl = navRef.current;
            const tabEl = navEl?.querySelector(`[data-cat="${entry.target.id}"]`);
            if (tabEl) {
              tabEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
            }
          }
        }
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: 0 }
    );

    for (const id of Object.keys(categoryRefs.current)) {
      const el = categoryRefs.current[id];
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [menu]);

  // Handle add-to-cart with session gating
  const handleAddToCart = useCallback(
    (item: MenuItem) => {
      if (hasSession) {
        addItem(item);
      } else {
        setOtpInitialState("otp");
        setPendingAction(() => () => addItem(item));
        setShowOtp(true);
      }
    },
    [hasSession, addItem]
  );

  // Handle cart open with session gating
  const handleOpenCart = useCallback(() => {
    if (hasSession) {
      openDrawer();
    } else {
      setOtpInitialState("otp");
      setPendingAction(() => () => openDrawer());
      setShowOtp(true);
    }
  }, [hasSession, openDrawer]);

  // Handle OTP button tap
  const handleOtpButton = useCallback(() => {
    setOtpInitialState("choice");
    setPendingAction(null);
    setShowOtp(true);
  }, []);

  // Call waiter handler
  async function handleCallWaiter() {
    setCallingWaiter(true);
    try {
      const res = await fetch("/api/waiter-request", { method: "POST" });
      if (res.ok) {
        setWaiterCalled(true);
        setTimeout(() => setWaiterCalled(false), 60_000);
      }
    } catch {
      // Silently fail
    } finally {
      setCallingWaiter(false);
    }
  }

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
    <div className="menu-page">
      {/* ── Header ── */}
      <header className="menu-header">
        <div className="menu-header-inner">
          <div className="menu-header-left">
            {restaurant.logo_url && (
              <img
                src={restaurant.logo_url}
                alt={`${restaurant.name} logo`}
                className="menu-logo"
              />
            )}
            <div>
              <h1 className="menu-restaurant-name">{restaurant.name}</h1>
              <p className="menu-table-label">Menu</p>
            </div>
          </div>
          <div className="menu-header-right">
            {/* View Orders link — only if session exists */}
            {hasSession && (
              <button
                className="menu-orders-btn"
                onClick={() => router.push(`/${slug}/table/${tableId}/orders`)}
                id="menu-view-orders"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                  <rect x="9" y="3" width="6" height="4" rx="1" />
                </svg>
                Orders
              </button>
            )}
            {/* Cart button with total */}
            <button
              className="menu-cart-btn"
              onClick={handleOpenCart}
              id="menu-cart-button"
              aria-label={`Cart with ${cartCount} items`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {cartCount > 0 && (
                <span className="menu-cart-badge">{cartCount}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Category Navigation ── */}
      {menu.length > 0 && (
        <nav className="menu-category-nav" ref={navRef}>
          <div className="menu-category-tabs">
            {menu.map((category) => (
              <button
                key={category.id}
                data-cat={category.id}
                className={`menu-category-tab ${activeCategory === category.id ? "menu-category-tab--active" : ""}`}
                onClick={() => scrollToCategory(category.id)}
              >
                {category.name}
                <span className="menu-category-count">
                  {category.items.length}
                </span>
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* ── Menu Items ── */}
      <main className="menu-content">
        {menu.length === 0 ? (
          <div className="menu-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
              <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <h2>Menu coming soon</h2>
            <p>This restaurant hasn&apos;t added their menu yet.</p>
          </div>
        ) : (
          menu.map((category) => (
            <section
              key={category.id}
              id={category.id}
              ref={(el) => {
                categoryRefs.current[category.id] = el;
              }}
              className="menu-section"
            >
              <h2 className="menu-section-title">{category.name}</h2>
              <div className="menu-grid">
                {category.items.map((item) => (
                  <div
                    key={item.id}
                    className={`menu-card ${!item.is_available ? "menu-card--unavailable" : ""}`}
                    id={`menu-item-${item.id}`}
                  >
                    {item.image_url && (
                      <div className="menu-card-image">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          loading="lazy"
                        />
                        {!item.is_available && (
                          <span className="menu-card-sold-out">Sold Out</span>
                        )}
                      </div>
                    )}
                    <div className="menu-card-body">
                      <div className="menu-card-info">
                        <h3 className="menu-card-name">{item.name}</h3>
                        {item.description && (
                          <p className="menu-card-desc">{item.description}</p>
                        )}
                      </div>
                      <div className="menu-card-footer">
                        <span className="menu-card-price">
                          {formatPrice(item.price)}
                        </span>
                        {item.is_available && (
                          <button
                            className="menu-add-btn"
                            onClick={() => handleAddToCart(item)}
                            aria-label={`Add ${item.name} to cart`}
                            id={`add-to-cart-${item.id}`}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                              <line x1="12" y1="5" x2="12" y2="19" />
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      {/* ── Enter OTP button (fixed bottom-left) ── */}
      {!hasSession && (
        <button
          className="menu-otp-fab"
          onClick={handleOtpButton}
          id="menu-enter-otp"
          aria-label="Enter OTP to start ordering"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          Enter OTP
        </button>
      )}

      {/* ── Call Waiter FAB ── */}
      {hasSession && (
        <button
          className={`menu-waiter-fab ${waiterCalled ? "menu-waiter-fab--called" : ""} ${cartCount > 0 ? "menu-waiter-fab--above-cart" : ""}`}
          onClick={handleCallWaiter}
          disabled={callingWaiter || waiterCalled}
          id="menu-call-waiter"
        >
          {waiterCalled ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Waiter Notified
            </>
          ) : callingWaiter ? (
            "Calling…"
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              Call Waiter
            </>
          )}
        </button>
      )}

      {/* ── Fixed Bottom Cart Bar ── */}
      {hasSession && cartCount > 0 && (
        <div className="menu-cart-bar" onClick={handleOpenCart}>
          <span className="menu-cart-bar-items">
            {cartCount} item{cartCount !== 1 ? "s" : ""} in cart
          </span>
          <span className="menu-cart-bar-total">
            {formatPrice(cartTotal)} →
          </span>
        </div>
      )}

      {/* ── OTP Modal ── */}
      <OtpModal
        isOpen={showOtp}
        onClose={() => {
          setShowOtp(false);
          setPendingAction(null);
        }}
        initialState={otpInitialState}
        tableId={tableId}
        pendingAction={pendingAction}
      />

      {/* ── Cart Drawer ── */}
      <CartDrawer currency={currency} />
    </div>
  );
}

