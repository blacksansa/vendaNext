"use client";

import { useSession, signIn } from "next-auth/react";
import type { ReactNode } from "react";
import { useEffect } from "react";

interface AuthGuardProps {
  children: ReactNode;
}

//Todo: Melhorar o loading

export function AuthGuard({ children }: AuthGuardProps) {
  const { data: session, status } = useSession();
  const isUser = !!session?.user;

  useEffect(() => {
    if (status === "loading") {
      return; // Do nothing while loading
    }
    if (!isUser) {
      signIn("keycloak"); // Redirect to Keycloak if not authenticated
    }
  }, [isUser, status]);

  // Show loading indicator while session is loading or while redirecting
  if (!isUser) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}