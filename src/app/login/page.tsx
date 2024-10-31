"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { FaGoogle } from "react-icons/fa";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  return (
    <div className="container max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8 font-inter">Login</h1>
      <p className="text-sm text-muted-foreground mb-8 font-montserrat">
        Sign in with your Google account to continue.
      </p>

      <Button 
        size='lg'
        onClick={() => signIn("google", { callbackUrl })}
        className="w-full"
      >
        Sign in with Google
        <FaGoogle className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
} 