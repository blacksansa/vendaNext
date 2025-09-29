import NextAuth, { type AuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import { jwtDecode, type JwtPayload } from "jwt-decode";

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
      if (account && account.access_token) {
        try {
          const decodedToken: DecodedToken = jwtDecode(account.access_token);
          const clientId = process.env.KEYCLOAK_ID!;

          if (decodedToken.resource_access && decodedToken.resource_access[clientId]) {
            const keycloakRoles = decodedToken.resource_access[clientId].roles;
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
      if (session.user) {
        session.user.roles = token.roles;
        console.log("Sessão do usuário:", session.user);
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);

