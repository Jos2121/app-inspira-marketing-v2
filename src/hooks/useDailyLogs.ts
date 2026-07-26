import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useDeleteDailyLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/daily-logs/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar el registro');
      return res.json();
    },
    onSuccess: () => {
      // Al eliminar un registro, invalidamos las metas para que se recalcule el progreso y el monto
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Registro eliminado');
    },
    onError: () => toast.error('Error al eliminar el registro')
  });
}