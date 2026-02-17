import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  // Build origin from headers (more reliable on Vercel than request.url)
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  const host = forwardedHost ?? request.headers.get("host") ?? "localhost:3000";
  const origin = `${forwardedProto}://${host}`;

  if (!code) {
    // No code parameter — Supabase may still be using implicit flow
    const url = new URL(request.url);
    return NextResponse.redirect(
      `${origin}/?error=${encodeURIComponent("No code in callback. Check Supabase redirect URLs. Got params: " + url.searchParams.toString())}`
    );
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.replace(/\s+/g, ""),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/?error=${encodeURIComponent(error.message)}`
    );
  }

  return NextResponse.redirect(`${origin}${next}`);
}
