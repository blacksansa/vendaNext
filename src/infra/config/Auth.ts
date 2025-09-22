import NextAuth, { type AuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import { jwtDecode, type JwtPayload } from "jwt-decode"

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
    async jwt({ token, account,}) {
      if(account && account.access_token) {
        console.log("PRIMEIRO LOGIN: O objeto 'account' está disponível.");
        try {
          // 1. Decodificar o access_token do provedor
          const decodedToken: DecodedToken = jwtDecode(account.access_token); // ✅ Correct usage
          console.log("Token do provedor DECODIFICADO:", decodedToken);

          if (decodedToken.resource_access) {
            // 3. Adicionar as roles ao token do NextAuth
            token.roles = decodedToken.resource_access
          } else {
            console.log("Nenhuma 'resource_access' ou roles encontradas para o client ID:", process.env.KEYCLOAK_ID!);
          }
        } catch (error) {
          console.error("Erro ao processar o token do provedor:", error);
        }
        
      }
      return token
    },
    async session({ session, token }) {
      console.log({ session, token });
      if(session.user) {
        session.user.roles = token.roles;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);

