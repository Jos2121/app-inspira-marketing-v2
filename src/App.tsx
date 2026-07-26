import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import { AuthPage } from "./pages/auth/AuthPage";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Goals from "./pages/goals/Goals";
import Finance from "./pages/finance/Finance";
import Partners from "./pages/partners/Partners";
import CalendarPage from "./pages/calendar/Calendar";
import Compliance from "./pages/compliance/Compliance";
import Diagnostic from "./pages/diagnostic/Diagnostic";
import Workflows from "./pages/workflows/Workflows";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth/:path" element={<AuthPage />} />
            
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/compliance" element={<Compliance />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/workflows" element={<Workflows />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/partners" element={<Partners />} />
              <Route path="/diagnostic" element={<Diagnostic />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;