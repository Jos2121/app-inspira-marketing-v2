import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { useCreateGoal } from '@/hooks/useGoals';
import { toast } from 'sonner';
import { getCurrentDateLimaISO } from '@/lib/date-utils';

export function CreateGoalModal() {
  const [open, setOpen] = useState(false);
  const [clientId, setClientId] = useState('');
  const { data: clients } = useClients();
  const createMutation = useCreateGoal();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!clientId) {
      toast.error('Debes seleccionar un cliente');
      return;
    }

    const formData = new FormData(e.currentTarget);
    const targetPatients = parseInt(formData.get('targetPatients') as string);
    const costPerPatient = parseFloat(formData.get('costPerPatient') as string);

    if (targetPatients <= 0 || costPerPatient <= 0) {
      toast.error('Los valores deben ser mayores a cero');
      return;
    }

    createMutation.mutate({
      clientId,
      monthYear: formData.get('monthYear') as string,
      targetPatients,
      costPerPatient,
    }, {
      onSuccess: () => {
        setOpen(false);
        setClientId('');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-1">
          <Plus className="w-4 h-4 mr-2" /> Nueva Meta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Establecer Meta Mensual</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Cliente / Doctor</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger className="focus:ring-blue-600/20 focus:border-blue-600">
                <SelectValue placeholder="Seleccionar cliente..." />
              </SelectTrigger>
              <SelectContent>
                {clients?.map((client) => (
                  <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="monthYear">Mes y Año</Label>
            <Input 
              id="monthYear" 
              name="monthYear" 
              type="month" 
              required 
              defaultValue={getCurrentDateLimaISO().substring(0, 7)}
              className="focus-visible:ring-blue-600/20 focus-visible:border-blue-600" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetPatients">Meta (Pacientes)</Label>
              <Input id="targetPatients" name="targetPatients" type="number" min="1" required placeholder="Ej. 100" className="focus-visible:ring-blue-600/20 focus-visible:border-blue-600" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="costPerPatient">Pago por Paciente</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-zinc-500 text-sm">S/</span>
                <Input id="costPerPatient" name="costPerPatient" type="number" step="0.01" min="0.1" required placeholder="0.00" className="pl-8 focus-visible:ring-blue-600/20 focus-visible:border-blue-600" />
              </div>
            </div>
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-11 mt-4" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Guardando...' : 'Guardar Meta'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}