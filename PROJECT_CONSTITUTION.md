# TableFlow — Project Constitution

## What We're Building
A white-label QR-based restaurant ordering SaaS. Any restaurant onboards, configures their menu, and deploys a dine-in ordering experience at `tableflow.app/[slug]`. No app download required for customers.

## Core User Flows
1. **Customer** — scans QR → browses menu freely → waiter gives OTP when seated → enters OTP → orders, calls waiter, views bill
2. **Waiter** — logs in → opens table → generates OTP → monitors orders → closes table session
3. **Restaurant Admin** — onboards → configures menu, tables, branding → manages staff

## Stack
- **Framework**: Next.js 14 (App Router, TypeScript)
- **Database + Auth + Realtime**: Supabase
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (frontend + API routes)
- **QR**: `qrcode` npm package (static, per table)

## White-label Architecture
- Every restaurant has a `slug` → routes are `/[slug]/table/[table-id]`
- Every DB row has `restaurant_id` — all queries scoped by it
- Supabase RLS enforces tenant isolation at DB level
- Per-tenant branding (logo, colors, name) fetched on slug load

## Security Model
- **Session OTP**: Waiter generates 4-digit code when seating customers
- **OTP gate**: Required only to place orders, not to view menu
- **Rate limiting**: Max 5 OTP attempts per IP per session
- **RLS**: Supabase Row Level Security on all tables
- **No customer accounts**: Anonymous ordering within sessions

## Multi-tenancy Rules (NEVER break these)
- ALWAYS filter queries by `restaurant_id`
- NEVER expose one tenant's data to another
- ALWAYS validate `restaurant_id` matches session in API routes
- RLS is the last line of defense — API must validate first

## Payment Scope (MVP)
- Bill summary shown in app
- Physical payment at counter only
- Online payments architected to plug in later (Stripe-ready schema)

## Out of Scope (MVP)
- Landing/marketing page
- Online payments
- SMS/email notifications
- Customer accounts
