import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Settings2, Edit2, X } from 'lucide-react';
import { useAgencyPlans, useCreateAgencyPlan, useDeleteAgencyPlan } from '@/hooks/useDiagnostic';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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

export function DiagnosticPlans() {
  const [open, setOpen] = useState(false);
  const { data: plans = [], isLoading } = useAgencyPlans();
  const createPlan = useCreateAgencyPlan();
  const deletePlan = useDeleteAgencyPlan();
  const queryClient = useQueryClient();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [benefits, setBenefits] = useState<string[]>(['']);

  const updatePlan = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string; price: number; benefits: string[] } }) => {
      const res = await fetch(`/api/diagnostic-plans/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al actualizar');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agency-plans'] });
      toast.success('Plan actualizado correctamente');
      cancelEdit();
    },
    onError: () => toast.error('Error al actualizar plan')
  });

  const handleAddBenefit = () => setBenefits([...benefits, '']);
  
  const handleBenefitChange = (index: number, value: string) => {
    const newBenefits = [...benefits];
    newBenefits[index] = value;
    setBenefits(newBenefits);
  };

  const handleRemoveBenefit = (index: number) => {
    if (benefits.length === 1) return;
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  const handleEdit = (plan: any) => {
    setEditingId(plan.id);
    setName(plan.name);
    setPrice(plan.price.toString());
    setBenefits([...plan.benefits]);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName('');
    setPrice('');
    setBenefits(['']);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validBenefits = benefits.filter(b => b.trim() !== '');
    const priceNum = parseFloat(price);

    if (!name.trim() || validBenefits.length === 0 || isNaN(priceNum) || priceNum <= 0) {
      toast.error('Completa el nombre, precio y al menos un beneficio válido.');
      return;
    }

    if (editingId) {
      updatePlan.mutate({ id: editingId, data: { name, price: priceNum, benefits: validBenefits } });
    } else {
      createPlan.mutate({ name, price: priceNum, benefits: validBenefits }, {
        onSuccess: () => cancelEdit()
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) cancelEdit();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-white/50 border-blue-200 text-blue-700 hover:bg-blue-50 shadow-sm rounded-xl">
          <Settings2 className="w-4 h-4 mr-2" /> Configurar Planes
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] rounded-[2rem] max-h-[85vh] overflow-y-auto no-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Planes de la Agencia</DialogTitle>
          <p className="text-sm text-zinc-500">Define los planes que el algoritmo podrá sugerir.</p>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="bg-zinc-50/80 p-5 rounded-2xl border border-zinc-200/60 relative">
            {editingId && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-3 right-3 h-8 w-8 text-zinc-400 hover:text-zinc-600 bg-white shadow-sm rounded-full"
                onClick={cancelEdit}
                title="Cancelar edición"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
            <h3 className="font-semibold text-zinc-900 mb-4 text-sm uppercase tracking-wide">
              {editingId ? 'Editar Plan' : 'Crear Plan'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre del Plan</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ej. Plan Pro WhatsApp" className="bg-white" />
              </div>
              <div className="space-y-2">
                <Label>Precio Mensual (PEN)</Label>
                <Input value={price} onChange={e => setPrice(e.target.value)} type="number" step="0.01" min="1" placeholder="990.00" className="bg-white" />
              </div>
              <div className="space-y-2">
                <Label>Beneficios a solucionar</Label>
                {benefits.map((ben, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <Input value={ben} onChange={e => handleBenefitChange(idx, e.target.value)} placeholder="Ej. Gestión de Leads" className="bg-white text-sm h-9" />
                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 hover:text-red-500" onClick={() => handleRemoveBenefit(idx)} disabled={benefits.length === 1}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="ghost" size="sm" onClick={handleAddBenefit} className="text-blue-600 mt-1 h-8 w-full border border-dashed border-blue-200">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Añadir Beneficio
                </Button>
              </div>
              <Button 
                type="submit" 
                className={`w-full h-10 mt-2 ${editingId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`} 
                disabled={createPlan.isPending || updatePlan.isPending}
              >
                {createPlan.isPending || updatePlan.isPending ? 'Guardando...' : editingId ? 'Actualizar Plan' : 'Guardar Plan'}
              </Button>
            </form>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-zinc-900 mb-4 text-sm uppercase tracking-wide">Planes Activos ({plans.length})</h3>
            {isLoading ? (
              <div className="animate-pulse space-y-2"><div className="h-20 bg-zinc-100 rounded-xl"></div></div>
            ) : plans.length === 0 ? (
              <p className="text-sm text-zinc-500">Aún no hay planes.</p>
            ) : (
              <div className="space-y-3">
                {plans.map((p: any) => (
                  <div key={p.id} className={`bg-white border p-3 rounded-xl shadow-sm relative group transition-all duration-200 ${editingId === p.id ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-zinc-200 hover:border-blue-200'}`}>
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-50 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-zinc-100 p-0.5">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-zinc-400 hover:text-amber-500 hover:bg-amber-50"
                        onClick={() => handleEdit(p)}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-red-500 hover:bg-red-50">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-[2rem] z-[100]">
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar plan?</AlertDialogTitle>
                            <AlertDialogDescription>
                              El plan será eliminado de forma permanente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deletePlan.mutate(p.id)}
                              className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-600/20"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>

                    <h4 className="font-bold text-zinc-900 pr-16 leading-tight">{p.name}</h4>
                    <p className="text-sm font-mono text-emerald-600 font-semibold mb-2">{formatCurrency(p.price)}</p>
                    <div className="flex flex-wrap gap-1">
                      {p.benefits.map((b: string, i: number) => (
                        <span key={i} className="text-[10px] bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded truncate max-w-full">
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}