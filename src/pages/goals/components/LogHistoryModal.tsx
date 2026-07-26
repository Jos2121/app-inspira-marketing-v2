import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeleteDailyLog } from '@/hooks/useDailyLogs';
import { formatLocalDateString } from '@/lib/date-utils';

interface LogHistoryModalProps {
  goal: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export function LogHistoryModal({ goal, isOpen, onClose }: LogHistoryModalProps) {
  const deleteLog = useDeleteDailyLog();

  if (!goal) return null;

  const logs = goal.dailyLogs || [];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Historial de Registros</DialogTitle>
          <p className="text-sm text-zinc-500">
            Mostrando registros para el periodo {formatLocalDateString(goal.monthYear, 'MMMM yyyy')}
          </p>
        </DialogHeader>
        
        <div className="mt-4 bg-white rounded-xl border border-zinc-200 overflow-hidden max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader className="bg-zinc-50/50 sticky top-0 z-10">
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-center">Pacientes</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-zinc-500">
                    No hay registros aún para esta meta.
                  </TableCell>
                </TableRow>
              ) : (
                [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium text-zinc-900 capitalize">
                      {formatLocalDateString(log.date, "d 'de' MMMM, yyyy")}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold font-mono">
                        <Users className="w-3.5 h-3.5" />
                        +{log.count}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                        onClick={() => {
                          if (confirm('¿Eliminar este registro? Se descontará del progreso total.')) {
                            deleteLog.mutate(log.id);
                          }
                        }}
                        disabled={deleteLog.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}