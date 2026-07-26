import { Activity, History } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DiagnosticPlans } from './components/DiagnosticPlans';
import { DiagnosticChecklistConfig } from './components/DiagnosticChecklistConfig';
import { DiagnosticWizard } from './components/DiagnosticWizard';
import { DiagnosticHistory } from './components/DiagnosticHistory';

export default function Diagnostic() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-both">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-600" />
            Auditoría de Clínicas
          </h2>
          <p className="text-zinc-500 mt-2 font-medium">
            Genera auditorías detalladas usando IA y presenta el plan de marketing ideal.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <DiagnosticChecklistConfig />
          <DiagnosticPlans />
        </div>
      </div>

      <Tabs defaultValue="wizard" className="w-full animate-in fade-in duration-700 delay-100 fill-both">
        <TabsList className="bg-zinc-200/50 p-1 rounded-2xl w-full sm:w-auto h-auto flex flex-col sm:flex-row mb-8 shadow-sm">
          <TabsTrigger value="wizard" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 w-full sm:w-auto py-2.5 font-semibold transition-all">
            <Activity className="w-4 h-4 mr-2" />
            Nueva Evaluación
          </TabsTrigger>
          <TabsTrigger value="historial" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 w-full sm:w-auto py-2.5 font-semibold transition-all">
            <History className="w-4 h-4 mr-2" />
            Historial y Reportes
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="wizard" className="mt-0 outline-none">
          <DiagnosticWizard />
        </TabsContent>
        
        <TabsContent value="historial" className="mt-0 outline-none">
          <DiagnosticHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}