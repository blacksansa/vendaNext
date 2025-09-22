import NextAuth from "next-auth";
import { authOptions } from "@/infra/config/Auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

