import { Objective, useToggleObjectiveTask } from '@/hooks/useObjectives';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarClock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ObjectiveCardProps {
  objective: Objective;
}

export function ObjectiveCard({ objective }: ObjectiveCardProps) {
  const toggleTask = useToggleObjectiveTask();

  const totalTasks = objective.tasks.length;
  const completedTasks = objective.tasks.filter(t => t.isCompleted).length;
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  const isCompleted = progress === 100 && totalTasks > 0;

  const formatDeadline = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, "d 'de' MMM, yyyy - HH:mm", { locale: es });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className={cn(
      "glass rounded-[2rem] p-6 border transition-all duration-300 relative overflow-hidden group", 
      isCompleted ? "border-emerald-200/60 bg-emerald-50/10 shadow-sm" : "border-zinc-200/60 hover:shadow-xl hover:-translate-y-1"
    )}>
      
      {isCompleted && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/20 blur-3xl rounded-full -z-10 pointer-events-none transition-all duration-1000"></div>
      )}

      <div className="flex justify-between items-start mb-3 relative z-10">
        <div>
          <Badge variant="outline" className={cn(
            "font-semibold border-transparent mb-2",
            isCompleted ? "bg-emerald-100 text-emerald-800" : "bg-blue-50 text-blue-700"
          )}>
            {objective.client?.name || 'Cliente Eliminado'}
          </Badge>
          <h3 className="text-xl font-bold text-zinc-900 leading-tight tracking-tight">
            {objective.title}
          </h3>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-sm text-zinc-600 mb-6 font-medium relative z-10">
        <CalendarClock className="w-4 h-4 text-rose-500 shrink-0" />
        <span>Vence: {formatDeadline(objective.deadline)}</span>
      </div>

      <div className="space-y-2 mb-6 relative z-10">
        <div className="flex justify-between text-sm font-semibold items-center">
          <span className="text-zinc-500 flex items-center gap-1.5">
            <CheckCircle2 className={cn("w-4 h-4", isCompleted ? "text-emerald-500" : "text-blue-500")} />
            Progreso
          </span>
          <span className={cn("font-mono text-base", isCompleted ? "text-emerald-600" : "text-zinc-900")}>
            {progress}%
          </span>
        </div>
        <Progress 
          value={progress} 
          className={cn("h-2.5 bg-zinc-100", isCompleted ? "[&>div]:bg-emerald-500" : "[&>div]:bg-blue-600")} 
        />
        <div className="flex justify-end text-[11px] font-bold uppercase tracking-wide text-zinc-400 mt-1">
          {completedTasks} de {totalTasks} tareas
        </div>
      </div>

      <div className="space-y-2 relative z-10 bg-white/40 p-1.5 rounded-2xl border border-zinc-100/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
        {objective.tasks.map(task => (
          <div 
            key={task.id} 
            className={cn(
              "flex items-start gap-3 p-3 bg-white rounded-xl border transition-all hover:border-blue-200 hover:shadow-sm",
              task.isCompleted ? "border-zinc-100 opacity-60" : "border-zinc-200 shadow-sm"
            )}
          >
            <Checkbox
              checked={task.isCompleted}
              onCheckedChange={(checked) => toggleTask.mutate({ id: task.id, isCompleted: !!checked })}
              className={cn(
                "mt-0.5 w-5 h-5 transition-all",
                task.isCompleted && "border-emerald-500 bg-emerald-500 text-white"
              )}
            />
            <div className="flex-1 flex flex-col gap-1.5">
              <span className={cn(
                "text-sm font-medium leading-tight transition-all", 
                task.isCompleted ? "line-through text-zinc-400" : "text-zinc-700"
              )}>
                {task.title}
              </span>
              
              {task.partner && (
                <div className="flex items-center gap-1.5 w-fit bg-zinc-50 border border-zinc-100 px-2 py-0.5 rounded-lg">
                  <div 
                    className="w-1.5 h-1.5 rounded-full shrink-0" 
                    style={{ backgroundColor: task.partner.color || '#3b82f6' }} 
                  />
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">
                    {task.partner.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
}