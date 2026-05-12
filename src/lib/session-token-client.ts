/**
 * Client-side session token utilities.
 * Reads the session token from cookies on the client.
 * This is a client-safe version that doesn't use server-only imports.
 */

export interface SessionTokenPayload {
  sessionId: string;
  tableId: string;
  restaurantId: string;
  issuedAt: number;
}

const SESSION_COOKIE_NAME = "tf_session";

/**
 * Get the session token from cookies on the client.
 * Returns null if no valid token exists.
 */
export function getSessionTokenFromCookie(): SessionTokenPayload | null {
  if (typeof document === "undefined") {
    return null; // Not in browser
  }

  try {
    // Parse cookies from document.cookie
    const cookies = document.cookie.split("; ").reduce(
      (acc, cookie) => {
        const [name, value] = cookie.split("=");
        acc[decodeURIComponent(name)] = decodeURIComponent(value);
        return acc;
      },
      {} as Record<string, string>
    );

    const cookieValue = cookies[SESSION_COOKIE_NAME];
    if (!cookieValue) return null;

    const payload = JSON.parse(atob(cookieValue)) as SessionTokenPayload;

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
