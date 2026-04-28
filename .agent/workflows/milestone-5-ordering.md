---
description: Build the core ordering flow — place order, realtime kitchen dashboard, order status updates, call waiter
---

### Step 1 — Read Context
Read PROJECT_CONSTITUTION.md. Orders require an active session. Kitchen sees orders in real time. Status flows: pending → preparing → ready → served.

### Step 2 — Write Order Service
Create `src/lib/services/order-service.ts`:
- `placeOrder(sessionId, restaurantId, items)` — validates session active, creates order + order_items with snapshot prices
- `getOrdersBySession(restaurantId, sessionId)` — returns all orders for this session
- `getOrdersByRestaurant(restaurantId)` — returns all active orders (for kitchen)
- `updateOrderStatus(restaurantId, orderId, status)` — waiter/kitchen only
- `getSessionBill(restaurantId, sessionId)` — returns itemized bill total

### Step 3 — Write Order API Routes
Create `src/app/api/orders/route.ts` — POST (place order, requires session cookie), GET (get session orders)
Create `src/app/api/orders/[orderId]/status/route.ts` — PATCH, waiter auth required, update status

### Step 4 — Build Customer Checkout Flow
In the cart drawer (from milestone-menu):
- "Place Order" button at bottom
- Requires active session cookie — if missing, prompt to get OTP from waiter
- On place: POST to /api/orders, clear cart, show order confirmation
- Order confirmation shows order ID and initial status

### Step 5 — Build Customer Order Status UI
Create `src/app/[slug]/table/[tableId]/orders/page.tsx`:
- List all orders for this session
- Each order shows items, total, and current status
- Status displayed as a clear visual indicator (pending/preparing/ready/served)
- Subscribe to Supabase Realtime on orders table filtered by session_id
- Status updates in real time without page refresh

### Step 6 — Build Waiter Call Feature
Create `src/app/api/waiter-request/route.ts` — POST, requires session cookie, creates waiter_request row

In customer UI: prominent "Call Waiter" button on menu and orders page.
On press: POST to /api/waiter-request, show confirmation "Waiter has been notified."
Debounce to prevent spam — disable button for 60 seconds after press.

### Step 7 — Build Kitchen/Waiter Dashboard
Create `src/app/admin/kitchen/page.tsx`:
- Live feed of all active orders across all tables
- Each order card shows: table label, items, time placed, current status
- Status update buttons: Mark Preparing, Mark Ready, Mark Served
- Waiter request notifications appear as alerts — show table number, "Acknowledge" button
- Subscribe to Realtime on orders and waiter_requests for this restaurant
- Auto-sorted: newest pending orders first

### Step 8 — Build Bill View
Create `src/app/[slug]/table/[tableId]/bill/page.tsx`:
- Itemized list of all orders in this session
- Quantities, unit prices, totals
- Grand total at bottom
- "Pay at counter" message — no online payment in MVP
- Print-friendly layout

### Step 9 — Lint and Test
// turbo
Run `npm run lint`
Write tests: order placed with valid session, order rejected with no session, order rejected with closed session, status update by non-owner rejected.
// turbo
Run `npm test`

### Step 10 — Commit
// turbo
Run `git add -A && git commit -m "feat(ordering): order placement, kitchen dashboard, realtime status, waiter call"`
