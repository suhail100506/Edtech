"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-4 shadow-sm">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-text tracking-tight">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-md text-sm text-text-muted leading-relaxed">
        An unexpected error occurred while rendering this view. Your session state remains safe.
      </p>
      {error.message && (
        <div className="mt-4 max-w-lg rounded-xl border border-rose-200 bg-rose-50/60 p-3 text-xs text-rose-800 font-mono text-left overflow-x-auto">
          {error.message}
        </div>
      )}
      <div className="mt-6 flex items-center gap-3">
        <Button onClick={() => reset()} className="bg-primary hover:bg-primary-hover text-white">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
        <Link href="/dashboard">
          <Button variant="outline">
            <Home className="h-4 w-4 mr-2" />
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
