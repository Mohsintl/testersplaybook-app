// This file handles authentication using NextAuth.js.
// It sets up the authentication routes and integrates with Prisma for user management.
// The [...nextauth] dynamic route allows NextAuth to handle multiple auth-related endpoints.

export const runtime = "nodejs";

import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  // 👇 ADD THIS
  pages: {
    signIn: "/auth/signin",
  },

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },

    async redirect({baseUrl}){
      return `${baseUrl}/projects`;
    }
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
