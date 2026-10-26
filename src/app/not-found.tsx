import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream-50 flex flex-col items-center justify-center text-center px-4">
      <p className="text-6xl font-display font-bold text-brand-500 mb-3">404</p>
      <h1 className="font-display text-2xl font-bold text-gray-800 mb-2">Page not found</h1>
      <p className="text-gray-500 mb-6">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <div className="flex gap-3">
        <Link href="/" className="btn-primary px-5 py-2.5 rounded-xl">Go home</Link>
        <Link href="/products" className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-white">
          Browse products
        </Link>
      </div>
    </div>
  );
}
