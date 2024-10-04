import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  // Get the token from the request using the secret key
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });
  console.log("Fetched Token: ", token); // Debugging log

  const { pathname } = req.nextUrl;

  // If the user is not logged in
  if (!token) {
    console.log("Token: null - User is not logged in.");

    // Redirect unauthenticated users to login
    if (!pathname.startsWith("/auth/login")) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  } else {
    console.log("Token:", token);
    console.log("User is logged in:", token.username);

    const role = token.role;

    // Allow only admin and employee roles
    const allowedRoles = ["Admin", "Employee"]; // Make sure role names match exactly

    // Redirect users with unauthorized roles
    if (
      (pathname.startsWith("/admin") && role !== "Admin") ||
      (pathname.startsWith("/employee") && role !== "Employee")
    ) {
      console.log(
        `Unauthorized access attempt by ${token.username} with role ${role}`,
      );
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    // Redirect logged-in users to their respective dashboards
    if (pathname.startsWith("/auth/login")) {
      console.log("Redirecting logged-in user to their respective dashboard.");
      const redirectUrl =
        role === "Admin" ? "/admin/dashboard" : "/employee/dashboard";
      return NextResponse.redirect(new URL(redirectUrl, req.url));
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
    "/dashboard/:path*", // Consider removing if you want specific routing
  ],
};
