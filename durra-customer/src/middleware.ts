import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isDev = process.env.NODE_ENV === "development";
const APPS: Record<string, string> = {
  customer:  isDev ? "http://localhost:3000" : (process.env.NEXT_PUBLIC_CUSTOMER_URL  || "https://durrahonline.com"),
  seller:    isDev ? "http://localhost:3001" : (process.env.NEXT_PUBLIC_SELLER_URL    || "https://seller.durrahonline.com"),
  provider:  isDev ? "http://localhost:3002" : (process.env.NEXT_PUBLIC_PROVIDER_URL  || "https://provider.durrahonline.com"),
  admin:     isDev ? "http://localhost:3003" : (process.env.NEXT_PUBLIC_ADMIN_URL     || "https://admin.durrahonline.com"),
  warehouse: isDev ? "http://localhost:3004" : (process.env.NEXT_PUBLIC_WAREHOUSE_URL || "https://warehouse.durrahonline.com"),
};

const ALLOWED_ROLES = ["customer"];

const PUBLIC_PATHS = [
  "/",
  "/",
  "/auth",
  "/browse",
  "/search",
  "/services",
  "/dress",
  "/register",
];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path.startsWith("/icons") ||
    path.endsWith(".png") ||
    path.endsWith(".jpg") ||
    path.endsWith(".jpeg") ||
    path.endsWith(".svg") ||
    path.endsWith(".ico") ||
    path.endsWith(".webp") ||
    path === "/manifest.json" ||
    path === "/sw.js" ||
    path === "/favicon.ico" ||
    PUBLIC_PATHS.some(p => path === p || path.startsWith(p + "/"))
  ) {
    return NextResponse.next();
  }

  const role = request.cookies.get("durra-role")?.value;

  if (!role) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  if (!ALLOWED_ROLES.includes(role)) {
    const correctApp = APPS[role] || APPS.customer;
    return NextResponse.redirect(correctApp);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
