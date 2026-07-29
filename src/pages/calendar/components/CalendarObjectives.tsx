import React, { useState } from 'react';
import { useObjectives, Objective } from '@/hooks/useObjectives';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Target, CheckCircle2, Circle, User } from 'lucide-react';
import { formatDateLima } from '@/lib/date-utils';
import { cn } from '@/lib/utils';

export function CalendarObjectives() {
  const { data: objectives = [], isLoading } = useObjectives();
  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null);

  // Filtrar objetivos: que no estén completados al 100% y ordenar por vencimiento (urgentes primero)
  const activeObjectives = objectives.filter(obj => {
    const total = obj.tasks.length;
    const completed = obj.tasks.filter(t => t.isCompleted).length;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
    
    return progress < 100;
  }).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  if (isLoading || activeObjectives.length === 0) return null;

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-both">
      <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
        <Target className="w-5 h-5 text-blue-600" /> 
        Objetivos Pendientes
      </h3>
      
      {/* Contenedor Horizontal Scrollable */}
      <div className="flex overflow-x-auto gap-4 pb-4 snap-x no-scrollbar items-stretch">
        {activeObjectives.map(obj => {
          const total = obj.tasks.length;
          const completed = obj.tasks.filter(t => t.isCompleted).length;
          const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

          return (
            <div 
              key={obj.id} 
              onClick={() => setSelectedObjective(obj)} 
              className="min-w-[280px] max-w-[320px] flex-1 shrink-0 snap-start glass rounded-[1.5rem] p-5 border border-zinc-200/60 cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 truncate max-w-full">
                    {obj.client?.name || 'Cliente Eliminado'}
                  </Badge>
                </div>
                <h4 className="font-bold text-zinc-900 line-clamp-2 mb-3 leading-tight" title={obj.title}>
                  {obj.title}
                </h4>
              </div>
              
              <div>
                <div className="flex items-center justify-between gap-1.5 text-xs font-semibold text-zinc-500 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-rose-500" />
                    <span>{formatDateLima(new Date(obj.deadline), "dd MMM - HH:mm")}</span>
                  </div>
                  <span className="text-blue-600">{progress}%</span>
                </div>
                <Progress value={progress} className="h-1.5 bg-zinc-100 [&>div]:bg-blue-600" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Vista Previa (Read-only) */}
      <Dialog open={!!selectedObjective} onOpenChange={(open) => !open && setSelectedObjective(null)}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] max-h-[85vh] overflow-y-auto no-scrollbar">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
               <Target className="w-5 h-5 text-blue-600" />
               Resumen del Objetivo
            </DialogTitle>
          </DialogHeader>
          
          {selectedObjective && (
            <div className="space-y-6 pt-2">
               <div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 mb-3 border-blue-200">
                    {selectedObjective.client?.name || 'Cliente Eliminado'}
                  </Badge>
                  <h3 className="text-xl font-bold text-zinc-900 leading-tight">{selectedObjective.title}</h3>
                  <div className="flex items-center gap-2 text-sm font-medium text-zinc-600 mt-3 bg-zinc-50 w-fit px-3 py-1.5 rounded-lg border border-zinc-100">
                    <Clock className="w-4 h-4 text-rose-500" />
                    Vence: {formatDateLima(new Date(selectedObjective.deadline), "d 'de' MMMM, HH:mm")}
                  </div>
               </div>

               <div className="bg-zinc-50/80 rounded-2xl p-5 border border-zinc-200/60 space-y-4">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-bold text-zinc-800 text-sm uppercase tracking-wider">Lista de Tareas</h4>
                    <span className="text-xs font-bold text-zinc-400">
                      {selectedObjective.tasks.filter(t => t.isCompleted).length} de {selectedObjective.tasks.length}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {selectedObjective.tasks.length === 0 ? (
                      <p className="text-sm text-zinc-500 italic">No hay tareas asignadas.</p>
                    ) : (
                      selectedObjective.tasks.map(task => (
                        <div key={task.id} className={cn(
                          "flex items-start gap-3 p-3 rounded-xl border bg-white shadow-sm transition-opacity", 
                          task.isCompleted ? "opacity-60 border-zinc-100" : "border-zinc-200"
                        )}>
                           {task.isCompleted ? (
                             <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                           ) : (
                             <Circle className="w-5 h-5 text-zinc-300 shrink-0 mt-0.5" />
                           )}
                           
                           <div className="flex-1 flex flex-col gap-1.5">
                              <span className={cn(
                                "text-sm font-semibold leading-snug", 
                                task.isCompleted ? "line-through text-zinc-400" : "text-zinc-800"
                              )}>
                                {task.title}
                              </span>
                              
                              {task.partner && (
                                <span className="text-[10px] w-fit flex items-center gap-1.5 text-zinc-600 font-bold uppercase tracking-wider bg-zinc-100 px-2 py-0.5 rounded-md">
                                   <User className="w-3 h-3" /> {task.partner.name}
                                </span>
                              )}
                           </div>
                        </div>
                      ))
                    )}
                  </div>
               </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}