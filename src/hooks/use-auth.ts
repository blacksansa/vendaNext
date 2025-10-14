"use client"

import { useSession } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();

  const loading = status === "loading";
  const isAuthenticated = status === "authenticated";

  return {
    user: session?.user,
    roles: session?.roles,
    loading,
    isAuthenticated,
  };
}