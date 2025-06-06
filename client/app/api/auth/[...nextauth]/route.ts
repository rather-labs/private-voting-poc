import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const dynamic = 'force-dynamic';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "dummy",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy",
      authorization: {
        params: {
          scope: "openid email profile",
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        }
      },
      idToken: true,
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          idToken: account.id_token,
          customData: {
            userId: user.id,
            email: user.email,
          },
        };
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        token: token,
        accessToken: token.accessToken,
        idToken: token.idToken,
        customData: token.customData,
      };
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-build",
});

export { handler as GET, handler as POST }; 