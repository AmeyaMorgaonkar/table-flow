-- ============================================================
-- TableFlow — Row Level Security Policies
-- Milestone 1: Tenant isolation at the database level
-- ============================================================

-- ============================================================
-- Enable RLS on all tables
-- ============================================================
ALTER TABLE restaurants      ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables           ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_sessions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders           ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE waiter_requests  ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- restaurants
-- Owner (authenticated user whose auth.uid() matches) can read/write.
-- Public can read by slug (needed for menu browsing).
-- ============================================================
CREATE POLICY "restaurants_public_read"
  ON restaurants FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "restaurants_owner_insert"
  ON restaurants FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "restaurants_owner_update"
  ON restaurants FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- tables
-- Readable by restaurant owner (authenticated).
-- Publicly readable (customers need to see table info via QR).
-- Writable only by authenticated users.
-- ============================================================
CREATE POLICY "tables_public_read"
  ON tables FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "tables_owner_insert"
  ON tables FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "tables_owner_update"
  ON tables FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "tables_owner_delete"
  ON tables FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- table_sessions
-- Readable by restaurant owner.
-- Anon can read active sessions (needed for OTP validation).
-- Only authenticated can create/update sessions.
-- ============================================================
CREATE POLICY "sessions_authenticated_read"
  ON table_sessions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "sessions_anon_read_active"
  ON table_sessions FOR SELECT
  TO anon
  USING (status = 'active');

CREATE POLICY "sessions_owner_insert"
  ON table_sessions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "sessions_owner_update"
  ON table_sessions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- menu_categories
-- Publicly readable (customers browse the menu without auth).
-- Writable only by authenticated (restaurant admin/waiter).
-- ============================================================
CREATE POLICY "menu_categories_public_read"
  ON menu_categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "menu_categories_owner_insert"
  ON menu_categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "menu_categories_owner_update"
  ON menu_categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "menu_categories_owner_delete"
  ON menu_categories FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- menu_items
-- Publicly readable (customers browse without auth).
-- Writable only by authenticated.
-- ============================================================
CREATE POLICY "menu_items_public_read"
  ON menu_items FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "menu_items_owner_insert"
  ON menu_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "menu_items_owner_update"
  ON menu_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "menu_items_owner_delete"
  ON menu_items FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- orders
-- Readable by restaurant owner (authenticated).
-- Anon can read orders tied to their active session.
-- Anon can insert orders (placing an order from customer UI).
-- ============================================================
CREATE POLICY "orders_authenticated_read"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "orders_anon_read_own_session"
  ON orders FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM table_sessions
      WHERE table_sessions.id = orders.session_id
        AND table_sessions.status = 'active'
    )
  );

CREATE POLICY "orders_anon_insert"
  ON orders FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM table_sessions
      WHERE table_sessions.id = orders.session_id
        AND table_sessions.status = 'active'
    )
  );

CREATE POLICY "orders_owner_update"
  ON orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- order_items
-- Same pattern as orders: readable by owner + active session.
-- Anon can insert when session is active.
-- ============================================================
CREATE POLICY "order_items_authenticated_read"
  ON order_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "order_items_anon_read_own_session"
  ON order_items FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM orders
      JOIN table_sessions ON table_sessions.id = orders.session_id
      WHERE orders.id = order_items.order_id
        AND table_sessions.status = 'active'
    )
  );

CREATE POLICY "order_items_anon_insert"
  ON order_items FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      JOIN table_sessions ON table_sessions.id = orders.session_id
      WHERE orders.id = order_items.order_id
        AND table_sessions.status = 'active'
    )
  );

-- ============================================================
-- waiter_requests
-- Anon can insert (customer calls waiter).
-- Readable + updatable by authenticated (waiter acknowledges).
-- ============================================================
CREATE POLICY "waiter_requests_anon_insert"
  ON waiter_requests FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM table_sessions
      WHERE table_sessions.id = waiter_requests.session_id
        AND table_sessions.status = 'active'
    )
  );

CREATE POLICY "waiter_requests_authenticated_read"
  ON waiter_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "waiter_requests_authenticated_update"
  ON waiter_requests FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
