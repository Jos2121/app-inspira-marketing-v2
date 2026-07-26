import { useState } from 'react';
import { useWorkflows, useCreateWorkflow, useDeleteWorkflow } from '@/hooks/useWorkflows';
import { Network, Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WorkflowBoard } from './components/WorkflowBoard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function Workflows() {
  const { data: workflows = [], isLoading } = useWorkflows();
  const createMutation = useCreateWorkflow();
  const deleteMutation = useDeleteWorkflow();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Seleccionar el primero por defecto
  const activeWorkflow = workflows.find(w => w.id === selectedId) || workflows[0];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkflowName.trim()) return;
    createMutation.mutate(newWorkflowName, {
      onSuccess: () => {
        setNewWorkflowName('');
        setIsCreating(false);
      }
    });
  };

  const handleDelete = () => {
    if (!activeWorkflow) return;
    deleteMutation.mutate(activeWorkflow.id, {
      onSuccess: () => setSelectedId(null) 
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 flex items-center gap-3">
            <Network className="w-8 h-8 text-blue-600" />
            Flujos de Trabajo
          </h2>
          <p className="text-zinc-500 mt-2 font-medium">Asigna funciones visualmente a los miembros de tu equipo arrastrando las tarjetas.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {workflows.length > 0 && (
            <Select value={activeWorkflow?.id || ''} onValueChange={setSelectedId}>
              <SelectTrigger className="w-full md:w-[250px] bg-white h-11 rounded-xl shadow-sm border-zinc-200">
                <SelectValue placeholder="Seleccionar flujo..." />
              </SelectTrigger>
              <SelectContent>
                {workflows.map(w => (
                  <SelectItem key={w.id} value={w.id} className="font-medium">{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {!isCreating ? (
            <Button onClick={() => setIsCreating(true)} className="h-11 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white shrink-0">
              <Plus className="w-4 h-4 mr-2" /> Nuevo Flujo
            </Button>
          ) : (
            <form onSubmit={handleCreate} className="flex gap-2 animate-in fade-in slide-in-from-right-4">
              <Input 
                autoFocus
                placeholder="Nombre del flujo..." 
                className="h-11 bg-white"
                value={newWorkflowName}
                onChange={e => setNewWorkflowName(e.target.value)}
              />
              <Button type="submit" className="h-11 bg-blue-600 hover:bg-blue-700" disabled={createMutation.isPending}>
                Guardar
              </Button>
              <Button type="button" variant="ghost" onClick={() => setIsCreating(false)} className="h-11">Cancelar</Button>
            </form>
          )}
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 glass rounded-[2.5rem] border border-zinc-200/60 shadow-sm p-6 overflow-hidden flex flex-col relative min-h-[600px]">
        {workflows.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <Network className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900">Aún no tienes flujos de trabajo</h3>
            <p className="text-zinc-500 mt-2 max-w-md">Crea tu primer flujo para comenzar a asignar tareas arrastrables a tu equipo.</p>
            <Button onClick={() => setIsCreating(true)} className="mt-6 rounded-xl bg-blue-600 hover:bg-blue-700 h-12 px-6">
              <Plus className="w-5 h-5 mr-2" /> Crear Primer Flujo
            </Button>
          </div>
        ) : activeWorkflow ? (
          <>
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h3 className="text-2xl font-bold text-zinc-800">{activeWorkflow.name}</h3>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="w-4 h-4 mr-2" /> Eliminar Flujo
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-[2rem]">
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar mapa de flujo?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Se eliminará el flujo "{activeWorkflow.name}". Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 rounded-xl">Eliminar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            
            <WorkflowBoard workflow={activeWorkflow} />
          </>
        ) : null}
      </div>
    </div>
  );
}