"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="container max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8">Login</h1>
      <Button 
        onClick={() => signIn("google")}
        className="w-full"
      >
        Sign in with Google
      </Button>
    </div>
  );
} 