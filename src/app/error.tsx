"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] bg-cream-50 flex flex-col items-center justify-center text-center px-4">
      <h1 className="font-display text-2xl font-bold text-gray-800 mb-2">Something went wrong</h1>
      <p className="text-gray-500 mb-6">
        Sorry, we hit an unexpected error. Your cart is safe — please try again.
        {error.digest && <span className="block text-xs text-gray-400 mt-2">Reference: {error.digest}</span>}
      </p>
      <div className="flex gap-3">
        <button onClick={reset} className="btn-primary px-5 py-2.5 rounded-xl">Try again</button>
        <Link href="/" className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-white">Go home</Link>
      </div>
    </div>
  );
}
