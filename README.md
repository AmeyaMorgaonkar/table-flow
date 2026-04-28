# TableFlow

TableFlow is a white-label QR-based restaurant ordering SaaS for dine-in service.

Each restaurant gets its own branded experience, accessed through a unique slug and table route. Customers scan a QR code, browse the menu without signing in, enter a waiter-issued OTP when seated, and then place orders, call a waiter, and view the bill inside the same session.

## What the product does

- Delivers a restaurant-specific ordering experience instead of a shared public brand
- Keeps customer access anonymous while still controlling order placement with session OTPs
- Lets waiters open table sessions, generate OTPs, and monitor active orders
- Gives restaurant admins control over menus, tables, staff, and branding
- Enforces tenant isolation so every restaurant only sees its own data

## Core flows

1. Customer scans a QR code and opens the menu
2. Waiter seats the guest and shares a 4-digit OTP
3. Customer enters the OTP to unlock ordering
4. Customer places orders, calls staff, and checks the bill
5. Waiter tracks sessions and closes tables when done

## White-label model

- Every restaurant has a unique slug
- Routes are scoped per restaurant and per table
- Branding such as name, logo, and colors is loaded per tenant
- All data is scoped by restaurant ID
- Row-level security is used as the final isolation layer

## Product scope

### Included in the MVP

- QR-based dine-in ordering
- OTP-gated table sessions
- Menu browsing and ordering
- Waiter session management
- Restaurant admin controls for branding, tables, and menus
- Bill summary

### Not included in the MVP

- Landing page or marketing site
- Online payments through the bill page
- SMS or email notifications
- Customer accounts

## Stack

- Next.js
- TypeScript
- Supabase
- Tailwind CSS
- Vercel