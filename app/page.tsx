import AuthButton from "@/components/AuthButton";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Smart Bookmark App</h1>
        <p className="text-gray-600 mb-8">
          Save and manage your bookmarks in one place.
        </p>
        <AuthButton />
      </div>
    </div>
  );
}
