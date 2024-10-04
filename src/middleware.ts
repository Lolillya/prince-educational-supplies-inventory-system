import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  // Get the token from the request using the secret key
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET, // Ensure this is in your .env file
  });

  const { pathname } = req.nextUrl;

  // If the user is not logged in
  if (!token) {
    console.log("Token: null");
    console.log("Is Logged In: false");

    // Redirect unauthenticated users to login
    if (!pathname.startsWith("/auth/login")) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  } else {
    console.log("Token:", token);
    console.log("Is Logged In: true");
    console.log("Role:", token.role); // Token should include role

    // Get the user's role from the token
    const role = token.role;

    // Restrict access to /admin routes to ADMIN users only
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    // Restrict access to /employee routes to EMPLOYEE users only
    if (pathname.startsWith("/employee") && role !== "EMPLOYEE") {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    // Prevent logged-in users from accessing the login page
    if (pathname.startsWith("/auth/login")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Continue to the requested page if no redirection is needed
  return NextResponse.next();
}

// Define the paths that the middleware will run on
export const config = {
  matcher: [
    "/admin/:path*",
    "/employee/:path*",
    "/auth/login",
    "/dashboard/:path*",
  ],
};
