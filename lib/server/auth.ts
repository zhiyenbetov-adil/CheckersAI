import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import { upsertOAuthUser, writeLog } from "@/lib/server/db"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false
      const mapped = await upsertOAuthUser({
        name: user.name ?? user.email.split("@")[0],
        email: user.email,
      })
      await writeLog({
        userId: mapped.id,
        email: mapped.email,
        action: "auth.oauth.success",
        details: { provider: account?.provider ?? "unknown" },
      })
      user.name = mapped.name
      return true
    },
    async session({ session }) {
      if (session.user?.email) {
        const mapped = await upsertOAuthUser({
          name: session.user.name ?? session.user.email.split("@")[0],
          email: session.user.email,
        })
        session.user.name = mapped.name
      }
      return session
    },
  },
})

