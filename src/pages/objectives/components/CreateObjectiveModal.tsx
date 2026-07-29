import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Target } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { usePartners } from '@/hooks/usePartners';
import { useCreateObjective } from '@/hooks/useObjectives';
import { toast } from 'sonner';

export function CreateObjectiveModal() {
  const [open, setOpen] = useState(false);
  const { data: clients = [] } = useClients();
  const { data: partners = [] } = usePartners();
  const createMutation = useCreateObjective();

  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState('');
  const [deadline, setDeadline] = useState('');

  const [tasks, setTasks] = useState<{ title: string; partnerId: string | null }[]>([]);
  const [currentTaskTitle, setCurrentTaskTitle] = useState('');
  const [currentPartnerId, setCurrentPartnerId] = useState('none');

  const handleAddTask = () => {
    if (!currentTaskTitle.trim()) {
      toast.error('Escribe el título de la tarea');
      return;
    }
    
    setTasks([
      ...tasks, 
      { 
        title: currentTaskTitle.trim(), 
        partnerId: currentPartnerId === 'none' ? null : currentPartnerId 
      }
    ]);
    
    setCurrentTaskTitle('');
    setCurrentPartnerId('none');
  };

  const handleRemoveTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      toast.error('Debes seleccionar un cliente');
      return;
    }
    if (tasks.length === 0) {
      toast.error('Debes añadir al menos una tarea al objetivo');
      return;
    }

    createMutation.mutate({
      title,
      clientId,
      deadline,
      tasks
    }, {
      onSuccess: () => {
        setOpen(false);
        setTitle('');
        setClientId('');
        setDeadline('');
        setTasks([]);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-1">
          <Plus className="w-4 h-4 mr-2" /> Nuevo Objetivo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] rounded-[2rem] max-h-[90vh] overflow-y-auto no-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Crear Objetivo de Campaña
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre del Objetivo *</Label>
              <Input 
                required 
                placeholder="Ej. Lanzamiento de Campaña de Implantes"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="focus-visible:ring-blue-600/20 bg-zinc-50" 
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cliente *</Label>
                <Select value={clientId} onValueChange={setClientId} required>
                  <SelectTrigger className="bg-zinc-50 focus:ring-blue-600/20">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Fecha y Hora Límite *</Label>
                <Input 
                  type="datetime-local" 
                  required 
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="bg-zinc-50 focus-visible:ring-blue-600/20" 
                />
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-100 pt-4 space-y-4">
            <Label className="text-zinc-800 font-bold text-base">Lista de Tareas / Requisitos</Label>
            
            {/* Formulario temporal para añadir tareas */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
              <div className="space-y-2 flex-1 w-full">
                <Label className="text-xs text-zinc-500 uppercase tracking-wider">Nueva Tarea</Label>
                <Input 
                  placeholder="Ej. Diseñar creatividades..." 
                  value={currentTaskTitle}
                  onChange={(e) => setCurrentTaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTask())}
                  className="bg-white"
                />
              </div>
              <div className="space-y-2 w-full sm:w-[160px]">
                <Label className="text-xs text-zinc-500 uppercase tracking-wider">Responsable</Label>
                <Select value={currentPartnerId} onValueChange={setCurrentPartnerId}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Opcional..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin asignar</SelectItem>
                    {partners.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                type="button" 
                onClick={handleAddTask} 
                className="w-full sm:w-auto shrink-0 bg-zinc-900 hover:bg-zinc-800 text-white"
              >
                Añadir
              </Button>
            </div>

            {/* Lista de tareas agregadas */}
            {tasks.length > 0 && (
              <div className="space-y-2 mt-4 max-h-[200px] overflow-y-auto pr-2 no-scrollbar">
                {tasks.map((task, idx) => {
                  const partner = partners.find(p => p.id === task.partnerId);
                  return (
                    <div key={idx} className="flex items-center justify-between bg-white border border-zinc-200 p-3 rounded-xl shadow-sm">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-zinc-800">{task.title}</span>
                        <span className="text-xs text-zinc-500">
                          {partner ? `Resp: ${partner.name}` : 'Sin asignar'}
                        </span>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleRemoveTask(idx)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
            
            {tasks.length === 0 && (
              <p className="text-sm text-zinc-500 text-center py-4 italic">No hay tareas agregadas. Añade las tareas que se deben cumplir.</p>
            )}
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-12 rounded-xl text-md shadow-lg shadow-blue-600/20 mt-4" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Guardando...' : 'Guardar Objetivo Completo'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}