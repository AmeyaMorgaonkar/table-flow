# TableFlow — Testing URLs

> **Base URL:** `http://localhost:3000`
> **Start dev server:** `npm run dev`

---

## 🔐 Login Credentials

| Role  | Email | Password |
|-------|-------|----------|
| Admin | _the email you created in Supabase Dashboard → Authentication → Users_ | _the password you set_ |

> Supabase Dashboard: https://supabase.com/dashboard/project/uucrxflobyycdgahywek/auth/users

---

## 🏪 Demo Data

| Entity | ID | Slug/Label |
|--------|----|------------|
| Restaurant | `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11` | `demo-bistro` |
| Table 1 | `b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11` | Table 1 |
| Table 2 | `b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11` | Table 2 |
| Table 3 | `b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11` | Table 3 |

---

## 👨‍💼 Admin / Waiter URLs

| Page | URL | Notes |
|------|-----|-------|
| Login | [/admin/login](http://localhost:3000/admin/login) | Email + password |
| Dashboard | [/admin/dashboard](http://localhost:3000/admin/dashboard) | Redirects to login if not authenticated |
| **Tables** | [/admin/tables](http://localhost:3000/admin/tables) | Open/close sessions, see OTP codes |
| **Menu Items** | [/admin/menu](http://localhost:3000/admin/menu) | List, toggle availability, edit, delete |
| Add Menu Item | [/admin/menu/new](http://localhost:3000/admin/menu/new) | Form with Zod validation |
| Edit Menu Item | `/admin/menu/{itemId}/edit` | Click edit icon on menu list |
| **Categories** | [/admin/menu/categories](http://localhost:3000/admin/menu/categories) | Add, rename, delete, reorder |
| **Kitchen** | [/admin/kitchen](http://localhost:3000/admin/kitchen) | Live order feed, status updates, waiter alerts |

---

## 🍽️ Customer URLs

| Page | URL | Notes |
|------|-----|-------|
| **Table 1 (QR scan entry)** | [/demo-bistro/table/b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11](http://localhost:3000/demo-bistro/table/b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11) | Menu + OTP modal auto-shows after 1s |
| **Table 2** | [/demo-bistro/table/b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11](http://localhost:3000/demo-bistro/table/b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11) | Same flow |
| **Table 3** | [/demo-bistro/table/b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11](http://localhost:3000/demo-bistro/table/b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11) | Same flow |
| OTP Join (Table 1) | [/demo-bistro/table/b1.../join](http://localhost:3000/demo-bistro/table/b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/join) | Standalone OTP entry page |
| Browse Menu (no table) | [/demo-bistro/menu](http://localhost:3000/demo-bistro/menu) | Read-only, no cart or ordering |
| **Orders (Table 1)** | [/demo-bistro/table/b1.../orders](http://localhost:3000/demo-bistro/table/b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/orders) | Realtime order status + call waiter |
| **Bill (Table 1)** | [/demo-bistro/table/b1.../bill](http://localhost:3000/demo-bistro/table/b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/bill) | Itemized bill, print-friendly |

---

## 🧪 Test Flow Cheat Sheet

### Full Ordering Flow
1. **Login** → `/admin/login`
2. **Open a table** → `/admin/tables` → click Table 1 → "Open Table Session" → note the OTP
3. **Customer scans QR** → open `/demo-bistro/table/b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11` in incognito
4. **Enter OTP** → OTP modal auto-appears → "Enter OTP to Order" → type the 4-digit code
5. **Add to cart** → tap "Add" on menu items → open cart → **Place Order**
6. **View orders** → tap "View Orders" → see realtime status updates
7. **Kitchen updates** → in admin `/admin/kitchen` → "Start Preparing" → "Mark Ready" → "Mark Served"
8. **Call waiter** → on orders page → tap "Call Waiter" → alert appears in kitchen dashboard
9. **View bill** → on orders page → tap "Bill" → itemized summary
10. **Close session** → back in admin → `/admin/tables` → click Table 1 → "Close Session"

### Quick Menu Admin Test
1. `/admin/menu/categories` → add a new category (e.g. "Desserts")
2. `/admin/menu/new` → add an item to the new category
3. `/admin/menu` → toggle availability, edit, delete

---

## 🔗 API Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth/login` | Public | Programmatic login |
| POST | `/api/auth/logout` | Public | Sign out |
| POST | `/api/session/open` | Admin | Open table session |
| POST | `/api/session/close` | Admin | Close table session |
| POST | `/api/session/join` | Public | Customer OTP validation |
| GET | `/api/session/status?tableId=xxx` | Public | Check session status |
| GET | `/api/admin/restaurant` | Admin | Get restaurant info |
| GET | `/api/admin/tables?restaurantId=xxx` | Admin | Get tables with sessions |
| POST | `/api/orders` | Session cookie | Place order |
| GET | `/api/orders` | Session cookie | Get session orders |
| PATCH | `/api/orders/{orderId}/status` | Admin | Update order status |
| POST | `/api/waiter-request` | Session cookie | Call waiter |
| GET | `/api/admin/kitchen?restaurantId=xxx` | Admin | Kitchen live data |
| PATCH | `/api/admin/waiter-request` | Admin | Acknowledge waiter request |