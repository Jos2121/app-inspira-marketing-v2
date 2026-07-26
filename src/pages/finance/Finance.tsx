import { useTransactions, useDeleteTransaction } from '@/hooks/useFinance';
import { TransactionFormModal } from './components/TransactionFormModal';
import { FinanceSummary } from './components/FinanceSummary';
import { TransactionList } from './components/TransactionList';
import { FinanceChart } from './components/FinanceChart';

export default function Finance() {
  const { data: transactions = [], isLoading } = useTransactions();
  const deleteMutation = useDeleteTransaction();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-both">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Ingresos y Gastos</h2>
          <p className="text-zinc-500 mt-2 font-medium">Control general del flujo de caja (soles - S/).</p>
        </div>
        <TransactionFormModal />
      </div>

      <div className="animate-in fade-in duration-700 delay-100 fill-both">
        <FinanceSummary transactions={transactions} isLoading={isLoading} />
      </div>

      <div className="animate-in fade-in duration-700 delay-150 fill-both mt-8">
        <FinanceChart transactions={transactions} />
      </div>

      <div className="animate-in fade-in duration-700 delay-200 fill-both pt-4">
        <h3 className="text-lg font-bold text-zinc-900 mb-4 px-1">Historial de Movimientos</h3>
        <TransactionList 
          transactions={transactions} 
          isLoading={isLoading} 
          onDelete={(id) => deleteMutation.mutate(id)}
          isDeleting={deleteMutation.isPending}
        />
      </div>
    </div>
  );
}