'use client';

import { useSession, signIn } from 'next-auth/react';
import { useEffect } from 'react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn('keycloak');
    }
  }, [status]);

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (status === 'authenticated') {
    return <>{children}</>;
  }

  return null;
}
