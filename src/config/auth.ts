import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import type { Adapter } from "next-auth/adapters";
import { authenticateCredentials } from "@/modules/users/services/auth-login";
import { logAuthSession } from "@/modules/users/services/session-log";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totp: { label: "2FA", type: "text" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        const headers = req?.headers;
        const ipAddress =
          (headers?.["x-forwarded-for"] as string)?.split(",")[0] ??
          headers?.["x-real-ip"] ??
          undefined;
        const userAgent = headers?.["user-agent"] as string | undefined;

        const result = await authenticateCredentials(
          credentials.email,
          credentials.password,
          credentials.totp || undefined,
          { ipAddress, userAgent }
        );

        if (!result.ok) {
          if (result.error === "2FA_REQUIRED") {
            throw new Error("2FA_REQUIRED");
          }
          return null;
        }

        return result.user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const existing = await prisma.user.findUnique({
          where: { email: user.email.toLowerCase() },
        });
        if (existing && existing.status !== "ACTIVE") return false;
      }
      return true;
    },
  },
  events: {
    async signIn({ user }) {
      if (user.id) {
        await logAuthSession({
          userId: user.id,
          email: user.email ?? undefined,
          event: "LOGIN",
          metadata: { provider: "oauth_or_credentials" },
        });
      }
    },
    async signOut({ token }) {
      if (token?.id) {
        await logAuthSession({
          userId: token.id as string,
          event: "LOGOUT",
        });
      }
    },
  },
};
