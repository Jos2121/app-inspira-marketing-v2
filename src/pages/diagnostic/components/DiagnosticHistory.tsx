import { useState, useEffect } from 'react';
import { useDiagnosticRecords, useDeleteDiagnosticRecord } from '@/hooks/useDiagnostic';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, FileText, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatLocalDateString } from '@/lib/date-utils';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
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

export function DiagnosticHistory() {
  const { data: records = [], isLoading } = useDiagnosticRecords();
  const deleteRecord = useDeleteDiagnosticRecord();

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [records.length]);

  const totalPages = Math.ceil(records.length / ITEMS_PER_PAGE);
  const paginatedRecords = records.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleDownloadPDF = (record: any) => {
    // Implementación rápida y estilizada usando window.print()
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Generar la lista de beneficios si existen
    const benefitsHtml = record.plan?.benefits && record.plan.benefits.length > 0 
      ? `<ul class="plan-benefits">
          ${record.plan.benefits.map((b: string) => `<li>${b}</li>`).join('')}
         </ul>` 
      : '';

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Auditoría - ${record.prospectName}</title>
        <style>
          body { font-family: 'Inter', system-ui, sans-serif; color: #18181b; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px 20px; }
          .header { text-align: center; border-bottom: 2px solid #e4e4e7; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { margin: 0; color: #09090b; font-size: 28px; }
          .header p { color: #52525b; margin-top: 5px; }
          .section { margin-bottom: 30px; }
          h2 { color: #2563eb; font-size: 20px; border-bottom: 1px solid #e4e4e7; padding-bottom: 8px; }
          pre { font-family: inherit; white-space: pre-wrap; background: #f4f4f5; padding: 20px; border-radius: 8px; border: 1px solid #e4e4e7; font-size: 15px;}
          .plan-box { background: #ecfdf5; border: 1px solid #a7f3d0; padding: 25px; border-radius: 8px; text-align: center;}
          .plan-box h3 { margin: 0 0 10px 0; color: #065f46; font-size: 22px; }
          .plan-price { font-family: monospace; font-size: 26px; font-weight: bold; color: #047857; margin: 10px 0; }
          .plan-benefits { text-align: left; margin: 20px auto 0; padding-left: 20px; color: #064e3b; font-size: 15px; max-width: 500px; }
          .plan-benefits li { margin-bottom: 8px; line-height: 1.4; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Reporte de Auditoría Operativa</h1>
          <p>Generado para: <strong>${record.prospectName}</strong> (${record.prospectWhatsapp})</p>
          <p>Fecha: ${formatLocalDateString(record.dateLimaISO, "dd 'de' MMMM, yyyy")}</p>
        </div>

        <div class="section">
          <h2>Análisis Generado</h2>
          <pre>${record.reportText}</pre>
        </div>

        ${record.plan ? `
        <div class="section plan-box">
          <h3>Plan Recomendado: ${record.plan.name}</h3>
          <p class="plan-price">${formatCurrency(record.plan.price)} / mes</p>
          ${benefitsHtml}
        </div>
        ` : ''}
        
        <script>
          window.onload = function() { window.print(); window.close(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (isLoading) return <div className="animate-pulse h-64 bg-white/50 rounded-2xl"></div>;

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50/50">
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Prospecto</TableHead>
              <TableHead>Plan Ofrecido</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-zinc-500">
                  <FileText className="w-8 h-8 mx-auto mb-3 text-zinc-300" />
                  No hay diagnósticos guardados en el historial.
                </TableCell>
              </TableRow>
            ) : (
              paginatedRecords.map(record => (
                <TableRow key={record.id} className="hover:bg-zinc-50/50">
                  <TableCell className="font-medium text-zinc-600 capitalize whitespace-nowrap">
                    {formatLocalDateString(record.dateLimaISO, "dd MMM yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-zinc-900">{record.prospectName}</div>
                    <div className="text-xs text-zinc-500 font-mono mt-0.5">{record.prospectWhatsapp}</div>
                  </TableCell>
                  <TableCell>
                    {record.plan ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        {record.plan.name}
                      </Badge>
                    ) : (
                      <span className="text-sm text-zinc-400">Solo Análisis</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-zinc-200 hover:bg-zinc-100 rounded-xl text-zinc-700"
                        onClick={() => handleDownloadPDF(record)}
                      >
                        <Download className="w-4 h-4 mr-2" /> PDF
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-[2rem] z-[100]">
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar auditoría?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará el registro de la auditoría de forma permanente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteRecord.mutate(record.id)}
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

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/50 p-4 rounded-2xl border border-zinc-200/60 shadow-sm">
          <span className="text-sm text-zinc-500 font-medium">
            Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} al {Math.min(currentPage * ITEMS_PER_PAGE, records.length)} de {records.length} reportes
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