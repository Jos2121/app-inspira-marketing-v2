import { useObjectives } from '@/hooks/useObjectives';
import { CreateObjectiveModal } from './components/CreateObjectiveModal';
import { ObjectiveCard } from './components/ObjectiveCard';
import { CheckCircle2 } from 'lucide-react';

export default function Objectives() {
  const { data: objectives = [], isLoading } = useObjectives();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-both">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-blue-600" />
            Objetivos de Proyectos
          </h2>
          <p className="text-zinc-500 mt-2 font-medium">
            Planifica y haz seguimiento de campañas, lanzamientos o metas multitaréa.
          </p>
        </div>
        <CreateObjectiveModal />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-80 bg-zinc-100/50 rounded-[2rem] animate-pulse"></div>
          ))}
        </div>
      ) : objectives.length === 0 ? (
        <div className="text-center py-24 glass rounded-[2.5rem] border border-dashed border-zinc-200/80 mt-8">
          <CheckCircle2 className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-zinc-900">No hay objetivos activos</h3>
          <p className="text-zinc-500 mt-2 max-w-sm mx-auto">
            Crea tu primer objetivo para desglosar requerimientos grandes en tareas asignables.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 animate-in fade-in duration-700 delay-100 fill-both">
          {objectives.map(objective => (
            <ObjectiveCard key={objective.id} objective={objective} />
          ))}
        </div>
      )}
    </div>
  );
}