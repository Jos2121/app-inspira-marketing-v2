import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type Requirement = {
  id: string;
  content: string;
  requesterId: string;
  assigneeId: string;
  deadline: string;
  status: string;
  telegramMessageId: string | null;
  feedbackMessage: string | null;
  createdAt: string;
  requester?: { id: string; name: string };
  assignee?: { id: string; name: string };
};

export function useRequirements() {
  return useQuery<Requirement[]>({
    queryKey: ['requirements'],
    queryFn: async () => {
      const res = await fetch('/api/requirements');
      if (!res.ok) throw new Error('Error al cargar requerimientos');
      return res.json();
    }
  });
}

export function useCreateRequirement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Requirement>) => {
      const res = await fetch('/api/requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al crear requerimiento');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirements'] });
      toast.success('Requerimiento creado y enviado a Telegram');
    },
    onError: () => toast.error('Error al crear requerimiento')
  });
}

export function useUpdateRequirement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Requirement> }) => {
      const res = await fetch(`/api/requirements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al actualizar requerimiento');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirements'] });
      toast.success('Requerimiento actualizado');
    },
    onError: () => toast.error('Error al actualizar requerimiento')
  });
}

export function useDeleteRequirement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/requirements/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar requerimiento');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirements'] });
      toast.success('Requerimiento eliminado');
    },
    onError: () => toast.error('Error al eliminar requerimiento')
  });
}