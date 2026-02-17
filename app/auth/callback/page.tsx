"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();
  const [debugInfo, setDebugInfo] = useState("Starting...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const url = window.location.href;
        const hasCode = url.includes("code=");
        const hasToken = url.includes("access_token=");

        setDebugInfo(
          `URL has code: ${hasCode}, has access_token: ${hasToken}\nHash: ${window.location.hash.substring(0, 50)}...\nSearch: ${window.location.search.substring(0, 50)}...`
        );

        const supabase = createClient();

        const { data, error } = await supabase.auth.getSession();

        if (error) {
          setDebugInfo((prev) => prev + `\ngetSession error: ${error.message}`);
          return;
        }

        if (data.session) {
          router.push("/dashboard");
          return;
        }

        // Wait a moment for auto-detection to complete
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const { data: retryData } = await supabase.auth.getSession();
        if (retryData.session) {
          router.push("/dashboard");
        } else {
          setDebugInfo((prev) => prev + "\nNo session found after retry");
        }
      } catch (err) {
        setDebugInfo(
          (prev) => prev + `\nCaught error: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center max-w-lg">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 mb-4">Signing you in...</p>
        <pre className="text-xs text-left text-gray-400 bg-gray-100 p-4 rounded whitespace-pre-wrap">
          {debugInfo}
        </pre>
      </div>
    </div>
  );
}
