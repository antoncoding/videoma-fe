"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="border-b">
      <div className="container max-w-4xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-montserrat">
              Learn with Clips
            </Link>
            {session && (
              <div className="flex gap-4">
                <Link 
                  href="/dashboard" 
                  className="text-sm hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/saved" 
                  className="text-sm hover:text-primary transition-colors"
                >
                  Saved Sentences
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {status === "loading" ? (
              <div className="animate-pulse bg-muted h-9 w-24 rounded" />
            ) : session ? (
              <>
                <span className="text-sm text-muted-foreground">
                  {session.user?.email}
                </span>
                <Button 
                  variant="outline" 
                  onClick={() => signOut()}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <Button onClick={() => signIn("google")}>Sign in</Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 