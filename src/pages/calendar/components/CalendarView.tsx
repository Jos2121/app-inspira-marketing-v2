import { useState, useRef, useEffect } from 'react';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, User, Briefcase, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Task } from '@/hooks/useTasks';
import { cn } from '@/lib/utils';
import { TaskFormModal } from './TaskFormModal';
import { toZonedTime } from 'date-fns-tz';
import { LIMA_TIMEZONE } from '@/lib/date-utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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

interface CalendarViewProps {
  tasks: Task[];
  onTaskCreate: (data: any) => void;
  onTaskUpdate: (id: string, data: any) => void;
  onTaskDelete: (id: string) => void;
  isPending: boolean;
  isDeleting: boolean;
}

export function CalendarView({ tasks, onTaskCreate, onTaskUpdate, onTaskDelete, isPending, isDeleting }: CalendarViewProps) {
  
  const getLimaToday = () => toZonedTime(new Date(), LIMA_TIMEZONE);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [currentDate, setCurrentDate] = useState(getLimaToday());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStartEdit, setModalStartEdit] = useState(false);

  // Auto-scroll a las 7:00 AM
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 7 * 60;
    }
  }, []);

  const nextDay = () => setCurrentDate(addDays(currentDate, 1));
  const prevDay = () => setCurrentDate(subDays(currentDate, 1));
  const today = () => setCurrentDate(getLimaToday());

  const targetDateStr = format(currentDate, 'yyyy-MM-dd');
  const limaToday = getLimaToday();
  const isCurrentDay = isSameDay(currentDate, limaToday);
  
  // Paginación para el historial de todas las tareas
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Pendiente': return 'bg-amber-100/95 text-amber-900 border-amber-300';
      case 'En Proceso': return 'bg-blue-100/95 text-blue-900 border-blue-300';
      case 'Completada': return 'bg-emerald-100/95 text-emerald-900 border-emerald-300';
      default: return 'bg-zinc-100/95 text-zinc-900 border-zinc-300';
    }
  };

  const handleHourClick = (hour: number) => {
    const newDate = new Date(currentDate);
    newDate.setHours(hour, 0, 0, 0);
    setSelectedDate(newDate);
    setSelectedTask(null);
    setModalStartEdit(false);
    setIsModalOpen(true);
  };

  const handleTaskClick = (e: React.MouseEvent, task: Task, forceEdit = false) => {
    e.stopPropagation();
    setSelectedTask(task);
    setModalStartEdit(forceEdit);
    setIsModalOpen(true);
  };

  const handleSubmit = (data: any) => {
    if (selectedTask) {
      onTaskUpdate(selectedTask.id, data);
    } else {
      onTaskCreate(data);
    }
    setIsModalOpen(false);
  };

  const getMinutesFromMidnight = (dateString: string) => {
    const normalized = dateString.replace(' ', 'T');
    const [datePart, timePart] = normalized.split('T');
    
    if (datePart < targetDateStr) return 0; 
    if (datePart > targetDateStr) return 24 * 60; 
    
    const [h, m] = (timePart || "00:00").split(':').map(Number);
    return h * 60 + (m || 0);
  };

  // Filtrar tareas del día
  const dayTasks = tasks.filter(t => {
    const startNorm = t.startTime.replace(' ', 'T').split('T')[0];
    const endNorm = t.endTime.replace(' ', 'T').split('T')[0];
    return startNorm <= targetDateStr && endNorm >= targetDateStr;
  });

  // ALGORITMO ESTILO GOOGLE CALENDAR
  // 1. Mapear y ordenar
  const mappedTasks = dayTasks.map(task => {
    const startMins = getMinutesFromMidnight(task.startTime);
    const rawEndMins = getMinutesFromMidnight(task.endTime);
    // Para calcular superposiciones, asumimos que cada tarea dura al menos 30 minutos
    const layoutEndMins = Math.max(rawEndMins, startMins + 30);
    
    return { ...task, startMins, rawEndMins, layoutEndMins };
  }).sort((a, b) => {
    if (a.startMins !== b.startMins) return a.startMins - b.startMins;
    return b.layoutEndMins - a.layoutEndMins; // Las más largas primero si empiezan igual
  });

  // 2. Crear grupos (clusters) de tareas superpuestas
  const clusters: Array<typeof mappedTasks> = [];
  let currentCluster: typeof mappedTasks = [];
  let currentClusterEnd = -1;

  mappedTasks.forEach(task => {
    if (currentCluster.length === 0) {
      currentCluster.push(task);
      currentClusterEnd = task.layoutEndMins;
    } else if (task.startMins < currentClusterEnd) {
      currentCluster.push(task);
      currentClusterEnd = Math.max(currentClusterEnd, task.layoutEndMins);
    } else {
      clusters.push([...currentCluster]);
      currentCluster = [task];
      currentClusterEnd = task.layoutEndMins;
    }
  });
  if (currentCluster.length > 0) {
    clusters.push(currentCluster);
  }

  // 3. Asignar columnas dentro de cada grupo
  const processedTasks: any[] = [];
  clusters.forEach(cluster => {
    const columns: Array<typeof cluster> = [];
    cluster.forEach(task => {
      let placed = false;
      for (let i = 0; i < columns.length; i++) {
        const lastInColumn = columns[i][columns[i].length - 1];
        // Si no choca con la última de esta columna, entra aquí
        if (lastInColumn.layoutEndMins <= task.startMins) {
          columns[i].push(task);
          (task as any).column = i;
          placed = true;
          break;
        }
      }
      if (!placed) {
        (task as any).column = columns.length;
        columns.push([task]);
      }
    });

    const columnCount = columns.length;
    cluster.forEach(task => {
      (task as any).columnCount = columnCount;
      processedTasks.push(task);
    });
  });

  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Historial de tareas (Todas las tareas ordenadas por fecha descendente)
  const sortedAllTasks = [...tasks].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  const totalPages = Math.ceil(sortedAllTasks.length / ITEMS_PER_PAGE);
  const paginatedAllTasks = sortedAllTasks.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6 flex flex-col">
      <div className="glass rounded-[2rem] border-zinc-200/60 shadow-sm overflow-hidden flex flex-col h-[600px] shrink-0">
        
        {/* Cabecera y Filtros */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-b border-zinc-100 bg-white/50 gap-4">
        <h2 className="text-xl font-bold text-zinc-800 capitalize whitespace-nowrap">
          {format(currentDate, "EEEE, d 'de' MMMM", { locale: es })}
        </h2>
        
        <div className="flex flex-wrap items-center gap-2 justify-center w-full sm:w-auto">
          <Input
            type="date"
            value={targetDateStr}
            onChange={(e) => {
              if (e.target.value) {
                const [y, m, d] = e.target.value.split('-').map(Number);
                setCurrentDate(new Date(y, m - 1, d));
              }
            }}
            className="w-[140px] h-9 bg-white cursor-pointer focus-visible:ring-blue-600/20"
          />
          
          <div className="flex items-center bg-zinc-100/50 rounded-xl p-1 border border-zinc-200/50">
            <Button variant="ghost" size="icon" className="h-7 w-8 rounded-lg" onClick={prevDay}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 rounded-lg text-xs font-semibold px-3" onClick={today}>
              Hoy
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-8 rounded-lg" onClick={nextDay}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 ml-2" onClick={() => { setSelectedDate(undefined); setSelectedTask(null); setIsModalOpen(true); }}>
            <Plus className="w-4 h-4 mr-1.5" /> Tarea
          </Button>
        </div>
      </div>

      {/* Área de la línea de tiempo */}
      <div className="flex-1 overflow-y-auto bg-zinc-50/30 no-scrollbar relative" ref={scrollRef}>
        <div className="relative" style={{ height: 1440 }}> {/* 24 horas x 60px */}
          
          {/* Líneas de las horas */}
          {hours.map(h => (
            <div key={h} className="absolute w-full flex border-b border-zinc-100/80" style={{ top: h * 60, height: 60 }}>
              <div className="w-20 text-xs font-bold text-zinc-400 text-right pr-3 pt-1.5 bg-white/50 border-r border-zinc-100">
                {h.toString().padStart(2, '0')}:00
              </div>
              <div 
                className="flex-1 cursor-pointer hover:bg-blue-50/40 transition-colors"
                onClick={() => handleHourClick(h)}
              ></div>
            </div>
          ))}

          {/* Indicador de Hora Actual */}
          {isCurrentDay && (
            <div 
              className="absolute left-20 right-0 border-t-[2px] border-red-500 z-20 pointer-events-none" 
              style={{ top: limaToday.getHours() * 60 + limaToday.getMinutes() }}
            >
              <div className="absolute -left-1.5 -top-[5px] w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
            </div>
          )}

          {/* Tareas usando el algoritmo de columnas */}
          <div className="absolute left-20 right-0 top-0 bottom-0 pointer-events-none pr-4">
            {processedTasks.map(task => {
              const top = task.startMins;
              const height = Math.max(task.rawEndMins - task.startMins, 25);
              const widthPercent = 100 / task.columnCount;
              const leftPercent = task.column * widthPercent;
              
              const startDisplay = task.startTime.replace(' ', 'T').split('T')[1]?.substring(0, 5);
              const endDisplay = task.endTime.replace(' ', 'T').split('T')[1]?.substring(0, 5);

              return (
                <div
                  key={task.id}
                  onClick={(e) => handleTaskClick(e, task)}
                  className={cn(
                    "absolute rounded-lg p-2 border shadow-sm cursor-pointer pointer-events-auto transition-transform hover:scale-[1.01] overflow-hidden group flex flex-col",
                    getStatusColor(task.status)
                  )}
                  style={{
                    top,
                    height,
                    left: `${leftPercent}%`,
                    width: `calc(${widthPercent}% - 4px)`,
                    marginLeft: '4px',
                    zIndex: 10 + task.column
                  }}
                >
                  <div className="text-xs font-bold truncate leading-tight shrink-0">{task.title}</div>
                  
                  {height >= 40 && (
                    <div className="text-[10px] font-mono font-semibold opacity-70 mt-1 truncate shrink-0">
                      {startDisplay} - {endDisplay}
                    </div>
                  )}

                  {height >= 55 && (task.partner?.name || task.client?.name) && (
                    <div className="flex flex-wrap gap-1 mt-1 overflow-hidden">
                      {task.partner?.name && (
                        <div className="text-[10px] truncate opacity-90 font-medium flex items-center gap-1 bg-white/40 px-1.5 py-0.5 rounded max-w-full">
                           <User className="w-3 h-3 shrink-0" />
                           <span className="truncate">{task.partner.name}</span>
                        </div>
                      )}
                      {task.client?.name && (
                        <div className="text-[10px] truncate opacity-90 font-medium flex items-center gap-1 bg-white/40 px-1.5 py-0.5 rounded max-w-full">
                           <Briefcase className="w-3 h-3 shrink-0" />
                           <span className="truncate">{task.client.name}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
        </div>
      </div>
      </div>

      {/* Tabla de Historial General */}
      <div className="glass rounded-[2rem] border-zinc-200/60 shadow-sm overflow-hidden p-6 bg-white/50">
        <h3 className="text-xl font-bold text-zinc-900 mb-4">Historial de Todas las Tareas ({sortedAllTasks.length})</h3>
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <Table>
            <TableHeader className="bg-zinc-50/50">
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Tarea</TableHead>
                <TableHead>Socio / Staff</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAllTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-zinc-500">
                    No hay tareas programadas.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedAllTasks.map(task => {
                  const dateNorm = task.startTime.replace(' ', 'T').split('T')[0];
                  const [y, m, d] = dateNorm.split('-').map(Number);
                  const dateFormatted = format(new Date(y, m - 1, d), "dd MMM yyyy", { locale: es });
                  
                  const startDisplay = task.startTime.replace(' ', 'T').split('T')[1]?.substring(0, 5) || '';
                  const endDisplay = task.endTime.replace(' ', 'T').split('T')[1]?.substring(0, 5) || '';
                  
                  return (
                    <TableRow key={task.id} className="hover:bg-zinc-50/50 cursor-pointer" onClick={(e) => handleTaskClick(e, task as any)}>
                      <TableCell className="font-medium text-zinc-700 capitalize whitespace-nowrap">
                        {dateFormatted}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-zinc-600 whitespace-nowrap">
                        {startDisplay} - {endDisplay}
                      </TableCell>
                      <TableCell className="font-medium text-zinc-900">
                        {task.title}
                      </TableCell>
                      <TableCell className="text-zinc-600">
                        {task.partner?.name || '-'}
                      </TableCell>
                      <TableCell className="text-zinc-600">
                        {task.client?.name || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(
                          "font-medium border-transparent",
                          task.status === 'Pendiente' ? "bg-amber-100 text-amber-800" :
                          task.status === 'En Proceso' ? "bg-blue-100 text-blue-800" :
                          "bg-emerald-100 text-emerald-800"
                        )}>
                          {task.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                            onClick={(e) => handleTaskClick(e, task as any, true)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-400 hover:text-red-600 hover:bg-red-50"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-[2rem] z-[100]">
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar tarea?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará la tarea permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="rounded-xl" onClick={(e) => e.stopPropagation()}>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onTaskDelete(task.id);
                                }}
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
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 bg-white/50 p-4 rounded-2xl border border-zinc-200/60 shadow-sm">
            <span className="text-sm text-zinc-500 font-medium">
              Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} al {Math.min(currentPage * ITEMS_PER_PAGE, sortedAllTasks.length)} de {sortedAllTasks.length} tareas
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

      <TaskFormModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        onDelete={onTaskDelete}
        isPending={isPending}
        isDeleting={isDeleting}
        selectedDate={selectedDate}
        initialEditMode={modalStartEdit}
      />
    </div>
  );
}