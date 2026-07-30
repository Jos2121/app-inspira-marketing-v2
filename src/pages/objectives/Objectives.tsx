import { useState } from 'react';
import { useObjectives, useDeleteObjective, Objective } from '@/hooks/useObjectives';
import { useClients } from '@/hooks/useClients';
import { CreateObjectiveModal } from './components/CreateObjectiveModal';
import { EditObjectiveModal } from './components/EditObjectiveModal';
import { ObjectiveCard } from './components/ObjectiveCard';
import { CheckCircle2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Objectives() {
  const { data: objectives = [], isLoading } = useObjectives();
  const { data: clients = [] } = useClients();
  const deleteMutation = useDeleteObjective();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);

  // Estados para filtros
  const [clientFilter, setClientFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('');

  const handleEdit = (objective: Objective) => {
    setEditingObjective(objective);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const clearFilters = () => {
    setClientFilter('all');
    setMonthFilter('');
  };

  // Lógica de filtrado
  const filteredObjectives = objectives.filter(obj => {
    const matchesClient = clientFilter === 'all' || obj.clientId === clientFilter;
    const matchesMonth = monthFilter === '' || obj.deadline.startsWith(monthFilter);
    return matchesClient && matchesMonth;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-both">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-blue-600" />
            Objetivos de Proyectos
          </h2>
          <p className="text-zinc-500 mt-2 font-medium">
            Planifica y haz seguimiento de campañas, lanzamientos o metas multitaréa.
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-1">
          <Plus className="w-4 h-4 mr-2" /> Nuevo Objetivo
        </Button>
      </div>

      <CreateObjectiveModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />

      {editingObjective && (
        <EditObjectiveModal
          objective={editingObjective}
          isOpen={!!editingObjective}
          onClose={() => setEditingObjective(null)}
        />
      )}

      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white/50 p-4 rounded-2xl border border-zinc-200/60 shadow-sm justify-between items-center animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1">
          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger className="w-full sm:w-[250px] bg-white border-zinc-200">
              <SelectValue placeholder="Todos los clientes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los clientes</SelectItem>
              {clients.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2 w-full sm:w-auto">
            <Input 
              type="month" 
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="bg-white border-zinc-200 w-full sm:w-[180px]"
            />
            {(clientFilter !== 'all' || monthFilter !== '') && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={clearFilters} 
                className="text-zinc-400 hover:text-red-500 hover:bg-red-50 shrink-0"
                title="Limpiar filtros"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="text-sm text-zinc-500 font-medium whitespace-nowrap self-end sm:self-auto">
          {filteredObjectives.length} {filteredObjectives.length === 1 ? 'objetivo' : 'objetivos'}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-80 bg-zinc-100/50 rounded-[2rem] animate-pulse"></div>
          ))}
        </div>
      ) : filteredObjectives.length === 0 ? (
        <div className="text-center py-24 glass rounded-[2.5rem] border border-dashed border-zinc-200/80 mt-4">
          <CheckCircle2 className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-zinc-900">
            {objectives.length === 0 ? 'No hay objetivos activos' : 'No se encontraron resultados'}
          </h3>
          <p className="text-zinc-500 mt-2 max-w-sm mx-auto">
            {objectives.length === 0 
              ? 'Crea tu primer objetivo para desglosar requerimientos grandes en tareas asignables.' 
              : 'Prueba cambiando los filtros de cliente o mes para ver otros resultados.'}
          </p>
          {objectives.length > 0 && (
            <Button variant="link" onClick={clearFilters} className="mt-2 text-blue-600">
              Limpiar filtros
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2 animate-in fade-in duration-700 delay-100 fill-both">
          {filteredObjectives.map(objective => (
            <ObjectiveCard 
              key={objective.id} 
              objective={objective} 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
            />
          ))}
        </div>
      )}
    </div>
  );
}