import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useCreateTransaction, TransactionType } from '@/hooks/useFinance';
import { toast } from 'sonner';
import { getCurrentDateLimaISO } from '@/lib/date-utils';

export function TransactionFormModal() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<TransactionType>('Ingreso');
  const createMutation = useCreateTransaction();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = parseFloat(formData.get('amount') as string);
    const category = formData.get('category') as string;
    const date = formData.get('date') as string;
    const description = formData.get('description') as string;

    if (amount <= 0) {
      toast.error('El monto debe ser mayor a cero');
      return;
    }

    createMutation.mutate({
      type,
      category,
      amount,
      date,
      description,
    }, {
      onSuccess: () => {
        setOpen(false);
        setType('Ingreso'); // reset
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-1">
          <Plus className="w-4 h-4 mr-2" /> Nueva Transacción
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Registrar Movimiento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={(val: TransactionType) => setType(val)}>
                <SelectTrigger className="focus:ring-blue-600/20 focus:border-blue-600">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ingreso">Ingreso</SelectItem>
                  <SelectItem value="Gasto">Gasto</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Input 
              id="category" 
              name="category" 
              required 
              placeholder="Ej. Servicios, Software, Planilla..." 
              className="focus-visible:ring-blue-600/20 focus-visible:border-blue-600" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Monto (Soles)</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-zinc-500 text-sm">S/</span>
              <Input 
                id="amount" 
                name="amount" 
                type="number" 
                step="0.01" 
                min="0.01" 
                required 
                placeholder="0.00" 
                className="pl-8 focus-visible:ring-blue-600/20 focus-visible:border-blue-600" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción (Opcional)</Label>
            <Input 
              id="description" 
              name="description" 
              placeholder="Detalles de la transacción" 
              className="focus-visible:ring-blue-600/20 focus-visible:border-blue-600" 
            />
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-11 mt-4" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Guardando...' : 'Guardar Transacción'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}