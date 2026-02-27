import NextAuth, { getServerSession, type DefaultSession } from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & { id: string; handle: string }
  }
}

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
    })
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (session.user) {
        session.user.id = user.id
        session.user.handle = user.handle
      }
      return session
    }
  }
}

export function auth() {
  return getServerSession(authOptions as any)
}
