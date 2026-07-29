import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Link as LinkIcon } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Client } from '@/hooks/useClients';
import { useClientPlans } from '@/hooks/useClientPlans';

interface EditClientModalProps {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isPending: boolean;
}

export function EditClientModal({ client, isOpen, onClose, onSubmit, isPending }: EditClientModalProps) {
  const { data: plans = [] } = useClientPlans();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [startDate, setStartDate] = useState('');
  const [planId, setPlanId] = useState('none');
  const [customButtons, setCustomButtons] = useState<{ label: string; url: string }[]>([]);

  useEffect(() => {
    if (client) {
      setName(client.name);
      setPhone(client.phone || '');
      setStartDate(client.startDate || '');
      setPlanId(client.planId || 'none');
      setCustomButtons(client.customButtons || []);
    }
  }, [client, isOpen]);

  const handleAddButton = () => {
    setCustomButtons([...customButtons, { label: '', url: '' }]);
  };

  const handleButtonChange = (index: number, field: 'label' | 'url', value: string) => {
    const newButtons = [...customButtons];
    newButtons[index][field] = value;
    setCustomButtons(newButtons);
  };

  const handleRemoveButton = (index: number) => {
    setCustomButtons(customButtons.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const validButtons = customButtons.filter(b => b.label.trim() !== '' && b.url.trim() !== '');

    onSubmit({ 
      name, 
      phone,
      startDate: startDate || null,
      planId: planId === 'none' ? null : planId,
      customButtons: validButtons
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] rounded-[2rem] max-h-[90vh] overflow-y-auto no-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Editar Cliente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre Completo o Empresa *</Label>
              <Input 
                id="edit-name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
                className="bg-zinc-50 focus-visible:ring-blue-600/20 focus-visible:border-blue-600" 
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phone">WhatsApp / Teléfono *</Label>
                <Input 
                  id="edit-phone" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="bg-zinc-50 font-mono focus-visible:ring-blue-600/20 focus-visible:border-blue-600" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-startDate">Fecha de Inicio</Label>
                <Input 
                  id="edit-startDate" 
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="bg-zinc-50 focus-visible:ring-blue-600/20 focus-visible:border-blue-600" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Plan Asignado</Label>
              <Select value={planId} onValueChange={setPlanId}>
                <SelectTrigger className="bg-zinc-50 focus:ring-blue-600/20">
                  <SelectValue placeholder="Seleccionar plan..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin Plan / Ninguno</SelectItem>
                  {plans.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-zinc-100">
            <div className="flex items-center justify-between">
              <Label className="text-zinc-800 font-bold flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-blue-500" />
                Enlaces Rápidos (Opcional)
              </Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddButton} className="h-8 rounded-lg text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" /> Añadir
              </Button>
            </div>
            
            {customButtons.length === 0 ? (
              <p className="text-sm text-zinc-500 italic">No hay enlaces agregados.</p>
            ) : (
              <div className="space-y-3">
                {customButtons.map((btn, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-zinc-50 p-2 rounded-xl border border-zinc-100">
                    <div className="flex-1 space-y-2">
                      <Input 
                        placeholder="Nombre (Ej. Carpeta Drive)" 
                        value={btn.label}
                        onChange={e => handleButtonChange(idx, 'label', e.target.value)}
                        className="h-8 text-sm bg-white"
                      />
                      <Input 
                        placeholder="https://..." 
                        value={btn.url}
                        onChange={e => handleButtonChange(idx, 'url', e.target.value)}
                        className="h-8 text-sm bg-white"
                      />
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemoveButton(idx)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 mt-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-11 rounded-xl shadow-lg shadow-blue-600/20" disabled={isPending}>
            {isPending ? 'Guardando...' : 'Actualizar Cliente'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}