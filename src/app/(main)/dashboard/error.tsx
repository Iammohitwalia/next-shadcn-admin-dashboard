"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // If 431 error, redirect to clear cookies
    if (error.message.includes("431") || error.digest?.includes("431")) {
      window.location.href = "/clear-cookies";
    }
  }, [error]);

  // If 431 error, show clear cookies message
  if (error.message.includes("431") || error.digest?.includes("431")) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-semibold">Request Headers Too Large</h1>
          <p className="text-muted-foreground mb-4">
            Your browser cookies are too large. Please clear them to continue.
          </p>
          <Link
            href="/clear-cookies"
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium"
          >
            Clear Cookies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-semibold">Something went wrong!</h1>
        <button
          onClick={reset}
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

