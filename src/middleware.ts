import {
  apiAuthPrefix,
  authRoutes,
  DEFAULT_ADMIN_REDIRECT,
  DEFAULT_EMPLOYEE_REDIRECT,
  publicRoutes,
} from "~/routes";
import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user;
  const role = user?.Personal_Details.Role.Role_name;

  console.log("ROUTE: ", req.nextUrl.pathname);
  console.log("IS LOGGED IN: ", isLoggedIn);
  console.log("ROLE: ", role); // This should now show the correct role
  console.log("user: ", user);  // Make sure the user object is populated

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // Allow API authentication routes without redirection
  if (isApiAuthRoute) {
    return;
  }

  const isLoginPage = nextUrl.pathname === "/auth/login";

  // Handle redirection for authenticated users trying to access auth routes
  if (isAuthRoute && isLoggedIn) {
    return handleAuthRouteRedirect(role, nextUrl);
  }

  // Redirect unauthenticated users trying to access protected routes
  if (!isLoggedIn && !isPublicRoute && !isLoginPage) {
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }

  // Check if the authenticated user has access to the requested route
  if (isLoggedIn && role) {
    const { redirect, routes } = getRoleInfo(role);
    const hasAccess = routes.some((route: string) =>
        nextUrl.pathname.startsWith(route),
    );

    if (!hasAccess) {
      return NextResponse.redirect(new URL(redirect, nextUrl));
    }
  }

  return;
});

function handleAuthRouteRedirect(role: string | undefined, nextUrl: URL) {
  const { redirect } = getRoleInfo(role);
  return NextResponse.redirect(new URL(redirect, nextUrl));
}

function getRoleInfo(role: string | undefined) {
  const roleInfo: Record<string, { redirect: string; routes: string[] }> = {
    ADMIN: {
      redirect: DEFAULT_ADMIN_REDIRECT,
      routes: ["/admin/dashboard"],
    },
    // Add other roles and their respective redirects and routes as needed
  };

  return (
      roleInfo[role as keyof typeof roleInfo] || {
        redirect: DEFAULT_EMPLOYEE_REDIRECT,
        routes: ["/admin/dashboard"],
      }
  );
}

// Configure the matcher for the middleware
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
