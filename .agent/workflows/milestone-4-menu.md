---
description: Build menu browsing UI and admin menu management — public menu display, category navigation, admin CRUD
---

### Step 1 — Read Context
Read PROJECT_CONSTITUTION.md. Menu is publicly readable — no session required. Slug in URL determines which restaurant's menu loads.

### Step 2 — Write Menu Service
Create `src/lib/services/menu-service.ts`:
- `getRestaurantBySlug(slug)` — fetch restaurant config and branding
- `getMenuByRestaurantId(restaurantId)` — fetch all categories and items, grouped
- `createMenuItem(restaurantId, data)` — admin only
- `updateMenuItem(restaurantId, itemId, data)` — admin only
- `deleteMenuItem(restaurantId, itemId)` — admin only
- `toggleItemAvailability(restaurantId, itemId)` — admin only

### Step 3 — Build Slug Entry Point
Create `src/app/[slug]/layout.tsx`:
- Fetch restaurant by slug server-side
- If not found: return 404
- Inject restaurant config (name, logo, brand color) via context
- Apply brand color as CSS variable

Create `src/app/[slug]/table/[tableId]/page.tsx`:
- Redirect to /join if no session cookie, or show menu if session exists
- Pass tableId through for order placement later

### Step 4 — Build Customer Menu UI
Create `src/app/[slug]/table/[tableId]/menu/page.tsx`:
- Category tabs/nav at top (sticky)
- Items displayed in a clean card grid — name, description, price, image
- "Add to cart" button on each item
- Unavailable items shown as greyed out, not orderable
- Cart drawer/sheet slides in from bottom on mobile

Apply branding: restaurant logo in header, brand color on buttons and accents.

### Step 5 — Build Cart State
Create `src/lib/cart-store.ts` — client-side cart using React context or Zustand:
- Add item, remove item, update quantity, clear cart
- Cart persists in memory only (no localStorage)
- Cart shows item count badge on cart button

### Step 6 — Build Admin Menu Management
Create `src/app/admin/menu/page.tsx`:
- List all menu items grouped by category
- Toggle availability inline
- Edit and delete buttons per item

Create `src/app/admin/menu/new/page.tsx` and `src/app/admin/menu/[itemId]/edit/page.tsx`:
- Form: name, description, price, category, image URL, availability toggle
- Validate with Zod before submitting
- On success: redirect back to menu list

### Step 7 — Build Admin Category Management
Create `src/app/admin/menu/categories/page.tsx`:
- List categories with display order
- Add, edit, delete categories
- Drag to reorder (display_order column)

### Step 8 — Lint and Test
// turbo
Run `npm run lint`
Write tests: slug resolves correct restaurant, unknown slug returns 404, menu items are restaurant-scoped.
// turbo
Run `npm test`

### Step 9 — Commit
// turbo
Run `git add -A && git commit -m "feat(menu): public menu browsing and admin menu management"`
