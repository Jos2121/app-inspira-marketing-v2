import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, Settings } from "lucide-react";
import { ComplianceBoard } from "./components/ComplianceBoard";
import { PlanConfig } from "./components/PlanConfig";
import { AssignPlanModal } from "./components/AssignPlanModal";

export default function Compliance() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-both">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Gestión de Cumplimiento</h2>
          <p className="text-zinc-500 mt-1 font-medium">Controla los entregables y beneficios mensuales por cliente.</p>
        </div>
        <AssignPlanModal />
      </div>

      <Tabs defaultValue="seguimiento" className="w-full animate-in fade-in duration-700 delay-100 fill-both">
        <TabsList className="bg-zinc-200/50 p-1 rounded-2xl w-full sm:w-auto h-auto flex flex-col sm:flex-row mb-6 shadow-sm">
          <TabsTrigger value="seguimiento" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 w-full sm:w-auto py-2.5 font-semibold transition-all">
            <ShieldCheck className="w-4 h-4 mr-2" />
            Tablero de Seguimiento
          </TabsTrigger>
          <TabsTrigger value="configuracion" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 w-full sm:w-auto py-2.5 font-semibold transition-all">
            <Settings className="w-4 h-4 mr-2" />
            Configuración de Planes
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="seguimiento" className="mt-0 outline-none">
          <ComplianceBoard />
        </TabsContent>
        
        <TabsContent value="configuracion" className="mt-0 outline-none">
          <PlanConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
}