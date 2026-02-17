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
        const accessToken = params.get("access_token")?.replace(/[\r\n\s]/g, "");
        const refreshToken = params.get("refresh_token")?.replace(/[\r\n\s]/g, "");

        if (!accessToken || !refreshToken) {
          setDebugInfo("No tokens found in URL hash");
          return;
        }

        const cleanKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.replace(/[\r\n\s]/g, "");

        setDebugInfo(`Testing with cleaned values...\nKey length: ${cleanKey.length}\nToken length: ${accessToken.length}`);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/[\r\n\s]/g, "")}/auth/v1/user`,
          {
            headers: {
              apikey: cleanKey,
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        setDebugInfo((prev) => prev + `\nFetch status: ${res.status}`);

        if (res.ok) {
          const supabase = createClient();
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (!error) {
            router.push("/dashboard");
          } else {
            setDebugInfo((prev) => prev + `\nsetSession error: ${error.message}`);
          }
        } else {
          const body = await res.text();
          setDebugInfo((prev) => prev + `\nResponse: ${body}`);
        }
      } catch (err) {
        setDebugInfo(
          (prev) => prev + `\nError: ${err instanceof Error ? err.message : String(err)}`
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
