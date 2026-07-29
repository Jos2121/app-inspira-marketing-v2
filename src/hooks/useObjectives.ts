import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type ObjectiveTask = {
  id: string;
  objectiveId: string;
  title: string;
  partnerId: string | null;
  isCompleted: boolean;
  createdAt: string;
  partner?: { id: string; name: string };
};

export type Objective = {
  id: string;
  title: string;
  clientId: string;
  deadline: string;
  createdAt: string;
  client?: { id: string; name: string };
  tasks: ObjectiveTask[];
};

export function useObjectives() {
  return useQuery<Objective[]>({
    queryKey: ['objectives'],
    queryFn: async () => {
      const res = await fetch('/api/objectives');
      if (!res.ok) throw new Error('Error al cargar objetivos');
      return res.json();
    }
  });
}

export function useCreateObjective() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; clientId: string; deadline: string; tasks: { title: string; partnerId: string | null }[] }) => {
      const res = await fetch('/api/objectives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al crear objetivo');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      toast.success('Objetivo creado exitosamente');
    },
    onError: () => toast.error('Error al crear objetivo')
  });
}

export function useToggleObjectiveTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isCompleted }: { id: string; isCompleted: boolean }) => {
      const res = await fetch(`/api/objectives/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted }),
      });
      if (!res.ok) throw new Error('Error al actualizar tarea');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
    },
    onError: () => toast.error('Error al actualizar estado de la tarea')
  });
}