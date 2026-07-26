import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { usePlans, useCreateComplianceRecord } from '@/hooks/useCompliance';
import { getCurrentDateLimaISO } from '@/lib/date-utils';
import { toast } from 'sonner';

export function AssignPlanModal() {
  const [open, setOpen] = useState(false);
  const { data: clients = [] } = useClients();
  const { data: plans = [] } = usePlans();
  const assignMutation = useCreateComplianceRecord();

  const [clientId, setClientId] = useState('');
  const [planId, setPlanId] = useState('');
  const [monthYear, setMonthYear] = useState(getCurrentDateLimaISO().substring(0, 7)); // YYYY-MM

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !planId) {
      toast.error('Debes seleccionar un cliente y un plan');
      return;
    }

    assignMutation.mutate({ clientId, planId, monthYear }, {
      onSuccess: () => {
        setOpen(false);
        setClientId('');
        setPlanId('');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-1 rounded-xl h-10 px-5">
          <Plus className="w-4 h-4 mr-2" /> Asignar Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Asignar Seguimiento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger className="focus:ring-blue-600/20 bg-white/50">
                <SelectValue placeholder="Seleccionar cliente..." />
              </SelectTrigger>
              <SelectContent>
                {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Plan a Asignar</Label>
            <Select value={planId} onValueChange={setPlanId}>
              <SelectTrigger className="focus:ring-blue-600/20 bg-white/50">
                <SelectValue placeholder="Seleccionar plan..." />
              </SelectTrigger>
              <SelectContent>
                {plans.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthYear">Mes y Año</Label>
            <Input 
              id="monthYear" 
              type="month" 
              required 
              value={monthYear}
              onChange={(e) => setMonthYear(e.target.value)}
              className="bg-white/50 focus-visible:ring-blue-600/20" 
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 h-11 mt-4 rounded-xl shadow-lg shadow-blue-600/20" 
            disabled={assignMutation.isPending}
          >
            {assignMutation.isPending ? 'Asignando...' : 'Asignar Plan'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}