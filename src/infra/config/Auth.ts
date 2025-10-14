import NextAuth, { type AuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import { jwtDecode, type JwtPayload } from "jwt-decode";
import { UserRole } from "@/lib/permissions";

interface DecodedToken extends JwtPayload {
  resource_access?: {
    [key: string]: {
      roles: string[];
    };
  };
}


async function refreshAccessToken(token) {
  console.log("Access token in refreshAccessToken:", token.accessToken);
  console.log("Refresh token in refreshAccessToken:", token.refreshToken);
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/common/validate`, {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ rt: token.refreshToken }),
    });

    if (!response.ok) {
      const responseText = await response.text();
      if (!responseText) {
        throw new Error("Invalid refresh token");
      }
      console.error("Error from /common/validate:", responseText);
      throw new Error(responseText);
    }

    const refreshedTokens = await response.json();

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      expiresAt: Math.floor(Date.now() / 1000 + refreshedTokens.expires_in),
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("Error in refreshAccessToken:", error);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const authOptions: AuthOptions = {

  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_ID!,
      clientSecret: process.env.KEYCLOAK_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
        token.idToken = account.id_token;

        if (account.access_token) {
          const decodedToken = jwtDecode<DecodedToken>(account.access_token);
          const clientRoles =
            decodedToken.resource_access?.[process.env.KEYCLOAK_ID!]?.roles;
          token.roles = clientRoles;
        }

        return token;
      }

      if (Date.now() < (token.expiresAt as number) * 1000) {
        return token;
      }

      const refreshedToken = await refreshAccessToken(token);
      if (refreshedToken.error) {
        return null;
      }
      return { ...token, ...refreshedToken };
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.expiresAt = token.expiresAt;
      session.roles = token.roles;
      return session;
    },
  },
  events: {
    async signOut({ token }) {
      const issuerUrl = process.env.KEYCLOAK_ISSUER;
      if (issuerUrl) {
        const logOutUrl = new URL(`${issuerUrl}/protocol/openid-connect/logout`);
        const idToken = token.idToken as string;
        const postLogoutRedirectUri = process.env.NEXTAUTH_URL;

        if (idToken) {
          logOutUrl.searchParams.set("id_token_hint", idToken);
        }
        if (postLogoutRedirectUri) {
          logOutUrl.searchParams.set(
            "post_logout_redirect_uri",
            postLogoutRedirectUri
          );
        }

        try {
          await fetch(logOutUrl);
        } catch (error) {
          console.error("Error during sign out:", error);
        }
      }
    },
  },
};

export default NextAuth(authOptions);

