import { TrendingUp, TrendingDown, Wallet, CalendarCheck, Contact, UserSquare2, Activity } from 'lucide-react';
import { useDashboardKpis } from '@/hooks/useDashboard';
import { KpiCard } from './dashboard/components/KpiCard';
import { formatCurrency } from '@/lib/utils';

export default function Dashboard() {
  const { data: kpis, isLoading } = useDashboardKpis();

  return (
    <div className="space-y-8">
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-both">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Dashboard</h2>
        <p className="text-zinc-500 mt-2 font-medium">Resumen general de tu negocio en el mes actual y métricas históricas.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Ingresos (Mes)"
          value={kpis ? formatCurrency(kpis.incomes) : formatCurrency(0)}
          icon={TrendingUp}
          isLoading={isLoading}
          delay="100ms"
          colorVariant="emerald"
        />
        <KpiCard
          title="Gastos (Mes)"
          value={kpis ? formatCurrency(kpis.expenses) : formatCurrency(0)}
          icon={TrendingDown}
          isLoading={isLoading}
          delay="200ms"
          colorVariant="rose"
        />
        <KpiCard
          title="Utilidad (Mes)"
          value={kpis ? formatCurrency(kpis.balance) : formatCurrency(0)}
          icon={Wallet}
          isLoading={isLoading}
          delay="300ms"
          colorVariant="blue"
        />
        <KpiCard
          title="Total Clientes"
          value={kpis?.totalClients ?? '0'}
          icon={Contact}
          isLoading={isLoading}
          delay="400ms"
          subtitle="Directorio Histórico"
          colorVariant="amber"
        />
        <KpiCard
          title="Total Socios / Equipo"
          value={kpis?.totalPartners ?? '0'}
          icon={UserSquare2}
          isLoading={isLoading}
          delay="500ms"
          subtitle="Staff Registrado"
          colorVariant="blue"
        />
        <KpiCard
          title="Diagnósticos Generados"
          value={kpis?.totalDiagnostics ?? '0'}
          icon={Activity}
          isLoading={isLoading}
          delay="600ms"
          subtitle="Auditorías Realizadas"
          colorVariant="emerald"
        />
        <KpiCard
          title="Tareas para Hoy"
          value={kpis ? `${kpis.todayTasksCompleted} / ${kpis.todayTasksTotal}` : '0 / 0'}
          icon={CalendarCheck}
          isLoading={isLoading}
          delay="700ms"
          subtitle="Agenda Diaria"
          colorVariant="violet"
          progressValue={kpis?.todayTasksTotal ? (kpis.todayTasksCompleted / kpis.todayTasksTotal) * 100 : 0}
          progressText="Cumplimiento"
        />
      </div>
    </div>
  );
}