import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Edit } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { usePartners } from '@/hooks/usePartners';
import { useUpdateObjective, Objective } from '@/hooks/useObjectives';
import { toast } from 'sonner';

interface EditObjectiveModalProps {
  objective: Objective;
  isOpen: boolean;
  onClose: () => void;
}

export function EditObjectiveModal({ objective, isOpen, onClose }: EditObjectiveModalProps) {
  const { data: clients = [] } = useClients();
  const { data: partners = [] } = usePartners();
  
  const updateMutation = useUpdateObjective();

  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState('');
  const [deadline, setDeadline] = useState('');

  const [tasks, setTasks] = useState<{ id?: string, title: string; partnerId: string | null; deadline: string }[]>([]);
  
  const [currentTaskTitle, setCurrentTaskTitle] = useState('');
  const [currentPartnerId, setCurrentPartnerId] = useState('none');
  const [currentTaskDeadline, setCurrentTaskDeadline] = useState('');

  useEffect(() => {
    if (objective && isOpen) {
      setTitle(objective.title);
      setClientId(objective.clientId);
      setDeadline(objective.deadline);
      setTasks(objective.tasks.map(t => ({ 
        id: t.id, 
        title: t.title, 
        partnerId: t.partnerId, 
        deadline: t.deadline || ''
      })));
      setCurrentTaskTitle('');
      setCurrentPartnerId('none');
      setCurrentTaskDeadline('');
    }
  }, [objective, isOpen]);

  const handleUpdateTaskField = (index: number, field: string, value: string | null) => {
    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], [field]: value === 'none' ? null : value };
    setTasks(newTasks);
  };

  const handleAddTask = () => {
    if (!currentTaskTitle.trim() || !currentTaskDeadline) {
      toast.error('Escribe el título y la fecha límite de la tarea');
      return;
    }
    
    setTasks([
      ...tasks, 
      { 
        title: currentTaskTitle.trim(), 
        partnerId: currentPartnerId === 'none' ? null : currentPartnerId,
        deadline: currentTaskDeadline
      }
    ]);
    
    setCurrentTaskTitle('');
    setCurrentPartnerId('none');
    setCurrentTaskDeadline('');
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
      toast.error('Debes tener al menos una tarea en el objetivo');
      return;
    }

    const hasEmptyTasks = tasks.some(t => !t.title.trim() || !t.deadline);
    if (hasEmptyTasks) {
      toast.error('Todas las tareas deben tener un título y una fecha límite.');
      return;
    }

    const payload = { title, clientId, deadline, tasks };
    updateMutation.mutate({ id: objective.id, data: payload }, {
      onSuccess: () => onClose()
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[700px] rounded-[2rem] max-h-[90vh] overflow-y-auto no-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Edit className="w-5 h-5 text-blue-600" />
            Editar Objetivo de Campaña
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre del Objetivo *</Label>
              <Input 
                required 
                placeholder="Ej. Lanzamiento de Campaña..."
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
                <Label>Fecha Límite del Objetivo *</Label>
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
            <Label className="text-zinc-800 font-bold text-base">Edición de Tareas / Requisitos</Label>
            
            {tasks.length > 0 && (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                {tasks.map((task, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center bg-white border border-zinc-200 p-2.5 rounded-xl shadow-sm">
                    <Input 
                      value={task.title}
                      onChange={e => handleUpdateTaskField(idx, 'title', e.target.value)}
                      placeholder="Título de la tarea"
                      className="flex-1 h-9 bg-zinc-50"
                      required
                    />
                    <Select value={task.partnerId || 'none'} onValueChange={v => handleUpdateTaskField(idx, 'partnerId', v)}>
                      <SelectTrigger className="w-full sm:w-[130px] h-9 bg-zinc-50">
                        <SelectValue placeholder="Socio..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin asignar</SelectItem>
                        {partners.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input 
                      type="date"
                      value={task.deadline}
                      onChange={e => handleUpdateTaskField(idx, 'deadline', e.target.value)}
                      className="w-full sm:w-[130px] h-9 bg-zinc-50"
                      required
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemoveTask(idx)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 h-9 w-9 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end bg-blue-50/50 p-4 rounded-2xl border border-blue-100 mt-4">
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
              <div className="space-y-2 w-full sm:w-[130px]">
                <Label className="text-xs text-zinc-500 uppercase tracking-wider">Responsable</Label>
                <Select value={currentPartnerId} onValueChange={setCurrentPartnerId}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Opcional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin asignar</SelectItem>
                    {partners.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 w-full sm:w-[130px]">
                <Label className="text-xs text-zinc-500 uppercase tracking-wider">Límite *</Label>
                <Input 
                  type="date" 
                  value={currentTaskDeadline}
                  onChange={(e) => setCurrentTaskDeadline(e.target.value)}
                  className="bg-white"
                />
              </div>
              <Button 
                type="button" 
                onClick={handleAddTask} 
                className="w-full sm:w-auto shrink-0 bg-zinc-900 hover:bg-zinc-800 text-white"
              >
                Añadir
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-12 rounded-xl text-md shadow-lg shadow-blue-600/20 mt-4" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Guardando Cambios...' : 'Actualizar Objetivo'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}