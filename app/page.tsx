import AuthButton from "@/components/AuthButton";

export default function Home() {
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
