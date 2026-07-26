import { useState, useEffect } from 'react';
import { useGoals, useDeleteGoal } from '@/hooks/useGoals';
import { useClients } from '@/hooks/useClients';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, cn } from '@/lib/utils';
import { Target, TrendingUp, Users, Trash2, History, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { DailyLogModal } from './DailyLogModal';
import { Button } from '@/components/ui/button';
import { LogHistoryModal } from './LogHistoryModal';
import { getCurrentDateLimaISO, formatLocalDateString } from '@/lib/date-utils';
import { Input } from '@/components/ui/input';
import { getDaysInMonth } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Helper para calcular el ritmo esperado hasta la fecha actual
function calculatePacing(monthYear: string, targetPatients: number) {
  const todayISO = getCurrentDateLimaISO(); 
  const todayParts = todayISO.split('-');
  const todayDay = parseInt(todayParts[2], 10);
  const currentMonthStr = todayISO.substring(0, 7);

  const [goalYear, goalMonth] = monthYear.split('-');
  const goalDate = new Date(parseInt(goalYear, 10), parseInt(goalMonth, 10) - 1, 1);
  const totalDays = getDaysInMonth(goalDate);

  let elapsedDays = 0;
  if (monthYear === currentMonthStr) {
    elapsedDays = todayDay; 
  } else if (monthYear < currentMonthStr) {
    elapsedDays = totalDays; 
  } else {
    elapsedDays = 0; 
  }

  const expectedPatients = Math.round((targetPatients / totalDays) * elapsedDays);
  const expectedPercentage = Math.min((expectedPatients / targetPatients) * 100, 100);

  return { expectedPatients, expectedPercentage };
}

export function GoalList() {
  const { data: goals = [], isLoading } = useGoals();
  const deleteMutation = useDeleteGoal();
  const { data: clients } = useClients();

  const [historyGoal, setHistoryGoal] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [monthFilter, setMonthFilter] = useState(getCurrentDateLimaISO().substring(0, 7));
  
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, monthFilter]);

  if (isLoading) {
    return (
      <div className="text-center py-20 bg-white/40 glass rounded-3xl border border-dashed border-zinc-200/60">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-zinc-500 font-medium">Cargando metas...</p>
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="text-center py-20 bg-white/40 glass rounded-3xl border border-dashed border-zinc-200/60">
        <Target className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-zinc-900">No hay metas activas</h3>
        <p className="text-zinc-500 mt-1">Crea una nueva meta para comenzar el seguimiento.</p>
      </div>
    );
  }

  const filteredGoals = goals.filter((goal) => {
    const client = clients?.find(c => c.id === goal.clientId);
    const clientName = client?.name || '';
    
    const matchesSearch = clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = monthFilter ? goal.monthYear === monthFilter : true;
    
    return matchesSearch && matchesMonth;
  });

  const totalPages = Math.ceil(filteredGoals.length / ITEMS_PER_PAGE);
  const paginatedGoals = filteredGoals.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/50 p-4 rounded-2xl border border-zinc-200/60 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto flex-1">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <Input 
              placeholder="Buscar por cliente..." 
              className="pl-9 bg-white border-zinc-200 focus-visible:ring-blue-600/20 focus-visible:border-blue-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative w-full sm:w-auto flex items-center gap-2">
            <Input 
              type="month" 
              className="bg-white border-zinc-200 focus-visible:ring-blue-600/20 focus-visible:border-blue-600 w-full sm:w-[180px]"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
            />
            {monthFilter && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setMonthFilter('')} 
                className="text-zinc-400 hover:text-red-500 hover:bg-red-50"
                title="Limpiar mes"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="text-sm text-zinc-500 font-medium whitespace-nowrap">
          {filteredGoals.length} {filteredGoals.length === 1 ? 'resultado' : 'resultados'}
        </div>
      </div>

      {filteredGoals.length === 0 ? (
        <div className="text-center py-16 bg-white/40 glass rounded-3xl border border-dashed border-zinc-200/60">
          <p className="text-zinc-500 font-medium text-lg">No se encontraron metas que coincidan con los filtros.</p>
          <Button variant="link" onClick={() => {setSearchTerm(''); setMonthFilter('');}} className="mt-2 text-blue-600">
            Limpiar filtros
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedGoals.map((goal) => {
              const client = clients?.find(c => c.id === goal.clientId);
              const currentPatients = goal.dailyLogs?.reduce((acc: number, log: any) => acc + log.count, 0) || 0;
              const progressPercentage = Math.min((currentPatients / goal.targetPatients) * 100, 100);
              
              const pacing = calculatePacing(goal.monthYear, goal.targetPatients);
              const isOnTrack = currentPatients >= pacing.expectedPatients;
              
              const costVal = Number(goal.costPerPatient);
              const earnedMoney = currentPatients * costVal;
              const projectedMoney = goal.targetPatients * costVal;
              
              const progressColor = progressPercentage >= 100 
                ? "[&>div]:bg-emerald-500" 
                : isOnTrack 
                  ? "[&>div]:bg-blue-500" 
                  : "[&>div]:bg-amber-500";
                  
              const badgeColor = progressPercentage >= 100 
                ? "bg-emerald-100 text-emerald-700" 
                : "bg-blue-50 text-blue-700";

              return (
                <div key={goal.id} className="glass rounded-[2rem] p-6 shadow-sm border border-zinc-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                  
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                      <span className={cn("text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider", badgeColor)}>
                        {formatLocalDateString(goal.monthYear, 'MMMM yyyy')}
                      </span>
                      <h3 className="text-lg font-bold text-zinc-900 mt-3 truncate pr-4">
                        {client?.name || 'Cargando cliente...'}
                      </h3>
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 hover:bg-red-50 -mt-2 -mr-2 relative z-50"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-[2rem]">
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar meta?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará la meta y todo su historial de registros diarios.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteMutation.mutate(goal.id)}
                            className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-600/20"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  <div className="space-y-6 relative z-10">
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <div className="flex flex-col gap-1">
                          <span className="text-zinc-500 text-sm font-medium flex items-center gap-1.5">
                            <Users className="w-4 h-4"/> Pacientes
                          </span>
                          {pacing.expectedPatients > 0 && progressPercentage < 100 && (
                            <span className={cn("text-xs font-semibold", isOnTrack ? "text-emerald-600" : "text-amber-600")}>
                              Esperado a hoy: {pacing.expectedPatients}
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-zinc-900 font-mono font-medium">
                            {currentPatients} / {goal.targetPatients}
                          </span>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <Progress value={progressPercentage} className={cn("h-2.5 bg-zinc-100", progressColor)} />
                        
                        {pacing.expectedPercentage > 0 && pacing.expectedPercentage < 100 && (
                           <div
                             className={cn(
                               "absolute top-1/2 -translate-y-1/2 w-1 h-4 rounded-full shadow-sm z-10 border border-white",
                               isOnTrack ? "bg-emerald-500" : "bg-amber-500"
                             )}
                             style={{ left: `calc(${pacing.expectedPercentage}% - 2px)` }}
                             title={`Progreso esperado: ${pacing.expectedPatients}`}
                           />
                        )}
                      </div>
                      
                      <div className="flex justify-between mt-1.5 text-xs font-bold">
                        <span className={cn(
                          progressPercentage >= 100 ? "text-emerald-600" : isOnTrack ? "text-blue-600" : "text-amber-600"
                        )}>
                          {progressPercentage >= 100 ? 'Meta completada 🎉' : isOnTrack ? 'A buen ritmo' : 'Requiere atención'}
                        </span>
                        <span className="text-zinc-400">{progressPercentage.toFixed(1)}%</span>
                      </div>
                    </div>

                    <div className="bg-zinc-50/50 rounded-xl p-4 border border-zinc-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", progressPercentage >= 100 ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600")}>
                          <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Acumulado</p>
                          <p className="text-lg font-bold text-zinc-900 font-mono">
                            {formatCurrency(earnedMoney)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Proyección</p>
                        <p className="text-sm font-bold text-zinc-400 font-mono">
                          {formatCurrency(projectedMoney)}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-between items-center">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs h-9 rounded-xl border-zinc-200 text-zinc-600 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                        onClick={() => setHistoryGoal(goal)}
                      >
                        <History className="w-3.5 h-3.5 mr-1.5" />
                        Historial ({goal.dailyLogs?.length || 0})
                      </Button>
                      <DailyLogModal goalId={goal.id} />
                    </div>
                  </div>
                  
                  {progressPercentage >= 100 && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 blur-3xl rounded-full -z-10 pointer-events-none"></div>
                  )}
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 bg-white/50 p-4 rounded-2xl border border-zinc-200/60 shadow-sm">
              <span className="text-sm text-zinc-500 font-medium">
                Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} al {Math.min(currentPage * ITEMS_PER_PAGE, filteredGoals.length)} de {filteredGoals.length} metas
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="bg-white"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Anterior
                </Button>
                <div className="text-sm font-medium text-zinc-700 px-2 min-w-[100px] text-center">
                  Página {currentPage} de {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="bg-white"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <LogHistoryModal 
        goal={historyGoal}
        isOpen={!!historyGoal}
        onClose={() => setHistoryGoal(null)}
      />
    </>
  );
}