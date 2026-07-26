import React, { useState, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Workflow, WorkflowTask, useCreateTask, useDeleteTask, useReorderTasks } from '@/hooks/useWorkflows';
import { usePartners } from '@/hooks/usePartners';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, GripVertical, Trash2, Database, UserSquare2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowBoardProps {
  workflow: Workflow;
}

export function WorkflowBoard({ workflow }: WorkflowBoardProps) {
  const { data: partners = [] } = usePartners();
  const [localTasks, setLocalTasks] = useState<WorkflowTask[]>(workflow.tasks);
  const [newTaskContent, setNewTaskContent] = useState<Record<string, string>>({});

  const createTask = useCreateTask();
  const deleteTask = useDeleteTask();
  const reorderTasks = useReorderTasks();

  useEffect(() => {
    setLocalTasks(workflow.tasks);
  }, [workflow.tasks]);

  const columns = useMemo(() => {
    const cols = [
      { id: 'unassigned', title: 'Repositorio Principal', partnerId: null, isPool: true }
    ];
    partners.forEach(p => {
      cols.push({ id: p.id, title: p.name, partnerId: p.id, isPool: false });
    });

    return cols.map(col => {
      const colTasks = localTasks
        .filter(t => t.partnerId === col.partnerId)
        .sort((a, b) => a.orderIndex - b.orderIndex);
      return { ...col, tasks: colTasks };
    });
  }, [localTasks, partners]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourcePartnerId = source.droppableId === 'unassigned' ? null : source.droppableId;
    const destPartnerId = destination.droppableId === 'unassigned' ? null : destination.droppableId;

    const newLocalTasks = [...localTasks];
    
    const sourceTasks = newLocalTasks
      .filter(t => t.partnerId === sourcePartnerId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
      
    const destTasks = sourcePartnerId === destPartnerId 
      ? sourceTasks 
      : newLocalTasks
          .filter(t => t.partnerId === destPartnerId)
          .sort((a, b) => a.orderIndex - b.orderIndex);

    const [movedTask] = sourceTasks.splice(source.index, 1);
    movedTask.partnerId = destPartnerId;
    destTasks.splice(destination.index, 0, movedTask);

    const updatesToPush: { id: string; partnerId: string | null; orderIndex: number }[] = [];
    
    destTasks.forEach((t, idx) => {
      t.orderIndex = idx;
      updatesToPush.push({ id: t.id, partnerId: destPartnerId, orderIndex: idx });
    });

    if (sourcePartnerId !== destPartnerId) {
      sourceTasks.forEach((t, idx) => {
        t.orderIndex = idx;
        updatesToPush.push({ id: t.id, partnerId: sourcePartnerId, orderIndex: idx });
      });
    }

    setLocalTasks(newLocalTasks);
    reorderTasks.mutate(updatesToPush);
  };

  const handleAddTask = (columnId: string, partnerId: string | null, e: React.FormEvent) => {
    e.preventDefault();
    const content = newTaskContent[columnId];
    if (!content?.trim()) return;

    const orderIndex = localTasks.filter(t => t.partnerId === partnerId).length;

    createTask.mutate({ workflowId: workflow.id, partnerId, content, orderIndex }, {
      onSuccess: () => setNewTaskContent({ ...newTaskContent, [columnId]: '' })
    });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteTask.mutate(id);
    setLocalTasks(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="flex h-full w-full overflow-x-auto pb-4 no-scrollbar items-start space-x-6">
      <DragDropContext onDragEnd={onDragEnd}>
        {columns.map(column => (
          <div 
            key={column.id} 
            className={cn(
              "flex-shrink-0 w-80 rounded-[1.5rem] flex flex-col max-h-full border shadow-sm overflow-hidden",
              column.isPool ? "bg-blue-50/60 border-blue-200/50" : "bg-zinc-100/80 border-zinc-200/50"
            )}
          >
            
            <div className={cn("p-4 border-b flex justify-between items-center shrink-0", column.isPool ? "bg-blue-100/50 border-blue-200/50" : "bg-white/50 border-zinc-200/50 backdrop-blur-sm")}>
              <h3 className="font-bold text-zinc-800 flex items-center gap-2">
                {column.isPool ? <Database className="w-4 h-4 text-blue-600" /> : <UserSquare2 className="w-4 h-4 text-emerald-600" />}
                {column.title}
              </h3>
              <span className={cn("text-xs font-bold px-2 py-1 rounded-md", column.isPool ? "bg-blue-200 text-blue-700" : "bg-zinc-200 text-zinc-600")}>
                {column.tasks.length}
              </span>
            </div>

            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div 
                  {...provided.droppableProps} 
                  ref={provided.innerRef}
                  className={cn(
                    "flex-1 overflow-y-auto p-4 space-y-3 min-h-[150px] transition-colors duration-200",
                    snapshot.isDraggingOver ? "bg-zinc-200/50" : ""
                  )}
                >
                  {column.tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={cn(
                            "bg-white p-3.5 rounded-xl border shadow-sm group relative",
                            snapshot.isDragging ? "shadow-xl border-blue-300 ring-2 ring-blue-500/20 rotate-2 z-50" : "border-zinc-200 hover:border-blue-200 hover:shadow-md transition-all"
                          )}
                        >
                          <Button 
                            type="button"
                            variant="ghost" 
                            size="icon" 
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 h-6 w-6 text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all z-10"
                            onClick={(e) => handleDelete(task.id, e)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                          <div className="flex gap-2">
                            <GripVertical className="w-4 h-4 text-zinc-300 shrink-0 mt-0.5" />
                            <p className="text-sm font-medium text-zinc-700 leading-snug pr-4">
                              {task.content}
                            </p>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            <div className={cn("p-3 border-t shrink-0", column.isPool ? "bg-blue-100/30 border-blue-200/50" : "bg-white/40 border-zinc-200/50")}>
              <form onSubmit={(e) => handleAddTask(column.id, column.partnerId, e)} className="flex gap-2">
                <Input 
                  placeholder="Añadir función..." 
                  className="h-9 bg-white text-sm focus-visible:ring-blue-600/20"
                  value={newTaskContent[column.id] || ''}
                  onChange={e => setNewTaskContent({ ...newTaskContent, [column.id]: e.target.value })}
                />
                <Button type="submit" size="icon" className="h-9 w-9 shrink-0 bg-zinc-800 hover:bg-zinc-900" disabled={createTask.isPending}>
                  <Plus className="w-4 h-4" />
                </Button>
              </form>
            </div>

          </div>
        ))}
      </DragDropContext>
    </div>
  );
}