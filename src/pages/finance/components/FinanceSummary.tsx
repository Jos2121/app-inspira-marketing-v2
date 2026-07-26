import { KpiCard } from '@/pages/dashboard/components/KpiCard';
import { Transaction } from '@/hooks/useFinance';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { getCurrentDateLimaISO } from '@/lib/date-utils';

interface FinanceSummaryProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export function FinanceSummary({ transactions, isLoading }: FinanceSummaryProps) {
  // Extraemos el año y mes actual en formato "YYYY-MM"
  const currentMonthStr = getCurrentDateLimaISO().substring(0, 7);

  // Filtramos para obtener solo las transacciones del mes actual
  const currentMonthTransactions = transactions.filter(t => 
    t.date.substring(0, 7) === currentMonthStr
  );

  const incomes = currentMonthTransactions
    .filter(t => t.type === 'Ingreso')
    .reduce((acc, t) => acc + Number(t.amount), 0);
    
  const expenses = currentMonthTransactions
    .filter(t => t.type === 'Gasto')
    .reduce((acc, t) => acc + Number(t.amount), 0);
    
  const balance = incomes - expenses;

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <KpiCard
        title="Ingresos"
        value={formatCurrency(incomes)}
        icon={TrendingUp}
        isLoading={isLoading}
        delay="100ms"
        colorVariant="emerald"
      />
      <KpiCard
        title="Gastos"
        value={formatCurrency(expenses)}
        icon={TrendingDown}
        isLoading={isLoading}
        delay="200ms"
        colorVariant="rose"
      />
      <KpiCard
        title="Balance Neto"
        value={formatCurrency(balance)}
        icon={Wallet}
        isLoading={isLoading}
        delay="300ms"
        colorVariant={balance >= 0 ? "blue" : "amber"}
      />
    </div>
  );
}