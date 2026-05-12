import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Tables } from "@/types/supabase";

type TableSession = Tables<"table_sessions">;

const MAX_OTP_ATTEMPTS = 5;

/**
 * Generate a random 4-digit OTP (0000–9999, zero-padded).
 */
function generateOtp(): string {
  return Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
}

/**
 * Open a new table session. Waiter-initiated.
 * - Generates a random 4-digit OTP
 * - Fails if the table already has an active session (enforced by DB unique index too)
 *
 * Uses admin client to bypass RLS — caller must have already verified auth.
 */
export async function openSession(
  restaurantId: string,
  tableId: string
): Promise<{ session: TableSession; error?: string }> {
  const supabase = createAdminClient();

  // Check for existing active session on this table
  const { data: existing } = await supabase
    .from("table_sessions")
    .select("id")
    .eq("table_id", tableId)
    .eq("restaurant_id", restaurantId)
    .eq("status", "active")
    .maybeSingle();

  if (existing) {
    return {
      session: null as unknown as TableSession,
      error: "This table already has an active session. Close it first.",
    };
  }

  const otp = generateOtp();

  const { data: session, error } = await supabase
    .from("table_sessions")
    .insert({
      restaurant_id: restaurantId,
      table_id: tableId,
      otp,
      status: "active",
    })
    .select()
    .single();

  if (error) {
    return {
      session: null as unknown as TableSession,
      error: `Failed to open session: ${error.message}`,
    };
  }

  return { session };
}

/**
 * Close an active table session. Waiter-initiated.
 * Sets status to 'closed' and records closed_at timestamp.
 *
 * Uses admin client — caller must have verified auth.
 */
export async function closeSession(
  restaurantId: string,
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("table_sessions")
    .update({
      status: "closed",
      closed_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .eq("restaurant_id", restaurantId)
    .eq("status", "active");

  if (error) {
    return { success: false, error: `Failed to close session: ${error.message}` };
  }

  return { success: true };
}

/**
 * Validate a customer-submitted OTP against the active session on a table.
 *
 * Rate limiting: if otp_attempts >= 5, reject regardless of OTP correctness.
 * On wrong OTP: increment otp_attempts.
 * On correct OTP: return the session data.
 *
 * Uses admin client to bypass RLS for attempt tracking.
 */
export async function validateOtp(
  tableId: string,
  otp: string
): Promise<{
  session: TableSession | null;
  error?: string;
  attemptsRemaining?: number;
}> {
  const supabase = createAdminClient();

  // Get the active session for this table
  const { data: session, error } = await supabase
    .from("table_sessions")
    .select("*")
    .eq("table_id", tableId)
    .eq("status", "active")
    .maybeSingle();

  if (error || !session) {
    return {
      session: null,
      error: "No active session for this table. Please ask your waiter.",
    };
  }

  // Check rate limiting
  if (session.otp_attempts >= MAX_OTP_ATTEMPTS) {
    return {
      session: null,
      error: "Too many attempts. Please ask your waiter for assistance.",
      attemptsRemaining: 0,
    };
  }

  // Check OTP match
  if (session.otp !== otp) {
    // Increment attempt counter
    await supabase
      .from("table_sessions")
      .update({ otp_attempts: session.otp_attempts + 1 })
      .eq("id", session.id);

    const remaining = MAX_OTP_ATTEMPTS - (session.otp_attempts + 1);
    return {
      session: null,
      error: `Incorrect code. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`,
      attemptsRemaining: remaining,
    };
  }

  // OTP is correct — return the session
  return { session };
}

/**
 * Get the current active session for a table.
 * Returns null if no active session exists.
 */
export async function getActiveSession(
  tableId: string
): Promise<TableSession | null> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("table_sessions")
    .select("*")
    .eq("table_id", tableId)
    .eq("status", "active")
    .maybeSingle();

  return data ?? null;
}

/**
 * Check if a specific session is still active.
 */
export async function isSessionActive(sessionId: string): Promise<boolean> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("table_sessions")
    .select("status")
    .eq("id", sessionId)
    .single();

  return data?.status === "active";
}

/**
 * Get all tables for a restaurant with their active session info.
 * Used by the waiter's table management UI.
 */
export async function getTablesWithSessions(restaurantId: string) {
  const supabase = createAdminClient();

  const { data: tables, error } = await supabase
    .from("tables")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("label");

  if (error || !tables) return [];

  // Get all sessions for this restaurant so we can expose both the current
  // active session and the most recent historical session per table.
  const { data: sessions } = await supabase
    .from("table_sessions")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("opened_at", { ascending: false });

  // Merge tables with their active sessions and latest session history.
  return tables.map((table) => ({
    ...table,
    activeSession:
      sessions?.find((s) => s.table_id === table.id && s.status === "active") ??
      null,
    lastSession: sessions?.find((s) => s.table_id === table.id) ?? null,
  }));
}
