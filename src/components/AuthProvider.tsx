import { useNavigate, Link } from 'react-router-dom';
import { NeonAuthUIProvider } from '@neondatabase/auth/react';
import { authClient } from '@/lib/auth-client';
import React from 'react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  
  return (
    <NeonAuthUIProvider
      authClient={authClient}
      defaultTheme="light" // App is light-themed as per MVP overview
      navigate={(href) => navigate(href)}
      replace={(href) => navigate(href, { replace: true })}
      Link={({ href, ...props }) => <Link to={href} {...props} />}
    >
      {children}
    </NeonAuthUIProvider>
  );
}
