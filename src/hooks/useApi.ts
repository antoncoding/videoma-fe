import { useSession, signIn } from "next-auth/react";

export function useApi() {
  const { data: session } = useSession();

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    if (!session?.accessToken) {
      throw new Error("No access token");
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    if (response.status === 401) {
      // Token expired or invalid
      signIn("google");
      throw new Error("Session expired");
    }

    return response;
  };

  return { fetchWithAuth };
} 