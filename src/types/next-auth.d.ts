import "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    error?: string;
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    error?: string;
    exp?: number;
  }
} 