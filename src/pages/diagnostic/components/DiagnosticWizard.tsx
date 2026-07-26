import { useState, useEffect } from 'react';
import { 
  useDiagnosticQuestions, 
  useAgencyPlans, 
  useGenerateDiagnosticReport, 
  useCreateDiagnosticRecord, 
  useSearchDNI,
  DiagnosticResultItem 
} from '@/hooks/useDiagnostic';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Phone, Sparkles, CheckCircle2, Search, Loader2 } from 'lucide-react';
import { getCurrentDateLimaISO } from '@/lib/date-utils';
import { cn, formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export function DiagnosticWizard() {
  const { data: questions = [], isLoading: loadingQ } = useDiagnosticQuestions();
  const { data: plans = [] } = useAgencyPlans();
  
  const generateReport = useGenerateDiagnosticReport();
  const saveRecord = useCreateDiagnosticRecord();
  const searchDni = useSearchDNI();

  const [step, setStep] = useState(1);
  const [prospect, setProspect] = useState({ dni: '', name: '', whatsapp: '' });
  const [results, setResults] = useState<Record<string, DiagnosticResultItem>>({});
  
  const [reportText, setReportText] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('none');

  // Inicializar checklist
  useEffect(() => {
    if (questions.length > 0 && Object.keys(results).length === 0) {
      const initial: Record<string, DiagnosticResultItem> = {};
      questions.forEach(q => initial[q.question] = { score: 5, observation: '' });
      setResults(initial);
    }
  }, [questions]);

  const handleScoreChange = (q: string, val: number) => {
    setResults(prev => ({ ...prev, [q]: { ...prev[q], score: val } }));
  };

  const handleObsChange = (q: string, val: string) => {
    setResults(prev => ({ ...prev, [q]: { ...prev[q], observation: val } }));
  };

  const handleDniSearch = () => {
    if (prospect.dni.length !== 8) {
      toast.error('El DNI debe tener 8 dígitos');
      return;
    }
    
    searchDni.mutate(prospect.dni, {
      onSuccess: (data) => {
        if (data && data.nombres) {
          const fullName = `${data.nombres} ${data.apellidoPaterno} ${data.apellidoMaterno}`.trim();
          setProspect(prev => ({ ...prev, name: fullName }));
          toast.success('Datos encontrados y autocompletados');
        } else {
          toast.error('No se encontraron datos para este DNI');
        }
      },
      onError: (err) => {
        toast.error(err.message);
      }
    });
  };

  const handleGenerate = async () => {
    if (!prospect.name || !prospect.whatsapp) {
      toast.error('Nombre y WhatsApp son obligatorios');
      return;
    }
    if (questions.length === 0) {
      toast.error('Configura el checklist base primero.');
      return;
    }

    setStep(2); // Loading AI step
    try {
      const res = await generateReport.mutateAsync({
        prospectName: prospect.name,
        results
      });
      setReportText(res.report);
      setStep(3); // Result step
    } catch (error) {
      toast.error('Falló la generación del reporte.');
      setStep(1);
    }
  };

  const handleSave = () => {
    saveRecord.mutate({
      prospectName: prospect.name,
      prospectWhatsapp: prospect.whatsapp,
      dateLimaISO: getCurrentDateLimaISO(),
      results,
      reportText,
      planId: selectedPlanId === 'none' ? null : selectedPlanId
    }, {
      onSuccess: () => {
        setStep(1);
        setProspect({ dni: '', name: '', whatsapp: '' });
        setResults({});
        setSelectedPlanId('none');
      }
    });
  };

  if (loadingQ) return <div className="animate-pulse h-64 bg-zinc-100 rounded-[2rem]"></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* STEPS INDICATOR */}
      <div className="flex items-center justify-center gap-4 py-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-4">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500",
              step >= i ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" : "bg-zinc-200 text-zinc-500"
            )}>
              {i}
            </div>
            {i !== 3 && <div className={cn("h-1 w-12 rounded-full", step > i ? "bg-blue-600" : "bg-zinc-200")} />}
          </div>
        ))}
      </div>

      {/* STEP 1: EVALUATION */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="glass rounded-[2rem] p-6 sm:p-8 border-zinc-200/60 shadow-sm">
            <h3 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Datos del Prospecto
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-4 space-y-2">
                <Label>DNI (Opcional)</Label>
                <div className="relative flex items-center">
                  <Input 
                    value={prospect.dni} 
                    onChange={e => setProspect({ ...prospect, dni: e.target.value.replace(/\D/g, '').slice(0, 8) })} 
                    onKeyDown={e => e.key === 'Enter' && handleDniSearch()}
                    className="h-12 pr-12 bg-white font-mono" 
                    placeholder="Ej. 12345678" 
                    maxLength={8}
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleDniSearch}
                    disabled={searchDni.isPending || prospect.dni.length !== 8}
                    className="absolute right-1 h-10 w-10 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                  >
                    {searchDni.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  </Button>
                </div>
              </div>
              
              <div className="md:col-span-8 space-y-2">
                <Label>Nombre de la Clínica o Doctor *</Label>
                <Input 
                  value={prospect.name} 
                  onChange={e => setProspect({ ...prospect, name: e.target.value })} 
                  className={cn("h-12 bg-white transition-colors", searchDni.isSuccess && "border-blue-300 ring-4 ring-blue-500/10")} 
                  placeholder="Ej. OdontoCenter / Dr. Juan Pérez" 
                />
              </div>

              <div className="md:col-span-6 space-y-2">
                <Label>WhatsApp de Contacto *</Label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 h-5 w-5 text-zinc-400" />
                  <Input 
                    value={prospect.whatsapp} 
                    onChange={e => setProspect({ ...prospect, whatsapp: e.target.value })} 
                    className="h-12 pl-11 bg-white font-mono" 
                    placeholder="+51 999 999 999" 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="glass rounded-[2rem] p-6 sm:p-8 border-zinc-200/60 shadow-sm">
            <h3 className="text-xl font-bold text-zinc-900 mb-6">Auditoría Operativa</h3>
            {questions.length === 0 ? (
              <p className="text-center text-zinc-500 py-8 border border-dashed rounded-xl">No hay ítems configurados en el Checklist Base.</p>
            ) : (
              <div className="space-y-6">
                {questions.map(q => {
                  const data = results[q.question] || { score: 5, observation: '' };
                  return (
                    <div key={q.id} className="bg-white/70 p-5 rounded-2xl border border-zinc-100 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-zinc-800">{q.question}</span>
                        <div className={cn("px-3 py-1 rounded-lg border font-bold text-sm", data.score <= 4 ? "bg-red-50 text-red-600 border-red-200" : data.score <= 7 ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-emerald-50 text-emerald-600 border-emerald-200")}>
                          {data.score} / 10
                        </div>
                      </div>
                      <Slider value={[data.score]} max={10} step={1} onValueChange={(val) => handleScoreChange(q.question, val[0])} className="py-2" />
                      <Textarea 
                        placeholder="Observaciones o notas sobre este punto..." 
                        value={data.observation}
                        onChange={e => handleObsChange(q.question, e.target.value)}
                        className="mt-4 bg-zinc-50/50 resize-none h-20"
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <Button onClick={handleGenerate} disabled={generateReport.isPending} className="w-full h-16 text-lg font-bold rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/30">
            <Sparkles className="w-5 h-5 mr-2" /> Generar Informe con IA
          </Button>
        </div>
      )}

      {/* STEP 2: LOADING */}
      {step === 2 && (
        <div className="flex flex-col items-center justify-center py-32 glass rounded-[2.5rem] border border-blue-200/50 bg-blue-50/20 text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 rounded-full animate-pulse"></div>
            <Sparkles className="w-16 h-16 text-blue-600 animate-bounce relative z-10" />
          </div>
          <h3 className="text-2xl font-extrabold text-zinc-900 mb-2">Analizando datos con IA</h3>
          <p className="text-zinc-500 font-medium">Buscando deficiencias y estructurando el informe...</p>
        </div>
      )}

      {/* STEP 3: RESULT & APPROVAL */}
      {step === 3 && (
        <div className="space-y-6 animate-in zoom-in-95 duration-500">
          <div className="glass rounded-[2rem] p-8 border-emerald-200/60 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 blur-3xl rounded-full -z-10 pointer-events-none"></div>
            
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              <h2 className="text-2xl font-bold text-zinc-900">Informe Generado</h2>
            </div>
            
            <div className="bg-white/80 p-6 rounded-2xl border border-zinc-100 shadow-inner prose prose-zinc max-w-none text-zinc-700">
              <pre className="font-sans whitespace-pre-wrap">{reportText}</pre>
            </div>

            <div className="mt-8 p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
              <Label className="text-blue-900 font-bold text-lg mb-3 block">Plan Recomendado para Ofrecer</Label>
              <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                <SelectTrigger className="h-14 bg-white text-lg">
                  <SelectValue placeholder="Selecciona un plan..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No asignar ningún plan (Solo Diagnóstico)</SelectItem>
                  {plans.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      <span className="font-bold">{p.name}</span> - <span className="text-emerald-600 font-mono font-medium">{formatCurrency(p.price)}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4 mt-8">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-14 text-lg rounded-xl">Re-evaluar</Button>
              <Button onClick={handleSave} disabled={saveRecord.isPending} className="flex-1 h-14 text-lg font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/30">
                {saveRecord.isPending ? 'Guardando...' : 'Confirmar y Guardar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}