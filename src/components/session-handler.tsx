"use client";

import { useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function SessionHandler({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if ((session as any)?.error === "RefreshAccessTokenError") {
      signIn("google"); // Force re-authentication
    }
  }, [session]);

  return <>{children}</>;
} 