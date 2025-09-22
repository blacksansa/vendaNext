'use client'
import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  console.log({ session, status });

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      signIn("keycloak");
    } else { }
  }, [session, status, router]);


  return <>{children}</>;
}