import React, { useState, useEffect } from 'react';
import {
  ArrowUpDown,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Trash2,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { Task, TaskStatus, TaskPriority, User, Project } from '../types';

interface TaskListViewProps {
  tasks: Task[];
  users: User[];
  projects: Project[];
  onSelectTask: (task: Task) => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  unreadTaskIds?: string[];
}

type SortField = 'title' | 'status' | 'priority' | 'dueDate' | 'estimatedHours';

export const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  users,
  projects,
  onSelectTask,
  onUpdateStatus,
  onDeleteTask,
  unreadTaskIds = [],
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const PAGE_SIZE = 5;

  // Reset to page 1 whenever tasks list or sorting changes
  useEffect(() => {
    setCurrentPage(1);
  }, [tasks.length, sortField, sortAsc]);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(tasks.map((t) => t._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkComplete = () => {
    selectedIds.forEach((id) => onUpdateStatus(id, 'done'));
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (confirm(`Delete ${selectedIds.length} selected tasks?`)) {
      selectedIds.forEach((id) => onDeleteTask(id));
      setSelectedIds([]);
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    let valA = a[sortField] || '';
    let valB = b[sortField] || '';

    if (sortField === 'priority') {
      const pMap = { urgent: 4, high: 3, medium: 2, low: 1 };
      valA = pMap[a.priority] || 0;
      valB = pMap[b.priority] || 0;
    }

    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const isPaginated = sortedTasks.length > PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(sortedTasks.length / PAGE_SIZE));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * PAGE_SIZE;
  const paginatedTasks = isPaginated
    ? sortedTasks.slice(startIndex, startIndex + PAGE_SIZE)
    : sortedTasks;

  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case 'urgent':
        return <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Urgent</span>;
      case 'high':
        return <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">High</span>;
      case 'medium':
        return <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Medium</span>;
      case 'low':
      default:
        return <span className="text-xs font-normal text-slate-500 dark:text-slate-400">Low</span>;
    }
  };

  const getStatusLabel = (s: TaskStatus) => {
    switch (s) {
      case 'backlog':
        return 'Backlog';
      case 'todo':
        return 'To Do';
      case 'in_progress':
        return 'In Progress';
      case 'review':
        return 'In Review';
      case 'done':
        return 'Completed';
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden p-4 sm:p-6">
      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50/90 px-4 py-2.5 text-xs text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/60 dark:text-blue-200">
          <div className="flex items-center gap-2">
            <span className="font-semibold font-mono tabular-nums">{selectedIds.length}</span>
            <span>tasks selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkComplete}
              className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1 font-medium text-white hover:bg-emerald-700"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Mark Done</span>
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 rounded-md bg-rose-600 px-3 py-1 font-medium text-white hover:bg-rose-700"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="flex-1 overflow-auto rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-xs">
          {/* Header Row */}
          <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/90 backdrop-blur-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/90 dark:text-slate-300">
            <tr>
              <th className="w-10 px-3.5 py-3 text-center">
                <input
                  type="checkbox"
                  checked={selectedIds.length > 0 && selectedIds.length === tasks.length}
                  onChange={handleSelectAll}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  aria-label="Select all tasks"
                />
              </th>
              <th
                onClick={() => handleSort('title')}
                className="cursor-pointer px-4 py-3 hover:text-slate-900 dark:hover:text-white"
              >
                <div className="flex items-center gap-1.5">
                  <span>Task Title</span>
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </th>
              <th className="px-4 py-3 hidden md:table-cell">Project</th>
              <th
                onClick={() => handleSort('status')}
                className="cursor-pointer px-4 py-3 hover:text-slate-900 dark:hover:text-white"
              >
                <div className="flex items-center gap-1.5">
                  <span>Status</span>
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('priority')}
                className="cursor-pointer px-4 py-3 hover:text-slate-900 dark:hover:text-white"
              >
                <div className="flex items-center gap-1.5">
                  <span>Priority</span>
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </th>
              <th className="px-4 py-3 hidden sm:table-cell">Assignee</th>
              <th
                onClick={() => handleSort('dueDate')}
                className="cursor-pointer px-4 py-3 hover:text-slate-900 dark:hover:text-white"
              >
                <div className="flex items-center gap-1.5">
                  <span>Due Date</span>
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('estimatedHours')}
                className="cursor-pointer px-4 py-3 text-right hover:text-slate-900 dark:hover:text-white hidden lg:table-cell"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Est. Hours</span>
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {paginatedTasks.map((task) => {
              const project = projects.find((p) => p._id === task.projectId);
              const assignee = users.find((u) => u._id === task.assigneeId);
              const isOverdue = task.status !== 'done' && task.dueDate < todayStr;
              const isSelected = selectedIds.includes(task._id);

              return (
                <tr
                  key={task._id}
                  onClick={() => onSelectTask(task)}
                  className={`group cursor-pointer transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/60 ${
                    isSelected ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                  }`}
                >
                  {/* Select Checkbox */}
                  <td className="w-10 px-3.5 py-3 text-center" onClick={(e) => handleSelectOne(task._id, e)}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      aria-label={`Select ${task.title}`}
                    />
                  </td>

                  {/* Title & Checklist Info */}
                  <td className="px-4 py-3 max-w-xs sm:max-w-md">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 ${task.status === 'done' ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'}`}>
                          {task.title}
                        </span>
                        {unreadTaskIds.includes(task._id) && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                            New
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
                        {project && (
                          <span className="font-mono text-slate-500 dark:text-slate-400">
                            {project.key}
                          </span>
                        )}
                        {task.checklist.length > 0 && (
                          <>
                            <span>·</span>
                            <span>
                              {task.checklist.filter((c) => c.completed).length}/{task.checklist.length} subtasks
                            </span>
                          </>
                        )}
                        {task.tags.length > 0 && (
                          <>
                            <span>·</span>
                            <span>{task.tags.slice(0, 2).join(', ')}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Project */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    {project ? (
                      <div className="flex items-center gap-1.5 truncate">
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: project.color }}
                        />
                        <span className="truncate text-slate-700 dark:text-slate-300">
                          {project.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  {/* Status Dropdown */}
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={task.status}
                      onChange={(e) => onUpdateStatus(task._id, e.target.value as TaskStatus)}
                      className={`h-7 rounded-md border border-slate-200 px-2 text-xs font-medium focus:outline-none dark:border-slate-700 ${
                        task.status === 'done'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                          : task.status === 'in_progress'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                          : 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      <option value="backlog">Backlog</option>
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="done">Completed</option>
                    </select>
                  </td>

                  {/* Priority */}
                  <td className="px-4 py-3">
                    {getPriorityBadge(task.priority)}
                  </td>

                  {/* Assignee */}
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {assignee ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={assignee.avatar}
                          alt={assignee.name}
                          referrerPolicy="no-referrer"
                          className="h-5 w-5 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <span className="text-slate-700 dark:text-slate-300 truncate max-w-[100px]">
                          {assignee.name.split(' ')[0]}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400">Unassigned</span>
                    )}
                  </td>

                  {/* Due Date */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 font-mono text-[11px] tabular-nums">
                      {isOverdue && <AlertTriangle className="h-3 w-3 text-rose-500" />}
                      <span
                        className={
                          isOverdue
                            ? 'font-semibold text-rose-600 dark:text-rose-400'
                            : 'text-slate-600 dark:text-slate-400'
                        }
                      >
                        {task.dueDate}
                      </span>
                    </div>
                  </td>

                  {/* Estimated Hours */}
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-500 dark:text-slate-400 hidden lg:table-cell">
                    {task.estimatedHours}h
                  </td>
                </tr>
              );
            })}

            {sortedTasks.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                  No tasks found matching current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Controls (shown if more than 5 items) */}
        {isPaginated && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Showing{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                {startIndex + 1}
              </span>{' '}
              to{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                {Math.min(startIndex + PAGE_SIZE, sortedTasks.length)}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                {sortedTasks.length}
              </span>{' '}
              tasks
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={validCurrentPage === 1}
                aria-label="Previous Page"
                className="flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Prev</span>
              </button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-semibold transition-all ${
                      validCurrentPage === page
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={validCurrentPage === totalPages}
                aria-label="Next Page"
                className="flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
