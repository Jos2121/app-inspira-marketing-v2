import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClients } from '@/hooks/useClients';
import { usePartners } from '@/hooks/usePartners';
import { Task } from '@/hooks/useTasks';
import { Trash2, CalendarClock, AlignLeft, User, Briefcase, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { format as formatTz } from 'date-fns-tz';
import { LIMA_TIMEZONE } from '@/lib/date-utils';
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

interface TaskFormModalProps {
  task?: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  onDelete?: (id: string) => void;
  isPending: boolean;
  isDeleting?: boolean;
  selectedDate?: Date;
  initialEditMode?: boolean;
}

export function TaskFormModal({ task, isOpen, onClose, onSubmit, onDelete, isPending, isDeleting, selectedDate, initialEditMode }: TaskFormModalProps) {
  const [isEditingFull, setIsEditingFull] = useState(false);
  const { data: clients = [] } = useClients();
  const { data: partners = [] } = usePartners();
  
  const getDefaultTimes = (selected?: Date) => {
    if (selected) {
      const dateStr = format(selected, 'yyyy-MM-dd');
      const startHour = format(selected, 'HH:mm');
      
      const endHourDate = new Date(selected);
      endHourDate.setHours(selected.getHours() + 1);
      const endHour = format(endHourDate, 'HH:mm');
      
      return {
        start: `${dateStr}T${startHour}`,
        end: `${dateStr}T${endHour}`
      };
    }
    
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 3600000);
    
    return {
      start: formatTz(now, "yyyy-MM-dd'T'HH:mm", { timeZone: LIMA_TIMEZONE }),
      end: formatTz(oneHourLater, "yyyy-MM-dd'T'HH:mm", { timeZone: LIMA_TIMEZONE })
    };
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: getDefaultTimes(selectedDate).start,
    endTime: getDefaultTimes(selectedDate).end,
    partnerId: 'none',
    clientId: 'none',
    status: 'Pendiente'
  });

  const isEditMode = !!task;

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        startTime: task.startTime,
        endTime: task.endTime,
        partnerId: task.partnerId || 'none',
        clientId: task.clientId || 'none',
        status: task.status
      });
    } else {
      const times = getDefaultTimes(selectedDate);
      setFormData({
        title: '',
        description: '',
        startTime: times.start,
        endTime: times.end,
        partnerId: 'none',
        clientId: 'none',
        status: 'Pendiente'
      });
    }
    setIsEditingFull(initialEditMode || false);
  }, [task, isOpen, selectedDate, initialEditMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      partnerId: formData.partnerId === 'none' ? null : formData.partnerId,
      clientId: formData.clientId === 'none' ? null : formData.clientId,
    });
  };

  const handleDelete = () => {
    if (task && onDelete) {
      onDelete(task.id);
      onClose();
    }
  };

  const selectedPartner = partners.find(p => p.id === formData.partnerId);
  const selectedClient = clients.find(c => c.id === formData.clientId);

  const formatDateTimeView = (isoString: string) => {
    if (!isoString) return '';
    try {
      const normalized = isoString.replace(' ', 'T');
      const parts = normalized.split('T');
      
      const datePart = parts[0];
      const timePart = parts.length > 1 ? parts[1].substring(0, 5) : ''; 
      
      const [year, month, day] = datePart.split('-');
      const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), 12, 0, 0);
      const formattedDate = format(d, "d 'de' MMMM, yyyy", { locale: es });
      
      return timePart ? `${formattedDate} - ${timePart}` : formattedDate;
    } catch (e) {
      return isoString;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[450px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditMode && !isEditingFull ? 'Resumen de la Tarea' : isEditMode ? 'Editar Tarea' : 'Nueva Tarea'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          
          {isEditMode && !isEditingFull ? (
            <div className="space-y-5 mb-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-zinc-900 leading-tight">{formData.title}</h3>
                {formData.description && (
                  <p className="text-zinc-600 mt-2 flex items-start gap-2 text-sm bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                    <AlignLeft className="w-4 h-4 mt-0.5 text-zinc-400 shrink-0" />
                    <span>{formData.description}</span>
                  </p>
                )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 text-blue-600 border-blue-200 hover:bg-blue-50 rounded-xl h-8 px-3"
                  onClick={() => setIsEditingFull(true)}
                >
                  <Edit className="w-3.5 h-3.5 mr-1.5" />
                  Editar
                </Button>
              </div>
              
              <div className="bg-white rounded-xl p-4 space-y-4 border border-zinc-200/60 shadow-sm">
                <div className="flex items-start gap-3 text-sm text-zinc-700">
                  <CalendarClock className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p><span className="font-semibold text-zinc-900">Inicio:</span> {formatDateTimeView(formData.startTime)}</p>
                    <p><span className="font-semibold text-zinc-900">Fin:</span> {formatDateTimeView(formData.endTime)}</p>
                  </div>
                </div>
                
                {(selectedPartner || selectedClient) && <div className="h-px bg-zinc-100 w-full" />}
                
                {selectedPartner && (
                  <div className="flex items-center gap-3 text-sm text-zinc-700">
                    <User className="w-4 h-4 text-emerald-500 shrink-0" />
                    <p><span className="font-semibold text-zinc-900">Asignado a:</span> {selectedPartner.name}</p>
                  </div>
                )}
                
                {selectedClient && (
                  <div className="flex items-center gap-3 text-sm text-zinc-700">
                    <Briefcase className="w-4 h-4 text-purple-500 shrink-0" />
                    <p><span className="font-semibold text-zinc-900">Cliente:</span> {selectedClient.name}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input 
                  required 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  className="focus-visible:ring-blue-600/20" 
                />
              </div>
              
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Input 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  className="focus-visible:ring-blue-600/20"
                  placeholder="Opcional..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Inicio *</Label>
                  <Input 
                    type="datetime-local" 
                    required 
                    value={formData.startTime} 
                    onChange={e => setFormData({...formData, startTime: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fin *</Label>
                  <Input 
                    type="datetime-local" 
                    required 
                    value={formData.endTime} 
                    onChange={e => setFormData({...formData, endTime: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Asignado a</Label>
                  <Select value={formData.partnerId} onValueChange={v => setFormData({...formData, partnerId: v})}>
                    <SelectTrigger><SelectValue placeholder="Socio..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin asignar</SelectItem>
                      {partners.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Select value={formData.clientId} onValueChange={v => setFormData({...formData, clientId: v})}>
                    <SelectTrigger><SelectValue placeholder="Cliente..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ninguno</SelectItem>
                      {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          <div className="space-y-2 pt-2">
            <Label>{isEditMode ? 'Actualizar Estado' : 'Estado de la Tarea'}</Label>
            <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
              <SelectTrigger className="border-blue-200 bg-blue-50/50"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="En Proceso">En Proceso</SelectItem>
                <SelectItem value="Completada">Completada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-3 pt-4 mt-2 border-t border-zinc-100">
            {isEditMode && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    type="button" 
                    variant="outline" 
                    disabled={isDeleting}
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isDeleting ? 'Eliminando...' : 'Eliminar'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-[2rem] z-[100]">
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar tarea?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Se eliminará la tarea permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-600/20"
                    >
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {isEditMode && isEditingFull && (
              <Button
                type="button"
                variant="ghost"
                className="w-full mb-1 text-zinc-500 hover:text-zinc-700 rounded-xl"
                onClick={() => {
                  if (task) {
                    setFormData({
                      title: task.title,
                      description: task.description || '',
                      startTime: task.startTime,
                      endTime: task.endTime,
                      partnerId: task.partnerId || 'none',
                      clientId: task.clientId || 'none',
                      status: task.status
                    });
                  }
                  setIsEditingFull(false);
                }}
              >
                Cancelar Edición
              </Button>
            )}
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl h-11" disabled={isPending}>
              {isPending ? 'Guardando...' : (!isEditMode ? 'Crear Tarea' : isEditingFull ? 'Actualizar Tarea' : 'Guardar Estado')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}