import "next-auth";
declare module "next-auth" {
  interface Session {
    user: { id: string; role: string; permissions: string[]; name?: string | null; email?: string | null };
  }
}