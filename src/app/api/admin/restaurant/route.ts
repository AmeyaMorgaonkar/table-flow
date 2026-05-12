import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/admin/restaurant
 * Returns the first restaurant the authenticated user has access to.
 * For MVP: assumes one restaurant per user.
 */
export async function GET() {
  try {
    // Check auth using the server client (cookie-based)
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("[/api/admin/restaurant] Auth error:", authError.message);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch restaurant using admin client (bypasses RLS)
    const adminClient = createAdminClient();
    const { data: restaurant, error: dbError } = await adminClient
      .from("restaurants")
      .select("id, name, slug")
      .limit(1)
      .maybeSingle();

    if (dbError) {
      console.error("[/api/admin/restaurant] DB error:", dbError.message);
      return NextResponse.json(
        { error: "Failed to fetch restaurant" },
        { status: 500 }
      );
    }

    if (!restaurant) {
      console.log("[/api/admin/restaurant] No restaurant found in DB");
      return NextResponse.json({ restaurantId: null });
    }

    return NextResponse.json({
      restaurantId: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
    });
  } catch (err) {
    console.error("[/api/admin/restaurant] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
