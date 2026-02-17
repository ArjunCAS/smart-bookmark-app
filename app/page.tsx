"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AuthButton from "@/components/AuthButton";

export default function Home() {
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        router.replace("/dashboard");
      } else {
        setChecking(false);
      }
    });
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center px-6">
        <div className="mb-6 text-5xl">🔖</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Smart Bookmark
        </h1>
        <p className="text-lg text-gray-500 mb-10 max-w-md mx-auto">
          Save, organize, and access your favorite links — synced in real time
          across all your devices.
        </p>
        <AuthButton />
      </div>
    </div>
  );
}
