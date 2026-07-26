import { useState, useEffect, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Transaction } from '@/hooks/useFinance';
import { cn, formatCurrency } from '@/lib/utils';
import { formatLocalDateString } from '@/lib/date-utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function TransactionList({ transactions, isLoading, onDelete, isDeleting }: TransactionListProps) {
  const [txToDelete, setTxToDelete] = useState<string | null>(null);
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  // Estado para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Resetear a la página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, monthFilter, typeFilter]);

  const confirmDelete = () => {
    if (txToDelete) {
      onDelete(txToDelete);
      setTxToDelete(null);
    }
  };

  // Obtener los meses disponibles a partir de las transacciones (ej: "2024-07")
  const availableMonths = useMemo(() => {
    const months = new Set(transactions.map(tx => tx.date.substring(0, 7)));
    return Array.from(months).sort().reverse(); // Orden descendente (más recientes primero)
  }, [transactions]);

  // Formatear "2024-07" a "Julio 2024"
  const formatMonthYear = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-');
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const monthName = months[parseInt(month, 10) - 1];
    return `${monthName} ${year}`;
  };

  // Aplicar filtros
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = (tx.category.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (tx.description && tx.description.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesMonth = monthFilter === 'all' ? true : tx.date.startsWith(monthFilter);
    const matchesType = typeFilter === 'all' ? true : tx.type === typeFilter;
    
    return matchesSearch && matchesMonth && matchesType;
  });

  // Cálculos de paginación
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const clearFilters = () => {
    setSearchTerm('');
    setMonthFilter('all');
    setTypeFilter('all');
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/50 p-4 rounded-2xl border border-zinc-200/60 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 w-full flex-wrap">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <Input 
              placeholder="Buscar categoría o detalle..." 
              className="pl-9 bg-white border-zinc-200 focus-visible:ring-blue-600/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-[160px] bg-white border-zinc-200 capitalize">
                <SelectValue placeholder="Mes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los meses</SelectItem>
                {availableMonths.map(m => (
                  <SelectItem key={m} value={m} className="capitalize">
                    {formatMonthYear(m)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px] bg-white border-zinc-200">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Ingreso">Ingresos</SelectItem>
                <SelectItem value="Gasto">Gastos</SelectItem>
              </SelectContent>
            </Select>

            {(searchTerm || monthFilter !== 'all' || typeFilter !== 'all') && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={clearFilters} 
                className="text-zinc-400 hover:text-red-500 hover:bg-red-50 shrink-0"
                title="Limpiar filtros"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="text-sm text-zinc-500 font-medium whitespace-nowrap self-end sm:self-auto">
          {filteredTransactions.length} {filteredTransactions.length === 1 ? 'registro' : 'registros'}
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50/50 hover:bg-zinc-50/50">
              <TableHead>Fecha</TableHead>
              <TableHead>Categoría / Descripción</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead className="text-right w-16">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-zinc-500">Cargando movimientos...</TableCell></TableRow>
            ) : filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-zinc-500">
                  No se encontraron movimientos con los filtros aplicados
                  {(searchTerm || monthFilter !== 'all' || typeFilter !== 'all') && (
                    <Button variant="link" onClick={clearFilters} className="mt-2 text-blue-600 block mx-auto">
                      Limpiar filtros
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((tx) => {
                const isIncome = tx.type === 'Ingreso';
                
                return (
                  <TableRow key={tx.id} className="hover:bg-zinc-50/50 transition-colors">
                    <TableCell className="font-medium text-zinc-700 capitalize whitespace-nowrap">
                      {formatLocalDateString(tx.date, "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-zinc-900">{tx.category}</span>
                        {tx.description && <span className="text-xs text-zinc-500">{tx.description}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        "font-medium border-transparent", 
                        isIncome ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                      )}>
                        {tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell className={cn("text-right font-mono font-bold whitespace-nowrap", isIncome ? "text-emerald-600" : "text-red-600")}>
                      {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => setTxToDelete(tx.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 bg-white/50 p-4 rounded-2xl border border-zinc-200/60 shadow-sm">
          <span className="text-sm text-zinc-500 font-medium">
            Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} al {Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)} de {filteredTransactions.length} registros
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

      {/* Dialogo de eliminación */}
      <AlertDialog open={!!txToDelete} onOpenChange={(open) => !open && setTxToDelete(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar transacción?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se descontará del balance general de forma inmediata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-600/20"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}