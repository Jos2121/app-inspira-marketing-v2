import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, ListChecks, Plus, Edit2, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDiagnosticQuestions, useCreateDiagnosticQuestion, useDeleteDiagnosticQuestion, useUpdateDiagnosticQuestion } from '@/hooks/useDiagnostic';
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

export function DiagnosticChecklistConfig() {
  const [open, setOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  const { data: questions = [], isLoading } = useDiagnosticQuestions();
  const createQ = useCreateDiagnosticQuestion();
  const deleteQ = useDeleteDiagnosticQuestion();
  const updateQ = useUpdateDiagnosticQuestion();

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Ajustar la página si se eliminan elementos y la página actual queda vacía
  useEffect(() => {
    const maxPage = Math.ceil(questions.length / ITEMS_PER_PAGE) || 1;
    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [questions.length, currentPage]);

  const totalPages = Math.ceil(questions.length / ITEMS_PER_PAGE);
  const paginatedQuestions = questions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    createQ.mutate(newQuestion.trim(), {
      onSuccess: () => {
        setNewQuestion('');
        // Al añadir, ir a la última página para ver el nuevo elemento
        setCurrentPage(Math.ceil((questions.length + 1) / ITEMS_PER_PAGE));
      }
    });
  };

  const startEdit = (q: any) => {
    setEditingId(q.id);
    setEditValue(q.question);
  };

  const handleSaveEdit = (id: string) => {
    if (!editValue.trim()) return;
    updateQ.mutate({ id, question: editValue.trim() }, {
      onSuccess: () => setEditingId(null)
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') handleSaveEdit(id);
    if (e.key === 'Escape') setEditingId(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-white/50 border-emerald-200 text-emerald-700 hover:bg-emerald-50 shadow-sm rounded-xl">
          <ListChecks className="w-4 h-4 mr-2" /> Configurar Checklist Base
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] rounded-[2rem] max-h-[85vh] overflow-y-auto no-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Checklist de Auditoría</DialogTitle>
          <p className="text-sm text-zinc-500">Define los puntos clave que se evaluarán del 0 al 10 en cada diagnóstico.</p>
        </DialogHeader>
        
        <div className="pt-4 space-y-6">
          <form onSubmit={handleAdd} className="flex gap-2">
            <Input 
              value={newQuestion} 
              onChange={e => setNewQuestion(e.target.value)} 
              placeholder="Ej. ¿Cuentan con un CRM automatizado?" 
              className="bg-zinc-50"
            />
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 shrink-0" disabled={createQ.isPending}>
              <Plus className="w-4 h-4" /> Agregar
            </Button>
          </form>

          <div className="space-y-2">
            {isLoading ? (
              <div className="animate-pulse space-y-2"><div className="h-12 bg-zinc-100 rounded-xl"></div></div>
            ) : questions.length === 0 ? (
              <p className="text-sm text-center text-zinc-500 py-6 border border-dashed rounded-xl">El checklist está vacío.</p>
            ) : (
              <>
                {paginatedQuestions.map((q) => (
                  <div key={q.id} className="flex items-center justify-between p-3 bg-white border border-zinc-200 rounded-xl shadow-sm group">
                    {editingId === q.id ? (
                      <div className="flex w-full gap-2 items-center">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, q.id)}
                          className="h-9 text-sm"
                          autoFocus
                        />
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 shrink-0 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700" 
                          onClick={() => handleSaveEdit(q.id)} 
                          disabled={updateQ.isPending}
                        >
                           <Check className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 shrink-0 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700" 
                          onClick={() => setEditingId(null)}
                        >
                           <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className="font-medium text-zinc-800 text-sm flex-1 mr-4 leading-tight">{q.question}</span>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-zinc-400 hover:text-blue-600 hover:bg-blue-50"
                            onClick={() => startEdit(q)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-[2rem] z-[100]">
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar ítem del checklist?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción removerá la pregunta del checklist base para futuras auditorías.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteQ.mutate(q.id)}
                                  className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-600/20"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {/* Controles de Paginación */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-zinc-100">
                    <span className="text-xs text-zinc-500 font-medium">
                      {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, questions.length)} de {questions.length}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <div className="text-xs font-medium text-zinc-700 w-12 text-center">
                        {currentPage} / {totalPages}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}