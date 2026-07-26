import { useState, useEffect } from 'react';
import { ComplianceRecord, useUpdateComplianceChecklist, useDeleteComplianceRecord } from '@/hooks/useCompliance';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ComplianceCardProps {
  record: ComplianceRecord;
}

export function ComplianceCard({ record }: ComplianceCardProps) {
  const [optimisticChecklist, setOptimisticChecklist] = useState<Record<string, boolean>>(record.checklist);
  const updateChecklist = useUpdateComplianceChecklist();
  const deleteRecord = useDeleteComplianceRecord();

  useEffect(() => {
    setOptimisticChecklist(record.checklist);
  }, [record.checklist]);

  const handleToggle = (activity: string, checked: boolean) => {
    const newChecklist = { ...optimisticChecklist, [activity]: checked };
    setOptimisticChecklist(newChecklist);
    updateChecklist.mutate({ id: record.id, checklist: newChecklist });
  };

  const items = Object.entries(optimisticChecklist);
  const total = items.length;
  const completed = items.filter(([, checked]) => checked).length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  const isCompleted = progress === 100;

  return (
    <div className={cn(
      "glass rounded-[2rem] p-6 border transition-all duration-500 relative overflow-hidden group",
      isCompleted ? "border-emerald-200/60 shadow-emerald-500/5 bg-emerald-50/10" : "border-zinc-200/60 hover:shadow-xl hover:-translate-y-1"
    )}>
      
      {isCompleted && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/20 blur-3xl rounded-full -z-10 pointer-events-none transition-all duration-1000"></div>
      )}

      <div className="flex justify-between items-start mb-5 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className={cn(
              "font-semibold border-transparent", 
              isCompleted ? "bg-emerald-100 text-emerald-700" : "bg-blue-50 text-blue-700"
            )}>
              {record.plan?.name || 'Plan Eliminado'}
            </Badge>
            <span className="text-xs font-medium text-zinc-400 capitalize">
              {formatLocalDateString(record.monthYear, 'MMM yyyy')}
            </span>
          </div>
          <h3 className="text-xl font-bold text-zinc-900 tracking-tight pr-6">
            {record.client?.name || 'Cliente Eliminado'}
          </h3>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 hover:bg-red-50 z-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-[2rem]">
            <AlertDialogHeader>
              <AlertDialogTitle>¿Remover asignación?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará el seguimiento del plan para este mes.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => deleteRecord.mutate(record.id)}
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-600/20"
              >
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="space-y-2 mb-6 relative z-10">
        <div className="flex justify-between items-end">
          <span className="text-sm font-semibold text-zinc-600 flex items-center gap-1.5">
            <ShieldCheck className={cn("w-4 h-4", isCompleted ? "text-emerald-500" : "text-blue-500")} />
            Avance del Plan
          </span>
          <span className="text-sm font-bold font-mono text-zinc-900">{progress}%</span>
        </div>
        <Progress 
          value={progress} 
          className={cn(
            "h-2.5 bg-zinc-100", 
            isCompleted ? "[&>div]:bg-emerald-500" : "[&>div]:bg-blue-600"
          )} 
        />
        <div className="flex justify-between text-[11px] font-bold mt-1 uppercase tracking-wide">
          <span className={cn(isCompleted ? "text-emerald-600" : "text-zinc-400")}>
            {isCompleted ? 'Completado' : 'En Proceso'}
          </span>
          <span className="text-zinc-400">{completed} de {total}</span>
        </div>
      </div>

      <div className="space-y-1 relative z-10 bg-white/40 p-1.5 rounded-2xl border border-zinc-100/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
        {items.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-4">No hay actividades definidas.</p>
        ) : (
          items.map(([activity, isChecked]) => (
            <div 
              key={activity} 
              className={cn(
                "flex items-start gap-3 p-2.5 rounded-xl transition-colors hover:bg-white/60 cursor-pointer",
                isChecked ? "opacity-60" : "opacity-100"
              )}
              onClick={() => handleToggle(activity, !isChecked)}
            >
              <Checkbox 
                checked={isChecked} 
                className={cn(
                  "mt-0.5 w-5 h-5 transition-all",
                  isChecked && "border-emerald-500 bg-emerald-500 text-white"
                )} 
              />
              <span className={cn(
                "text-sm font-medium leading-tight flex-1 select-none transition-all",
                isChecked ? "line-through text-zinc-400" : "text-zinc-700"
              )}>
                {activity}
              </span>
            </div>
          ))
        )}
      </div>

    </div>
  );
}