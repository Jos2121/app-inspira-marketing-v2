import { useState } from 'react';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { useClients } from '@/hooks/useClients';
import { usePartners } from '@/hooks/usePartners';
import { CalendarView } from './components/CalendarView';
import { RequirementsSection } from './components/RequirementsSection';
import { CalendarObjectives } from './components/CalendarObjectives';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CalendarPage() {
  const { data: tasks = [], isLoading: loadingTasks } = useTasks();
  const { data: clients = [], isLoading: loadingClients } = useClients();
  const { data: partners = [], isLoading: loadingPartners } = usePartners();
  
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();

  const [selectedClientId, setSelectedClientId] = useState('all');
  const [selectedPartnerId, setSelectedPartnerId] = useState('all');

  const isLoading = loadingTasks || loadingClients || loadingPartners;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[750px] glass rounded-[2rem]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesClient = selectedClientId === 'all' || task.clientId === selectedClientId;
    const matchesPartner = selectedPartnerId === 'all' || task.partnerId === selectedPartnerId;
    return matchesClient && matchesPartner;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Encabezado y Filtros */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Calendario Operativo</h2>
          <p className="text-zinc-500 mt-1 font-medium">Gestiona tareas, citas y asignaciones del equipo.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Select value={selectedClientId} onValueChange={setSelectedClientId}>
            <SelectTrigger className="w-full sm:w-[200px] bg-white border-zinc-200">
              <SelectValue placeholder="Todos los clientes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los clientes</SelectItem>
              {clients.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedPartnerId} onValueChange={setSelectedPartnerId}>
            <SelectTrigger className="w-full sm:w-[200px] bg-white border-zinc-200">
              <SelectValue placeholder="Todos los encargados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los encargados</SelectItem>
              {partners.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sección de Objetivos del Mes (Con margen inferior asegurado) */}
      <div className="mb-6">
        <CalendarObjectives />
      </div>

      {/* Vista del Calendario / Cuadrícula */}
      <CalendarView 
        tasks={filteredTasks}
        onTaskCreate={(data) => createMutation.mutate(data)}
        onTaskUpdate={(id, data) => updateMutation.mutate({ id, data })}
        onTaskDelete={(id) => deleteMutation.mutate(id)}
        isPending={createMutation.isPending || updateMutation.isPending}
        isDeleting={deleteMutation.isPending}
      >
        <RequirementsSection 
          clientFilter={selectedClientId} 
          partnerFilter={selectedPartnerId} 
        />
      </CalendarView>
    </div>
  );
}