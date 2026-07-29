import React, { useState, useEffect } from 'react';
import { useRequirements, useCreateRequirement, useUpdateRequirement, useDeleteRequirement, Requirement } from '@/hooks/useRequirements';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, MessageSquareWarning, CheckCircle2, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatLocalDateString, formatDateLima } from '@/lib/date-utils';
import { cn } from '@/lib/utils';
import { RequirementFormModal } from './RequirementFormModal';
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

interface RequirementsSectionProps {
  clientFilter: string;
  partnerFilter: string;
}

export function RequirementsSection({ clientFilter, partnerFilter }: RequirementsSectionProps) {
  const { data: requirements = [], isLoading } = useRequirements();
  const createMutation = useCreateRequirement();
  const updateMutation = useUpdateRequirement();
  const deleteMutation = useDeleteRequirement();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState<Requirement | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Resetear página al cambiar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [clientFilter, partnerFilter, requirements.length]);

  const handleCreate = (data: any) => {
    createMutation.mutate(data, { onSuccess: () => setIsModalOpen(false) });
  };

  const handleUpdate = (data: any) => {
    if (editingRequirement) {
      updateMutation.mutate(
        { id: editingRequirement.id, data }, 
        { onSuccess: () => { setEditingRequirement(null); setIsModalOpen(false); } }
      );
    }
  };

  const openEditModal = (req: Requirement) => {
    setEditingRequirement(req);
    setIsModalOpen(true);
  };

  // Filtrado de la data
  const filteredRequirements = requirements.filter(req => {
    const matchesClient = clientFilter === 'all' || req.clientId === clientFilter;
    const matchesPartner = partnerFilter === 'all' || req.requesterId === partnerFilter || req.assigneeId === partnerFilter;
    return matchesClient && matchesPartner;
  });

  // Paginación
  const totalPages = Math.ceil(filteredRequirements.length / ITEMS_PER_PAGE);
  const paginatedRequirements = filteredRequirements.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="glass rounded-[2rem] border-zinc-200/60 shadow-sm p-6 bg-white/50 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-zinc-900">Requerimientos Internos</h3>
          <p className="text-sm text-zinc-500 font-medium">Solicitudes y delegaciones entre el equipo de trabajo.</p>
        </div>
        <Button 
          onClick={() => { setEditingRequirement(null); setIsModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 rounded-xl"
        >
          <Plus className="w-4 h-4 mr-2" /> Nuevo Requerimiento
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50/50">
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Requerimiento</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>De</TableHead>
              <TableHead>Para</TableHead>
              <TableHead>Límite</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Observaciones</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-zinc-500">Cargando requerimientos...</TableCell></TableRow>
            ) : filteredRequirements.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-zinc-500">No hay requerimientos activos.</TableCell></TableRow>
            ) : (
              paginatedRequirements.map(req => (
                <TableRow key={req.id} className="hover:bg-zinc-50/50">
                  <TableCell className="font-medium text-zinc-600 whitespace-nowrap">
                    {formatDateLima(req.createdAt, 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate font-medium text-zinc-900" title={req.content}>
                    {req.content}
                  </TableCell>
                  <TableCell className="text-zinc-600 font-medium whitespace-nowrap max-w-[150px] truncate" title={req.client?.name || 'Interno'}>
                    {req.client?.name || 'Interno / No asignado'}
                  </TableCell>
                  <TableCell className="text-zinc-600">{req.requester?.name || '-'}</TableCell>
                  <TableCell className="text-zinc-600 font-semibold">{req.assignee?.name || '-'}</TableCell>
                  <TableCell className="font-mono text-sm text-zinc-600 whitespace-nowrap">
                    {formatLocalDateString(req.deadline, 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      "font-medium border-transparent whitespace-nowrap flex items-center gap-1 w-fit",
                      req.status === 'Pendiente' ? "bg-amber-100 text-amber-800" :
                      req.status === 'Realizado' ? "bg-emerald-100 text-emerald-800" :
                      "bg-rose-100 text-rose-800"
                    )}>
                      {req.status === 'Pendiente' && <Clock className="w-3 h-3" />}
                      {req.status === 'Realizado' && <CheckCircle2 className="w-3 h-3" />}
                      {req.status === 'Con Observaciones' && <MessageSquareWarning className="w-3 h-3" />}
                      {req.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[150px] text-xs text-rose-600 truncate" title={req.feedbackMessage || ''}>
                    {req.feedbackMessage || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 items-center">
                      <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-700 hover:bg-blue-50" onClick={() => openEditModal(req)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-[2rem]">
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar requerimiento?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Se eliminará de la base de datos permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteMutation.mutate(req.id)} className="bg-red-600 hover:bg-red-700 text-white rounded-xl">
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/50 p-4 rounded-2xl border border-zinc-200/60 shadow-sm mt-4">
          <span className="text-sm text-zinc-500 font-medium">
            Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} al {Math.min(currentPage * ITEMS_PER_PAGE, filteredRequirements.length)} de {filteredRequirements.length} requerimientos
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="bg-white rounded-xl"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </Button>
            <div className="text-sm font-medium text-zinc-700 px-2 min-w-[100px] text-center">
              Página {currentPage} de {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="bg-white rounded-xl"
            >
              Siguiente
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      <RequirementFormModal 
        requirement={editingRequirement}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingRequirement ? handleUpdate : handleCreate}
        isPending={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}