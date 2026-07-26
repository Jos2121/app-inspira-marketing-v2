import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// --- Tipos ---
export type AgencyPlan = {
  id: string;
  name: string;
  price: string | number;
  benefits: string[];
  createdAt: string;
};

export type DiagnosticQuestion = {
  id: string;
  question: string;
  createdAt: string;
};

export type DiagnosticResultItem = {
  score: number;
  observation: string;
};

export type DiagnosticRecord = {
  id: string;
  prospectName: string;
  prospectWhatsapp: string;
  dateLimaISO: string;
  results: Record<string, DiagnosticResultItem>;
  reportText: string;
  planId: string | null;
  createdAt: string;
  plan?: AgencyPlan;
};

// --- Hooks de Planes de Agencia ---
export function useAgencyPlans() {
  return useQuery<AgencyPlan[]>({
    queryKey: ['agency-plans'],
    queryFn: async () => {
      const res = await fetch('/api/diagnostic-plans');
      if (!res.ok) throw new Error('Error al cargar planes');
      return res.json();
    }
  });
}

export function useCreateAgencyPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; price: number; benefits: string[] }) => {
      const res = await fetch('/api/diagnostic-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al crear plan');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agency-plans'] });
      toast.success('Plan guardado exitosamente');
    },
    onError: () => toast.error('Error al crear plan')
  });
}

export function useDeleteAgencyPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/diagnostic-plans/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agency-plans'] });
      toast.success('Plan eliminado');
    },
    onError: () => toast.error('Error al eliminar plan')
  });
}

// --- Hooks de Preguntas del Checklist ---
export function useDiagnosticQuestions() {
  return useQuery<DiagnosticQuestion[]>({
    queryKey: ['diagnostic-questions'],
    queryFn: async () => {
      const res = await fetch('/api/diagnostic-questions');
      if (!res.ok) throw new Error('Error al cargar checklist');
      return res.json();
    }
  });
}

export function useCreateDiagnosticQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (question: string) => {
      const res = await fetch('/api/diagnostic-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al añadir ítem');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnostic-questions'] });
      toast.success('Ítem añadido al checklist');
    },
    onError: (error) => toast.error(error.message)
  });
}

export function useUpdateDiagnosticQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, question }: { id: string; question: string }) => {
      const res = await fetch(`/api/diagnostic-questions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      if (!res.ok) throw new Error('Error al actualizar ítem');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnostic-questions'] });
      toast.success('Ítem actualizado');
    },
    onError: () => toast.error('Error al actualizar ítem')
  });
}

export function useDeleteDiagnosticQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/diagnostic-questions/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['diagnostic-questions'] }),
    onError: () => toast.error('Error al eliminar ítem')
  });
}

// --- Hooks del Historial y Generación AI ---
export function useGenerateDiagnosticReport() {
  return useMutation({
    mutationFn: async (data: { prospectName: string; results: Record<string, DiagnosticResultItem> }) => {
      const res = await fetch('/api/diagnostic/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error en el análisis de IA');
      return res.json();
    }
  });
}

export function useDiagnosticRecords() {
  return useQuery<DiagnosticRecord[]>({
    queryKey: ['diagnostic-records'],
    queryFn: async () => {
      const res = await fetch('/api/diagnostic-records');
      if (!res.ok) throw new Error('Error al cargar historial');
      return res.json();
    }
  });
}

export function useCreateDiagnosticRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<DiagnosticRecord>) => {
      const res = await fetch('/api/diagnostic-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al guardar historial');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnostic-records'] });
      toast.success('Auditoría guardada exitosamente');
    },
    onError: () => toast.error('Error al guardar auditoría')
  });
}

export function useDeleteDiagnosticRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/diagnostic-records/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnostic-records'] });
      toast.success('Auditoría eliminada del historial');
    },
    onError: () => toast.error('Error al eliminar auditoría')
  });
}

// --- Hook Búsqueda DNI ---
export function useSearchDNI() {
  return useMutation({
    mutationFn: async (dni: string) => {
      const res = await fetch(`/api/dni/${dni}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al consultar DNI');
      }
      return res.json();
    }
  });
}