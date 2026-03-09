import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { UserRole } from "@/lib/types";

const ROLE_HOME: Record<UserRole, string> = {
  admin:    "/admin",
  resident: "/resident",
  guard:    "/security",
};

const PROTECTED_PREFIXES = ["/admin", "/resident", "/security"];
const AUTH_ROUTES = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ── Unauthenticated users trying to access protected routes ──────────────
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (isProtected && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ── Authenticated users trying to access auth routes ─────────────────────
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  if (isAuthRoute && user) {
    const role = user.user_metadata?.role as UserRole | undefined;
    const home = role ? ROLE_HOME[role] : "/resident";
    return NextResponse.redirect(new URL(home, request.url));
  }

  // ── Role-based access control ─────────────────────────────────────────────
  if (user) {
    const role = user.user_metadata?.role as UserRole | undefined;

    if (role === "resident" && pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/resident", request.url));
    }
    if (role === "resident" && pathname.startsWith("/security")) {
      return NextResponse.redirect(new URL("/resident", request.url));
    }
    if (role === "guard" && pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/security", request.url));
    }
    if (role === "guard" && pathname.startsWith("/resident")) {
      return NextResponse.redirect(new URL("/security", request.url));
    }
    if (role === "admin" && pathname.startsWith("/security")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
