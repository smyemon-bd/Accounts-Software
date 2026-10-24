import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

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