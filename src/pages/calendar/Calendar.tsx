import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { CalendarView } from './components/CalendarView';

export default function CalendarPage() {
  const { data: tasks = [], isLoading } = useTasks();
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[750px] glass rounded-[2rem]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Calendario Operativo</h2>
        <p className="text-zinc-500 mt-1 font-medium">Gestiona tareas, citas y asignaciones del equipo.</p>
      </div>

      <CalendarView 
        tasks={tasks}
        onTaskCreate={(data) => createMutation.mutate(data)}
        onTaskUpdate={(id, data) => updateMutation.mutate({ id, data })}
        onTaskDelete={(id) => deleteMutation.mutate(id)}
        isPending={createMutation.isPending || updateMutation.isPending}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}