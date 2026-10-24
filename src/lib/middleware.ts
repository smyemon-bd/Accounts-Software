export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/clients/:path*",
    "/services/:path*",
    "/orders/:path*",
    "/payments/:path*",
    "/users/:path*",
  ],
};