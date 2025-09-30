import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";
import { UserRole } from "@/lib/permissions";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      roles?: UserRole[];
    } & DefaultSession["user"];
  }

  interface User {
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    roles?: UserRole[];
  }
}