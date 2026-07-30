import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { Partner } from '@/hooks/usePartners';
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

interface PartnerListProps {
  partners: Partner[];
  isLoading: boolean;
  onEdit: (p: Partner) => void;
  onDelete: (id: string) => void;
}

export function PartnerList({ partners, isLoading, onEdit, onDelete }: PartnerListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [partners]);

  const totalPages = Math.ceil(partners.length / ITEMS_PER_PAGE);
  const paginatedPartners = partners.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50/50">
              <TableHead>Nombre y Rol</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Correo Electrónico</TableHead>
              <TableHead>Telegram</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-zinc-500">Cargando socios...</TableCell></TableRow>
            ) : partners.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-zinc-500">No hay socios registrados</TableCell></TableRow>
            ) : (
              paginatedPartners.map(partner => (
                <TableRow key={partner.id} className="hover:bg-zinc-50/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] border border-black/5"
                        style={{ backgroundColor: partner.color || '#3b82f6' }}
                        title={`Color: ${partner.color || '#3b82f6'}`}
                      />
                      <div>
                        <div className="font-semibold text-zinc-900">{partner.name}</div>
                        <div className="text-sm text-zinc-500">{partner.role}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-zinc-600">{partner.phone || '-'}</TableCell>
                  <TableCell className="text-sm text-zinc-600">{partner.email || '-'}</TableCell>
                  <TableCell>
                    {partner.telegramChatId ? (
                      <Badge variant="outline" className="bg-blue-50/50 text-blue-700 font-mono text-xs border-blue-200 gap-1 px-2">
                        <Send className="w-3 h-3 text-blue-500" />
                        {partner.telegramChatId}
                      </Badge>
                    ) : (
                      <span className="text-zinc-400 font-medium">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={partner.status === 'Activo' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-zinc-100 text-zinc-500'}>
                      {partner.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="text-blue-500 hover:bg-blue-50" onClick={() => onEdit(partner)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-[2rem]">
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar socio?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará el socio permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => onDelete(partner.id)}
                              className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-600/20"
                            >
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

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/50 p-4 rounded-2xl border border-zinc-200/60 shadow-sm">
          <span className="text-sm text-zinc-500 font-medium">
            Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} al {Math.min(currentPage * ITEMS_PER_PAGE, partners.length)} de {partners.length} socios
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
    </div>
  );
}