"use client";

export default function AuthError({ message }: { message: string }) {
  return (
    <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 max-w-md mx-auto text-left">
      <p className="font-medium">Sign-in failed</p>
      <p className="mt-1 break-all">{message}</p>
    </div>
  );
}
