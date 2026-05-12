import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";

/**
 * Next.js middleware — runs on every matched request.
 *
 * Responsibilities:
 * 1. Refresh Supabase auth session (token renewal via cookies)
 * 2. Protect /admin/* routes — redirect to /admin/login if unauthenticated
 *
 * Public routes (no auth required):
 * - /[slug]/* (customer-facing menu browsing)
 * - /admin/login
 * - /api/auth/* (auth endpoints)
 * - Static assets
 */

// Routes that don't require authentication
const PUBLIC_ROUTES = ["/admin/login"];

function isPublicRoute(pathname: string): boolean {
  // Admin login is public
  if (PUBLIC_ROUTES.includes(pathname)) return true;

  // API auth routes are public
  if (pathname.startsWith("/api/auth/")) return true;

  // Session join and status routes are public (customer-facing, no auth)
  if (pathname === "/api/session/join" || pathname === "/api/session/status") return true;

  // Order and waiter-request routes use session cookies, not admin auth
  if (pathname.startsWith("/api/orders") || pathname === "/api/waiter-request") return true;

  // Non-admin routes are public (customer-facing /[slug]/*)
  if (!pathname.startsWith("/admin")) return true;

  return false;
}

export async function middleware(request: NextRequest) {
  // Step 1: Always refresh the Supabase session
  const response = await updateSession(request);

  const { pathname } = request.nextUrl;

  // Step 2: Skip auth check for public routes
  if (isPublicRoute(pathname)) {
    return response;
  }

  // Step 3: For protected /admin/* routes, check authentication
  // Create a Supabase client to check the user
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If no user and trying to access protected admin route, redirect to login
  if (!user) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is authenticated and on /admin/login, redirect to dashboard
  if (pathname === "/admin/login") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
