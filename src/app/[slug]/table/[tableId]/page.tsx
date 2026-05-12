import { getSessionToken } from "@/lib/session-token";
import { isSessionActive } from "@/lib/services/session-service";
import { getRestaurantBySlug, getMenuByRestaurantId } from "@/lib/services/menu-service";
import { notFound } from "next/navigation";
import { SessionProvider } from "@/lib/session-context";
import { CartProvider } from "@/lib/cart-store";
import { TableMenuView } from "@/components/table-menu-view";

/**
 * /[slug]/table/[tableId] — Customer entry point.
 * Renders the menu directly (no redirect, no gate).
 * Checks for valid session cookie and exposes session status.
 * On first load with no session: auto-shows OTP modal after 1s delay.
 */
export default async function TablePage({
  params,
}: {
  params: Promise<{ slug: string; tableId: string }>;
}) {
  const { slug, tableId } = await params;

  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) {
    notFound();
  }

  // Load menu data
  const menu = await getMenuByRestaurantId(restaurant.id);

  // Check for existing session
  let hasSession = false;
  let sessionId: string | null = null;
  const token = await getSessionToken();
  if (token && token.tableId === tableId && token.restaurantId === restaurant.id) {
    // Verify session is still active
    const active = await isSessionActive(token.sessionId);
    if (active) {
      hasSession = true;
      sessionId = token.sessionId;
    }
  }

  return (
    <SessionProvider initialHasSession={hasSession} initialSessionId={sessionId}>
      <CartProvider>
        <TableMenuView
          menu={menu}
          tableId={tableId}
          slug={slug}
          restaurantId={restaurant.id}
          initialHasSession={hasSession}
        />
      </CartProvider>
    </SessionProvider>
  );
}
