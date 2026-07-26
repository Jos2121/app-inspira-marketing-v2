import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' 
    ? window.location.origin 
    : 'http://localhost:8080'
});

type SessionState = {
  data: {
    user: { 
      id: string; 
      name: string; 
      email: string; 
      emailVerified: boolean; 
      role?: string;
      accessibleTabs?: string[];
    };
  } | null;
  isPending: boolean;
};

export const useAuthSession = (): SessionState => 
  (authClient.useSession as unknown as () => SessionState)();