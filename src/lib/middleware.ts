export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/clients/:path*",
    "/services/:path*",
    "/orders/:path*",
    "/payments/:path*",
    "/users/:path*",
    "/masters/:path*",
    "/sales/:path*",
    "/investments/:path*",
    "/loans/:path*",
    "/expenses/:path*",
    "/reports/:path*",
    "/accounting/:path*",
    "/cashbook/:path*",
    "/dividends/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/purchases/:path*",
    "/hardware-sales/:path*",
    "/petty-cash/:path*",
  ],
};