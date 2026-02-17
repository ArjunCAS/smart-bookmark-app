"use client";

export default function DebugPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT SET";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "NOT SET";

  return (
    <div className="p-8 font-mono text-sm">
      <h1 className="text-xl font-bold mb-4">Debug Info</h1>
      <p>
        <strong>SUPABASE_URL:</strong> {url}
      </p>
      <p>
        <strong>ANON_KEY length:</strong> {key.length}
      </p>
      <p>
        <strong>ANON_KEY first 20 chars:</strong> {key.substring(0, 20)}...
      </p>
      <p>
        <strong>ANON_KEY has whitespace:</strong>{" "}
        {key !== key.trim() ? "YES - PROBLEM!" : "No"}
      </p>
      <p>
        <strong>URL has whitespace:</strong>{" "}
        {url !== url.trim() ? "YES - PROBLEM!" : "No"}
      </p>
    </div>
  );
}
