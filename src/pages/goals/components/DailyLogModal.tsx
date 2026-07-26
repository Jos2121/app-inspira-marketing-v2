import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ClipboardEdit } from 'lucide-react';
import { useAddDailyLog } from '@/hooks/useGoals';
import { toast } from 'sonner';
import { getCurrentDateLimaISO } from '@/lib/date-utils';

export function DailyLogModal({ goalId }: { goalId: string }) {
  const [open, setOpen] = useState(false);
  const addLogMutation = useAddDailyLog();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const count = parseInt(formData.get('count') as string);
    const date = formData.get('date') as string;

    if (count <= 0) {
      toast.error('La cantidad debe ser mayor a cero');
      return;
    }

    addLogMutation.mutate({ goalId, date, count }, {
      onSuccess: () => setOpen(false)
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="bg-white/50 border-blue-200 text-blue-700 hover:bg-blue-50">
          <ClipboardEdit className="w-4 h-4 mr-2" /> Registrar Avance
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[380px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Registro Diario</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Input 
              id="date" 
              name="date" 
              type="date" 
              required 
              defaultValue={getCurrentDateLimaISO()} 
              className="focus-visible:ring-blue-600/20 focus-visible:border-blue-600" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="count">Pacientes Atendidos</Label>
            <Input id="count" name="count" type="number" min="1" required placeholder="Cantidad" className="focus-visible:ring-blue-600/20 focus-visible:border-blue-600" />
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-10 mt-2" disabled={addLogMutation.isPending}>
            {addLogMutation.isPending ? 'Agregando...' : 'Agregar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}