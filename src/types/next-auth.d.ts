import NextAuth, { DefaultSession } from "next-auth"
import { UserRole } from "@/lib/permissions";

declare module "next-auth" {
  interface Session {
    user: {
      roles?: UserRole[];
    } & DefaultSession["user"]
  }
}
