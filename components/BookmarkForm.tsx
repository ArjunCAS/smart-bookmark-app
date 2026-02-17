"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface BookmarkFormProps {
  onBookmarkAdded: () => void;
}

export default function BookmarkForm({ onBookmarkAdded }: BookmarkFormProps) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim() || !title.trim()) return;

    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("bookmarks").insert({
        url: url.trim(),
        title: title.trim(),
        user_id: user.id,
      });

      setUrl("");
      setTitle("");
      onBookmarkAdded();
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Bookmark title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
        <input
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
        >
          {loading ? "Adding..." : "Add"}
        </button>
      </div>
    </form>
  );
}
