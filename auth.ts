import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

async function refreshAccessToken(token: any) {
  try {
    const response = await fetch(
      "https://oauth2.googleapis.com/token",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: process.env.AUTH_GOOGLE_ID!,
          client_secret:
            process.env.AUTH_GOOGLE_SECRET!,
          grant_type: "refresh_token",
          refresh_token: token.refreshToken,
        }),
      }
    );

    const refreshed = await response.json();

    if (!response.ok) {
      throw refreshed;
    }

    return {
      ...token,
      accessToken: refreshed.access_token,
      accessTokenExpires:
        Date.now() +
        refreshed.expires_in * 1000,
      refreshToken:
        refreshed.refresh_token ??
        token.refreshToken,
    };
  } catch (error) {
    console.error(
      "Error refreshing access token:",
      error
    );

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const {
  handlers,
  signIn,
  signOut,
  auth,
} = NextAuth({
  providers: [
    Google({
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.modify",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],

  callbacks: {
    async jwt({ token, account }) {
      // First login
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          accessTokenExpires:
            Date.now() +
            (account.expires_in as number) *
              1000,
          refreshToken:
            account.refresh_token,
        };
      }

      // Access token still valid
      if (
        Date.now() <
        (token.accessTokenExpires as number)
      ) {
        return token;
      }

      // Access token expired
      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      session.accessToken =
        token.accessToken as string;

      session.error =
        token.error as string | undefined;

      return session;
    },
  },
});