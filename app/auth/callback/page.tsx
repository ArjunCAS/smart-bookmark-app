"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();
  const [debugInfo, setDebugInfo] = useState("Parsing tokens...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (!accessToken || !refreshToken) {
          setDebugInfo("No tokens found in URL hash");
          return;
        }

        setDebugInfo(
          `Token length: ${accessToken.length}\n` +
          `Token first 30: ${accessToken.substring(0, 30)}\n` +
          `Token last 10: ${accessToken.substring(accessToken.length - 10)}\n` +
          `Has invalid chars: ${/[^\w\-._~+/=]/.test(accessToken)}\n` +
          `Refresh token length: ${refreshToken.length}\n\n` +
          `Testing raw fetch...`
        );

        // Test 1: raw fetch with just apikey
        try {
          const res1 = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`,
            {
              headers: {
                apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          setDebugInfo((prev) => prev + `\nRaw fetch status: ${res1.status}`);

          if (res1.ok) {
            // Token works! Now set session
            const supabase = createClient();
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) {
              setDebugInfo((prev) => prev + `\nsetSession error: ${error.message}`);
            } else {
              setDebugInfo((prev) => prev + `\nSession set! Redirecting...`);
              router.push("/dashboard");
            }
          } else {
            const body = await res1.text();
            setDebugInfo((prev) => prev + `\nRaw fetch body: ${body}`);
          }
        } catch (fetchErr) {
          setDebugInfo(
            (prev) => prev + `\nRaw fetch error: ${fetchErr instanceof Error ? fetchErr.message : String(fetchErr)}`
          );
        }
      } catch (err) {
        setDebugInfo(
          (prev) => prev + `\nOuter error: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center max-w-2xl">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 mb-4">Signing you in...</p>
        <pre className="text-xs text-left text-gray-400 bg-gray-100 p-4 rounded whitespace-pre-wrap break-all">
          {debugInfo}
        </pre>
      </div>
    </div>
  );
}
