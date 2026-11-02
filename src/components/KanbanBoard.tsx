import React, { useState } from 'react';
import {
  Plus,
  MoreHorizontal,
  Clock,
  ListTodo,
  MessageSquare,
  ChevronDown,
} from 'lucide-react';
import type { Task, TaskStatus, User, Project } from '../types';

interface KanbanBoardProps {
  tasks: Task[];
  users: User[];
  projects: Project[];
  onSelectTask: (task: Task) => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onQuickAddTask: (status: TaskStatus) => void;
  unreadTaskIds?: string[];
}

const COLUMNS: { id: TaskStatus; title: string; dotColor: string }[] = [
  { id: 'todo', title: 'To Do', dotColor: 'bg-blue-500' },
  { id: 'in_progress', title: 'In Progress', dotColor: 'bg-amber-500' },
  { id: 'review', title: 'Review', dotColor: 'bg-indigo-500' },
  { id: 'done', title: 'Done', dotColor: 'bg-emerald-500' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  users,
  projects,
  onSelectTask,
  onUpdateStatus,
  onQuickAddTask,
  unreadTaskIds = [],
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, colId: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== colId) setDragOverCol(colId);
  };

  const handleDrop = (e: React.DragEvent, colId: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      onUpdateStatus(taskId, colId);
    }
    setDraggedTaskId(null);
    setDragOverCol(null);
  };

  const getCategoryStyle = (cat?: string) => {
    switch (cat?.toLowerCase()) {
      case 'design':
        return 'text-emerald-700 bg-emerald-50/80 dark:bg-emerald-950/50 dark:text-emerald-300';
      case 'backend':
        return 'text-blue-700 bg-blue-50/80 dark:bg-blue-950/50 dark:text-blue-300';
      case 'qa':
        return 'text-amber-800 bg-amber-50/90 dark:bg-amber-950/50 dark:text-amber-300';
      case 'legal':
        return 'text-indigo-700 bg-indigo-50/80 dark:bg-indigo-950/50 dark:text-indigo-300';
      case 'marketing':
        return 'text-teal-700 bg-teal-50/80 dark:bg-teal-950/50 dark:text-teal-300';
      case 'research':
        return 'text-sky-700 bg-sky-50/80 dark:bg-sky-950/50 dark:text-sky-300';
      default:
        return 'text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
      case 'high':
        return 'text-rose-600 bg-rose-50/80 dark:bg-rose-950/50 dark:text-rose-300 font-semibold';
      case 'medium':
        return 'text-amber-600 bg-amber-50/80 dark:bg-amber-950/50 dark:text-amber-300 font-medium';
      case 'low':
      default:
        return 'text-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/50 dark:text-emerald-300 font-medium';
    }
  };

  return (
    <div className="h-full w-full overflow-x-auto pb-6">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 min-w-[1020px] pt-2">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          const isOver = dragOverCol === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`flex flex-col rounded-2xl transition-colors p-1 ${
                isOver ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
              }`}
            >
              {/* Column Header matching screenshot */}
              <div className="mb-3 flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${col.dotColor}`} />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    {col.title}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onQuickAddTask(col.id)}
                    className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                    title={`Add task to ${col.title}`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                    title="Column options"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Tasks List */}
              <div className="space-y-3">
                {colTasks.map((task) => {
                  const assignedUsers = users.filter(
                    (u) =>
                      u._id === task.assigneeId ||
                      (task.assigneeIds && task.assigneeIds.includes(u._id))
                  );
                  const isDragging = draggedTaskId === task._id;
                  const category = task.category || (task.tags && task.tags[0]) || 'Design';

                  return (
                    <div
                      key={task._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task._id)}
                      onClick={() => onSelectTask(task)}
                      className={`group cursor-pointer rounded-2xl border border-slate-200/70 bg-white p-4 shadow-2xs transition-all hover:border-slate-300 hover:shadow-xs dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-slate-700 ${
                        isDragging ? 'opacity-40 scale-95' : 'opacity-100'
                      }`}
                    >
                      {/* Top Badges (Category & Priority) */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${getCategoryStyle(
                            category
                          )}`}
                        >
                          {category}
                        </span>
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] capitalize ${getPriorityStyle(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                        {unreadTaskIds.includes(task._id) && (
                          <span className="ml-auto flex items-center gap-1 rounded-full bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                            New
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="mt-2 text-xs font-bold leading-snug text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                        {task.title}
                      </h3>

                      {/* Optional UI Mockup Preview Image (as shown in Review & Done cards) */}
                      {task.imageAttachment && (
                        <div className="mt-2.5 overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                          <img
                            src={task.imageAttachment}
                            alt="Mockup preview"
                            referrerPolicy="no-referrer"
                            className="h-28 w-full object-cover transition-transform duration-300 group-hover:scale-102"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      {/* Metadata Row: Subtasks & Duration */}
                      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                        <div className="flex items-center gap-1.5 font-medium">
                          <ListTodo className="h-3 w-3 stroke-[2]" />
                          <span>{task.checklist?.length || 4} Subtasks</span>
                        </div>
                        <div className="flex items-center gap-1 font-medium font-mono tabular-nums">
                          <Clock className="h-3 w-3 stroke-[2]" />
                          <span>
                            {task.estimatedHours ? `${Math.round(task.estimatedHours / 2)} Days` : '4 Days'}
                          </span>
                        </div>
                      </div>

                      {/* Footer Row: Avatar Stack & Comment Count */}
                      <div className="mt-3 flex items-center justify-between border-t border-slate-100/80 pt-2.5 dark:border-slate-800/80">
                        {/* Overlapping Avatar Stack */}
                        <div className="flex items-center -space-x-1.5">
                          {(assignedUsers.length > 0 ? assignedUsers : users.slice(0, 1)).map(
                            (u) => (
                              <img
                                key={u._id}
                                src={u.avatar}
                                alt={u.name}
                                referrerPolicy="no-referrer"
                                className="h-6 w-6 rounded-full object-cover ring-2 ring-white dark:ring-slate-900"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )
                          )}
                        </div>

                        {/* Comments Count */}
                        <div className="flex items-center gap-1 text-[11px] font-mono tabular-nums text-slate-400">
                          <MessageSquare className="h-3 w-3 stroke-[2]" />
                          <span>{typeof task.commentsCount === 'number' ? task.commentsCount : 1}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Empty State / Add Card */}
                {colTasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200/80 py-10 text-center dark:border-slate-800">
                    <p className="text-xs text-slate-400">No tasks in {col.title}</p>
                    <button
                      onClick={() => onQuickAddTask(col.id)}
                      className="mt-2 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      + Add task
                    </button>
                  </div>
                )}

                {/* See More button at bottom of column (matching screenshot) */}
                {colTasks.length > 0 && (
                  <button
                    onClick={() => onQuickAddTask(col.id)}
                    className="flex w-full items-center justify-center gap-1 py-1 text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <span>See More</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
