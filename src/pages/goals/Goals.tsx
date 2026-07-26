import { CreateGoalModal } from './components/CreateGoalModal';
import { GoalList } from './components/GoalList';
import { GoalsChart } from './components/GoalsChart';

export default function Goals() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-both">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Metas y Rendimiento</h2>
          <p className="text-zinc-500 mt-2 font-medium">Gestiona y haz seguimiento del rendimiento mensual por cliente.</p>
        </div>
        <CreateGoalModal />
      </div>

      <div className="animate-in fade-in duration-1000 delay-100 fill-both">
        <GoalsChart />
      </div>

      <div className="animate-in fade-in duration-1000 delay-200 fill-both">
        <GoalList />
      </div>
    </div>
  );
}