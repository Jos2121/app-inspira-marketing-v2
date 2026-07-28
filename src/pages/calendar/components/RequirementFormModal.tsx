import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePartners } from '@/hooks/usePartners';
import { Requirement } from '@/hooks/useRequirements';
import { getCurrentDateLimaISO } from '@/lib/date-utils';

interface RequirementFormModalProps {
  requirement?: Requirement | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isPending: boolean;
}

export function RequirementFormModal({ requirement, isOpen, onClose, onSubmit, isPending }: RequirementFormModalProps) {
  const { data: partners = [] } = usePartners();
  
  const [formData, setFormData] = useState({
    content: '',
    requesterId: '',
    assigneeId: '',
    deadline: getCurrentDateLimaISO(),
    status: 'Pendiente'
  });

  useEffect(() => {
    if (requirement) {
      setFormData({
        content: requirement.content,
        requesterId: requirement.requesterId,
        assigneeId: requirement.assigneeId,
        deadline: requirement.deadline,
        status: requirement.status
      });
    } else {
      setFormData({
        content: '',
        requesterId: '',
        assigneeId: '',
        deadline: getCurrentDateLimaISO(),
        status: 'Pendiente'
      });
    }
  }, [requirement, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[450px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {requirement ? 'Editar Requerimiento' : 'Nuevo Requerimiento'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Requerimiento *</Label>
            <Textarea 
              required 
              value={formData.content} 
              onChange={e => setFormData({...formData, content: e.target.value})} 
              className="resize-none h-24 focus-visible:ring-blue-600/20"
              placeholder="Describe lo que se necesita..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quien Requiere *</Label>
              <Select required value={formData.requesterId} onValueChange={v => setFormData({...formData, requesterId: v})}>
                <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>
                  {partners.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Asignado A *</Label>
              <Select required value={formData.assigneeId} onValueChange={v => setFormData({...formData, assigneeId: v})}>
                <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>
                  {partners.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Fecha Límite *</Label>
            <Input 
              type="date" 
              required 
              value={formData.deadline} 
              onChange={e => setFormData({...formData, deadline: e.target.value})} 
              className="focus-visible:ring-blue-600/20"
            />
          </div>

          {requirement && (
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="Realizado">Realizado</SelectItem>
                  <SelectItem value="Con Observaciones">Con Observaciones</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-11 mt-4 rounded-xl" disabled={isPending}>
            {isPending ? 'Guardando...' : requirement ? 'Actualizar Requerimiento' : 'Crear y Notificar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}