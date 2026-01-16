export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center px-6">
        <h1 className="text-6xl font-bold text-[#374151] mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-[#374151] mb-4">Page Not Found</h2>
        <p className="text-[#9CA3AF] mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a
          href="/"
          className="inline-block bg-[#3B82F6] text-white px-6 py-3 rounded-lg hover:bg-[#2563EB] transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
