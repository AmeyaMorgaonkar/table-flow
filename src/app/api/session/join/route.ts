import { NextResponse } from "next/server";
import { validateOtp } from "@/lib/services/session-service";
import { setSessionToken } from "@/lib/session-token";

/**
 * POST /api/session/join
 * Customer submits OTP to join an active table session. Public (no auth).
 * Body: { tableId, otp }
 *
 * On success: sets a session cookie and returns session info.
 * On failure: returns error with remaining attempts.
 */
export async function POST(request: Request) {
  try {
    const { tableId, otp } = await request.json();

    if (!tableId || !otp) {
      return NextResponse.json(
        { error: "tableId and otp are required" },
        { status: 400 }
      );
    }

    // Validate OTP length
    if (typeof otp !== "string" || otp.length !== 4) {
      return NextResponse.json(
        { error: "OTP must be exactly 4 digits" },
        { status: 400 }
      );
    }

    const result = await validateOtp(tableId, otp);

    if (result.error || !result.session) {
      return NextResponse.json(
        {
          error: result.error,
          attemptsRemaining: result.attemptsRemaining,
        },
        { status: 401 }
      );
    }

    // Set session token cookie for the customer
    await setSessionToken({
      sessionId: result.session.id,
      tableId: result.session.table_id,
      restaurantId: result.session.restaurant_id,
      issuedAt: Date.now(),
    });

    return NextResponse.json({
      success: true,
      session: {
        id: result.session.id,
        restaurantId: result.session.restaurant_id,
        tableId: result.session.table_id,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
