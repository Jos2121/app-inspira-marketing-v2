import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthSession } from '@/lib/auth-client';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { ShieldAlert } from 'lucide-react';

export function AppLayout() {
  const { data: session, isPending: sessionPending } = useAuthSession();
  const { data: profile, isLoading: profilePending } = useUserProfile();
  
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Esperar a que la sesión y los permisos de base de datos carguen
  if (sessionPending || (session?.user && profilePending)) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-zinc-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-zinc-500 font-medium">Validando accesos...</p>
      </div>
    );
  }

  if (!session?.user) {
    return <Navigate to="/auth/sign-in" state={{ from: location }} replace />;
  }

  const role = profile?.role || 'ADMIN';
  const isAdmin = role === 'ADMIN' || role === 'SUPERADMIN';
  
  // Lógica de Protección Frontend (RBAC) con los datos del backend
  const accessibleTabs = profile?.accessibleTabs || [];
  const isSuperadmin = role === 'SUPERADMIN' || accessibleTabs.includes('*');
  const currentPath = location.pathname;

  if (!isSuperadmin) {
    // Si el usuario tiene pestañas asignadas pero intenta acceder a una ruta que no le corresponde
    if (accessibleTabs.length > 0) {
      const hasAccess = accessibleTabs.some(tab => currentPath === tab || (tab !== '/' && currentPath.startsWith(tab)));
      if (!hasAccess) {
        // Lo redirigimos a la primera pestaña a la que sí tenga acceso
        return <Navigate to={accessibleTabs[0]} replace />;
      }
    }
  }

  const userCombined = {
    name: session.user.name,
    email: session.user.email,
    role: role,
    accessibleTabs: accessibleTabs
  };

  return (
    <div className="h-screen w-full flex flex-col md:flex-row bg-zinc-50 overflow-hidden">
      <MobileHeader 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen} 
      />

      <Sidebar 
        isAdmin={isAdmin}
        role={role}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        user={userCombined}
      />

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden md:py-4 md:pr-4 transition-all duration-300">
        <div className="h-full flex flex-col glass rounded-none md:rounded-3xl overflow-hidden relative">
          <main className="flex-1 overflow-y-auto p-4 md:p-10">
            {/* Si NO es superadmin y NO tiene NINGÚN módulo asignado, mostramos bloqueo total */}
            {!isSuperadmin && accessibleTabs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[80vh] text-center max-w-md mx-auto animate-in fade-in duration-500">
                <div className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center mb-6 border border-zinc-200 shadow-sm">
                  <ShieldAlert className="w-12 h-12 text-zinc-400" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Acceso Restringido</h2>
                <p className="text-zinc-500 mt-3 font-medium leading-relaxed">
                  Tu cuenta ha sido creada correctamente, pero aún no tienes ningún módulo asignado. 
                  Contacta al superadministrador para que te brinde los permisos necesarios.
                </p>
              </div>
            ) : (
              <Outlet />
            )}
          </main>
        </div>
      </div>

      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-zinc-950/20 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}