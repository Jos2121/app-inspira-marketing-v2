import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type Plan = {
  id: string;
  name: string;
  activities: string[];
  createdAt: string;
};

export type ComplianceRecord = {
  id: string;
  clientId: string;
  planId: string;
  monthYear: string;
  checklist: Record<string, boolean>;
  createdAt: string;
  client?: { id: string; name: string };
  plan?: { id: string; name: string };
};

export function usePlans() {
  return useQuery<Plan[]>({
    queryKey: ['plans'],
    queryFn: async () => {
      const res = await fetch('/api/plans');
      if (!res.ok) throw new Error('Error al cargar planes');
      return res.json();
    }
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; activities: string[] }) => {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al crear el plan');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Plan creado exitosamente');
    },
    onError: () => toast.error('Error al crear plan')
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: { name: string; activities: string[] } }) => {
      const res = await fetch(`/api/plans/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al actualizar el plan');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Plan actualizado exitosamente');
    },
    onError: (error) => toast.error(error.message)
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/plans/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error interno al eliminar el plan');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Plan eliminado');
    },
    onError: (error) => toast.error(error.message)
  });
}

export function useComplianceRecords() {
  return useQuery<ComplianceRecord[]>({
    queryKey: ['compliance'],
    queryFn: async () => {
      const res = await fetch('/api/compliance');
      if (!res.ok) throw new Error('Error al cargar seguimientos');
      return res.json();
    }
  });
}

export function useCreateComplianceRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { clientId: string; planId: string; monthYear: string }) => {
      const res = await fetch('/api/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al asignar el plan');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance'] });
      toast.success('Plan asignado correctamente');
    },
    onError: () => toast.error('Error al asignar plan')
  });
}

export function useUpdateComplianceChecklist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, checklist }: { id: string; checklist: Record<string, boolean> }) => {
      const res = await fetch(`/api/compliance/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checklist }),
      });
      if (!res.ok) throw new Error('Error al actualizar el checklist');
      return res.json();
    },
    onSuccess: () => {
      // Invalidation omitted to avoid flickering during fast toggles. 
    },
    onError: () => toast.error('Error al actualizar progreso')
  });
}

export function useDeleteComplianceRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/compliance/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar asignación');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance'] });
      toast.success('Asignación eliminada');
    },
    onError: () => toast.error('Error al eliminar asignación')
  });
}