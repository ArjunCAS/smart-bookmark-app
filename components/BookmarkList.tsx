"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

interface Bookmark {
  id: string;
  url: string;
  title: string;
  created_at: string;
}

export default function BookmarkList() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("bookmarks")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setBookmarks(data);
      setLoading(false);
    };

    fetchBookmarks();
  }, []);

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    await supabase.from("bookmarks").delete().eq("id", id);
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  if (loading) {
    return <p className="text-gray-500">Loading bookmarks...</p>;
  }

  if (bookmarks.length === 0) {
    return <p className="text-gray-500">No bookmarks yet. Add one above!</p>;
  }

  return (
    <ul className="space-y-3">
      {bookmarks.map((bookmark) => (
        <li
          key={bookmark.id}
          className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div>
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 font-medium hover:underline"
            >
              {bookmark.title}
            </a>
            <p className="text-sm text-gray-400 mt-1">{bookmark.url}</p>
          </div>
          <button
            onClick={() => handleDelete(bookmark.id)}
            className="text-red-500 hover:text-red-700 text-sm ml-4"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
