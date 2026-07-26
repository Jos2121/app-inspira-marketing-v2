import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, GripVertical, Edit2, X } from 'lucide-react';
import { usePlans, useCreatePlan, useDeletePlan, useUpdatePlan } from '@/hooks/useCompliance';
import { toast } from 'sonner';
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

export function PlanConfig() {
  const { data: plans = [], isLoading } = usePlans();
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const deletePlan = useDeletePlan();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [activities, setActivities] = useState<string[]>(['']);

  const handleAddActivity = () => {
    setActivities([...activities, '']);
  };

  const handleActivityChange = (index: number, value: string) => {
    const newActivities = [...activities];
    newActivities[index] = value;
    setActivities(newActivities);
  };

  const handleRemoveActivity = (index: number) => {
    if (activities.length === 1) return;
    const newActivities = activities.filter((_, i) => i !== index);
    setActivities(newActivities);
  };

  const handleEdit = (plan: any) => {
    setEditingId(plan.id);
    setName(plan.name);
    setActivities([...plan.activities]);
    // Scroll al formulario en dispositivos pequeños
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName('');
    setActivities(['']);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validActivities = activities.filter(a => a.trim() !== '');
    if (!name.trim() || validActivities.length === 0) {
      toast.error('Completa el nombre y al menos una actividad válida.');
      return;
    }

    if (editingId) {
      updatePlan.mutate({ id: editingId, data: { name, activities: validActivities } }, {
        onSuccess: () => cancelEdit()
      });
    } else {
      createPlan.mutate({ name, activities: validActivities }, {
        onSuccess: () => {
          setName('');
          setActivities(['']);
        }
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
      
      {/* Formulario de Creación / Edición */}
      <div className={`glass rounded-[2rem] p-6 sm:p-8 shadow-sm border h-fit transition-colors duration-300 relative ${editingId ? 'border-amber-400/60 ring-4 ring-amber-400/10' : 'border-zinc-200/60'}`}>
        {editingId && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 bg-zinc-50 hover:bg-zinc-100 rounded-full"
            onClick={cancelEdit}
            title="Cancelar edición"
          >
            <X className="w-5 h-5" />
          </Button>
        )}
        <h3 className="text-xl font-bold text-zinc-900 mb-6">
          {editingId ? 'Editar Plan' : 'Crear Nuevo Plan'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="planName" className="text-zinc-600 font-semibold">Nombre del Plan</Label>
            <Input 
              id="planName" 
              placeholder="Ej. Plan Premium Mensual" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white/50 focus-visible:ring-blue-600/20 focus-visible:border-blue-600 h-11"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-zinc-600 font-semibold">Actividades o Beneficios</Label>
            <div className="space-y-2">
              {activities.map((activity, idx) => (
                <div key={idx} className="flex items-center gap-2 group">
                  <GripVertical className="w-5 h-5 text-zinc-300 shrink-0 cursor-grab" />
                  <Input
                    placeholder="Ej. Mantenimiento Preventivo"
                    value={activity}
                    onChange={(e) => handleActivityChange(idx, e.target.value)}
                    className="bg-white/50 focus-visible:ring-blue-600/20 focus-visible:border-blue-600 h-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveActivity(idx)}
                    disabled={activities.length === 1}
                    className="text-zinc-400 hover:text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={handleAddActivity}
              className="mt-2 text-blue-600 border-blue-200 hover:bg-blue-50/50 rounded-xl w-full border-dashed"
            >
              <Plus className="w-4 h-4 mr-2" /> Agregar ítem
            </Button>
          </div>

          <Button 
            type="submit" 
            className={`w-full h-11 rounded-xl shadow-lg ${editingId ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20 text-white' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 text-white'}`}
            disabled={createPlan.isPending || updatePlan.isPending}
          >
            {createPlan.isPending || updatePlan.isPending ? 'Guardando...' : editingId ? 'Actualizar Plan' : 'Guardar Plan'}
          </Button>
        </form>
      </div>

      {/* Lista de Planes */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-zinc-900 mb-4 px-2">Planes Existentes</h3>
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1,2].map(i => <div key={i} className="h-32 bg-zinc-200/50 rounded-2xl"></div>)}
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12 glass rounded-[2rem] border-dashed border-zinc-200">
            <p className="text-zinc-500 font-medium">No hay planes configurados aún.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {plans.map((plan) => (
              <div key={plan.id} className={`glass rounded-[1.5rem] p-5 border relative group transition-all hover:shadow-md ${editingId === plan.id ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-zinc-200/50'}`}>
                
                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-zinc-100 p-0.5 z-10">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-zinc-400 hover:text-amber-500 hover:bg-amber-50"
                    title="Editar plan"
                    onClick={() => handleEdit(plan)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-zinc-400 hover:text-red-600 hover:bg-red-50"
                        title="Eliminar plan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-[2rem]">
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar este plan?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Asegúrate de que el plan no esté siendo usado por ningún cliente antes de eliminarlo.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deletePlan.mutate(plan.id)}
                          className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-600/20"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                
                <h4 className="font-bold text-zinc-900 text-lg mb-3 pr-20 leading-tight">{plan.name}</h4>
                <ul className="space-y-1.5">
                  {plan.activities.map((act, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                      <span className="leading-tight">{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}