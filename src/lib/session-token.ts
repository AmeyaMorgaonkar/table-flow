import "server-only";
import { cookies } from "next/headers";

/**
 * Session token cookie name.
 * Stores the customer's active session info for order placement.
 */
const SESSION_COOKIE_NAME = "tf_session";

/**
 * Session token payload — stored in a cookie after successful OTP validation.
 */
export interface SessionTokenPayload {
  sessionId: string;
  tableId: string;
  restaurantId: string;
  issuedAt: number;
}

/**
 * Set the session token cookie after successful OTP validation.
 * Cookie is httpOnly, secure, and SameSite=Lax.
 * Expires in 8 hours (a restaurant shift).
 */
export async function setSessionToken(payload: SessionTokenPayload) {
  const cookieStore = await cookies();
  const value = Buffer.from(JSON.stringify(payload)).toString("base64");

  cookieStore.set(SESSION_COOKIE_NAME, value, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 60 * 60, // 8 hours
  });
}

/**
 * Read the session token from cookies.
 * Returns null if no valid token exists.
 */
export async function getSessionToken(): Promise<SessionTokenPayload | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!cookie?.value) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(cookie.value, "base64").toString("utf-8")
    ) as SessionTokenPayload;

    // Validate required fields
    if (!payload.sessionId || !payload.tableId || !payload.restaurantId) {
      return null;
    }

    // Check expiry (8 hours)
    const eightHoursMs = 8 * 60 * 60 * 1000;
    if (Date.now() - payload.issuedAt > eightHoursMs) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Clear the session token cookie (e.g., when session is closed).
 */
export async function clearSessionToken() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
