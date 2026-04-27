import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Phase 7B-2: extended to accept `extraRequestHeaders`, which are merged on
 * top of `request.headers` and forwarded to the downstream renderer via
 * `NextResponse.next({ request: { headers: ... } })`. The CSP middleware
 * uses this to forward `x-nonce` and the per-request CSP value so Next.js
 * App Router auto-applies the nonce to streaming hydration scripts.
 *
 * Compatible with the Phase 2 / 3b call site (no extra headers passed).
 */
export async function updateSession(
  request: NextRequest,
  extraRequestHeaders?: Headers,
) {
  // Build the headers Next.js sees on the request. We rebuild this each
  // time we construct a NextResponse.next so cookie mutations performed by
  // Supabase's setAll callback (which mutate request.headers in place via
  // request.cookies.set) are reflected in the forwarded headers.
  const buildForwardedHeaders = (): Headers => {
    const h = new Headers(request.headers);
    if (extraRequestHeaders) {
      extraRequestHeaders.forEach((value, key) => h.set(key, value));
    }
    return h;
  };

  let supabaseResponse = NextResponse.next({
    request: { headers: buildForwardedHeaders() },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request: { headers: buildForwardedHeaders() },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the auth token - important to call getUser()
  await supabase.auth.getUser();

  return supabaseResponse;
}
