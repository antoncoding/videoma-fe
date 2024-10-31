"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="container max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
      <p className="text-red-500 mb-4">
        {error === "Configuration"
          ? "There was a problem with the server configuration."
          : "An error occurred during authentication."}
      </p>
      <Button asChild>
        <Link href="/login">Try Again</Link>
      </Button>
    </div>
  );
} 