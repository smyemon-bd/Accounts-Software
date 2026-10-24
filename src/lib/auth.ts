import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        if (!creds?.email || !creds.password) return null;
        
        const user = await prisma.user.findUnique({
          where: { email: creds.email },
          include: { role: { include: { permissions: { include: { permission: true } } } } },
        });
        
        if (!user || !user.isActive) return null;
        
        const ok = await bcrypt.compare(creds.password, user.passwordHash);
        if (!ok) return null;
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role.name,
          permissions: user.role.permissions.map(p => p.permission.key),
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.permissions = (user as any).permissions;
        token.uid = (user as any).id;
      } else if (token.uid) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.uid as string },
          include: { role: { include: { permissions: { include: { permission: true } } } } },
        });
        
        if (dbUser) {
          token.permissions = dbUser.role.permissions.map(p => p.permission.key);
        } else {
          return null;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.uid) {
        (session.user as any).id = token.uid;
        (session.user as any).role = token.role;
        (session.user as any).permissions = token.permissions;
      }
      return session;
    },
  },
};