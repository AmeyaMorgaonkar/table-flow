-- ============================================================
-- TableFlow — Enable Realtime on table_sessions
-- Required for live updates on the waiter's table grid
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE table_sessions;
