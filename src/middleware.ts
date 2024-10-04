import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  authRoutes,
  DEFAULT_ADMIN_REDIRECT,
  DEFAULT_EMPLOYEE_REDIRECT,
} from "./routes";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });

  const { pathname } = req.nextUrl;

  if (!token) {
    return handleUnauthenticatedUser(pathname, req.url);
  }

  return handleAuthenticatedUser(pathname, token.role, req.url);
}

function handleUnauthenticatedUser(pathname: string, requestUrl: string) {
  if (!authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL(authRoutes[0], requestUrl));
  }
  return NextResponse.next();
}

function handleAuthenticatedUser(
  pathname: string,
  role: string,
  requestUrl: string,
) {
  if (isUnauthorizedAccess(pathname, role)) {
    return NextResponse.redirect(new URL(authRoutes[0], requestUrl));
  }

  if (pathname.startsWith("/auth/login")) {
    const redirectUrl =
      role === "Admin" ? DEFAULT_ADMIN_REDIRECT : DEFAULT_EMPLOYEE_REDIRECT;
    return NextResponse.redirect(new URL(redirectUrl, requestUrl));
  }

  return NextResponse.next();
}

function isUnauthorizedAccess(pathname: string, role: string) {
  const isAdminPath = pathname.startsWith("/admin");
  const isEmployeePath = pathname.startsWith("/employee");
  const allowedRoles = ["Admin", "Employee"];

  return (
    (isAdminPath && role !== "Admin") ||
    (isEmployeePath && role !== "Employee") ||
    !allowedRoles.includes(role)
  );
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/employee/:path*",
    "/auth/login",
    "/dashboard/:path*",
  ],
};
