import { useQuery } from '@tanstack/react-query';

export type DashboardKpis = {
  incomes: number;
  expenses: number;
  balance: number;
  todayTasksTotal: number;
  todayTasksCompleted: number;
  totalClients: number;
  totalPartners: number;
  totalDiagnostics: number;
};

export function useDashboardKpis() {
  return useQuery<DashboardKpis>({
    queryKey: ['dashboard-kpis'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/kpis');
      if (!res.ok) throw new Error('Error al cargar KPIs');
      return res.json();
    }
  });
}