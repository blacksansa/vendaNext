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
      console.log("JWT Callback - Token:", token);
      console.log("JWT Callback - Account:", account);

      // Persist the access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
      }

      if (account && account.access_token) {
        try {
          const decodedToken: DecodedToken = jwtDecode(account.access_token);
          const clientId = process.env.KEYCLOAK_ID!;
          console.log("JWT Callback - Decoded Token:", decodedToken);

          if (decodedToken.resource_access && decodedToken.resource_access[clientId]) {
            const keycloakRoles = decodedToken.resource_access[clientId].roles;
            console.log("JWT Callback - Keycloak Roles:", keycloakRoles);
            token.roles = keycloakRoles;
          } else {
            token.roles = [];
          }
        } catch (error) {
          console.error("Erro ao decodificar o token:", error);
          token.roles = [];
        }
      }
      return token;
    },
    async session({ session, token }) {
      console.log("Session Callback - Session:", session);
      console.log("Session Callback - Token:", token);
      if (session) {
        session.accessToken = token.accessToken;
        if (session.user) {
          session.user.roles = token.roles as UserRole[] | undefined;
        }
      }
      console.log("Session Callback - Returning Session:", session);
      return session;
    },
  },
};

export default NextAuth(authOptions);

