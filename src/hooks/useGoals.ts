import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type DailyLog = {
  id: string;
  goalId: string;
  date: string;
  count: number;
  createdAt: string;
};

export type Goal = {
  id: string;
  clientId: string;
  monthYear: string;
  targetPatients: number;
  costPerPatient: string | number;
  createdAt: string;
  dailyLogs: DailyLog[];
};

export function useGoals() {
  return useQuery<Goal[]>({
    queryKey: ['goals'],
    queryFn: async () => {
      const res = await fetch('/api/goals');
      if (!res.ok) throw new Error('Error al cargar metas');
      return res.json();
    }
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goalData: { clientId: string; monthYear: string; targetPatients: number; costPerPatient: number }) => {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalData),
      });
      if (!res.ok) throw new Error('Error al crear meta');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Meta creada exitosamente');
    },
    onError: () => toast.error('Error al crear meta')
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/goals/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar meta');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Meta eliminada');
    },
    onError: () => toast.error('Error al eliminar meta')
  });
}

export function useAddDailyLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { goalId: string; date: string; count: number }) => {
      const res = await fetch(`/api/goals/${data.goalId}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: data.date, count: data.count }),
      });
      if (!res.ok) throw new Error('Error al registrar avance');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Avance registrado correctamente');
    },
    onError: () => toast.error('Error al registrar avance')
  });
}