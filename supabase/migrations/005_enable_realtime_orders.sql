-- ============================================================
-- TableFlow — Enable Realtime on orders and waiter_requests
-- Required for kitchen dashboard and customer order tracking
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE waiter_requests;
