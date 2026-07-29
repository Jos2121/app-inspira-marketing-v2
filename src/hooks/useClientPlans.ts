import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type ClientPlan = {
  id: string;
  name: string;
  benefits: string[];
  createdAt: string;
};

export function useClientPlans() {
  return useQuery<ClientPlan[]>({
    queryKey: ['client-plans'],
    queryFn: async () => {
      const res = await fetch('/api/client-plans');
      if (!res.ok) throw new Error('Error al cargar planes de clientes');
      return res.json();
    }
  });
}

export function useCreateClientPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; benefits: string[] }) => {
      const res = await fetch('/api/client-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al crear el plan');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-plans'] });
      toast.success('Plan de cliente creado exitosamente');
    },
    onError: () => toast.error('Error al crear el plan')
  });
}

export function useUpdateClientPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string; benefits: string[] } }) => {
      const res = await fetch(`/api/client-plans/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al actualizar el plan');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-plans'] });
      toast.success('Plan actualizado correctamente');
    },
    onError: () => toast.error('Error al actualizar el plan')
  });
}

export function useDeleteClientPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/client-plans/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar el plan');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-plans'] });
      toast.success('Plan eliminado');
    },
    onError: () => toast.error('Error al eliminar el plan')
  });
}