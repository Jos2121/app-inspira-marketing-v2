import React from 'react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Con better-auth react client, el hook de sesión maneja el estado de forma atómica.
  // Ya no se requiere envolver con Provider específico en la raíz.
  return <>{children}</>;
}