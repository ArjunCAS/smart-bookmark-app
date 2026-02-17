"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Bookmark {
  id: string;
  url: string;
  title: string;
  created_at: string;
}

interface BookmarkListProps {
  userId?: string;
  refreshKey: number;
}

export default function BookmarkList({ userId, refreshKey }: BookmarkListProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchBookmarks = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setBookmarks(data);
    setLoading(false);
  };

  // Fetch bookmarks on mount and whenever refreshKey changes
  useEffect(() => {
    fetchBookmarks();
  }, [refreshKey]);

  // Real-time subscription for cross-tab sync
  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    const channel = supabase
      .channel("bookmarks-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setBookmarks((prev) => {
            const exists = prev.some((b) => b.id === (payload.new as Bookmark).id);
            if (exists) return prev;
            return [payload.new as Bookmark, ...prev];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setBookmarks((prev) =>
            prev.filter((b) => b.id !== payload.old.id)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const handleDelete = async (id: string) => {
    if (deletingId) return;
    setDeletingId(id);
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    const supabase = createClient();
    await supabase.from("bookmarks").delete().eq("id", id);
    setDeletingId(null);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm text-gray-400">Loading bookmarks...</p>
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-3">📭</div>
        <p className="text-gray-500 font-medium">No bookmarks yet</p>
        <p className="text-sm text-gray-400 mt-1">Add your first bookmark above to get started.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {bookmarks.map((bookmark) => (
        <li
          key={bookmark.id}
          className={`flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4 hover:shadow-sm transition-all ${deletingId === bookmark.id ? "opacity-50 pointer-events-none" : ""}`}
        >
          <div className="min-w-0 flex-1">
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-900 font-medium hover:text-blue-600 transition-colors"
            >
              {bookmark.title}
            </a>
            <p className="text-sm text-gray-400 mt-0.5 truncate">{bookmark.url}</p>
          </div>
          <button
            onClick={() => handleDelete(bookmark.id)}
            className="text-gray-400 hover:text-red-500 transition-colors ml-4 cursor-pointer"
            title="Delete bookmark"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </li>
      ))}
    </ul>
  );
}
