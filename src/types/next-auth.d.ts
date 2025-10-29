import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    roles?: string[];
    userId?: string; // Keycloak user ID (UUID)
    user?: {
      id?: string; // Keycloak user ID (UUID)
      role?: string; // High-level role (admin, manager, seller)
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    roles?: string[];
    userId?: string; // Keycloak user ID (UUID)
    role?: string; // High-level role
    idToken?: string;
  }
}
