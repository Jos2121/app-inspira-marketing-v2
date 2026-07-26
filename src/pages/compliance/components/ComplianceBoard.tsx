import { useState, useEffect } from 'react';
import { useComplianceRecords } from '@/hooks/useCompliance';
import { ComplianceCard } from './ComplianceCard';
import { Input } from '@/components/ui/input';
import { Search, FilterX, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCurrentDateLimaISO } from '@/lib/date-utils';

export function ComplianceBoard() {
  const { data: records = [], isLoading } = useComplianceRecords();
  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState(getCurrentDateLimaISO().substring(0, 7)); // Por defecto mes actual

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  // Resetear la página al filtrar
  useEffect(() => {
    setCurrentPage(1);
  }, [search, monthFilter]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3].map(i => <div key={i} className="h-64 bg-zinc-100/50 rounded-[2rem] animate-pulse"></div>)}
      </div>
    );
  }

  const filteredRecords = records.filter(r => {
    const matchesSearch = r.client?.name.toLowerCase().includes(search.toLowerCase()) || 
                          r.plan?.name.toLowerCase().includes(search.toLowerCase());
    const matchesMonth = monthFilter ? r.monthYear === monthFilter : true;
    return matchesSearch && matchesMonth;
  });

  const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white/50 p-4 rounded-2xl border border-zinc-200/60 shadow-sm justify-between items-center">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto flex-1">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <Input 
              placeholder="Buscar por cliente o plan..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white focus-visible:ring-blue-600/20"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Input 
              type="month" 
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="bg-white focus-visible:ring-blue-600/20 w-full sm:w-44"
            />
            {monthFilter && (
              <Button variant="ghost" size="icon" onClick={() => setMonthFilter('')} className="text-zinc-400 hover:text-red-500 hover:bg-red-50 shrink-0">
                <FilterX className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="text-sm text-zinc-500 font-medium whitespace-nowrap">
          {filteredRecords.length} {filteredRecords.length === 1 ? 'asignación' : 'asignaciones'}
        </div>
      </div>

      {/* Cuadrícula */}
      {filteredRecords.length === 0 ? (
        <div className="text-center py-20 glass rounded-[2rem] border-dashed border-zinc-200/80">
          <p className="text-zinc-500 font-medium text-lg">No hay asignaciones para los filtros seleccionados.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedRecords.map(record => (
              <ComplianceCard key={record.id} record={record} />
            ))}
          </div>

          {/* Controles de paginación */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 bg-white/50 p-4 rounded-2xl border border-zinc-200/60 shadow-sm">
              <span className="text-sm text-zinc-500 font-medium">
                Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} al {Math.min(currentPage * ITEMS_PER_PAGE, filteredRecords.length)} de {filteredRecords.length} asignaciones
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="bg-white rounded-xl"
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
                  className="bg-white rounded-xl"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}