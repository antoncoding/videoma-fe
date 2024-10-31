import { withAuth } from "next-auth/middleware"

// This protects all routes under /dashboard and /saved
export default withAuth({
  pages: {
    signIn: "/login",
  },
})

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/saved", "/saved/:path*"]
} 