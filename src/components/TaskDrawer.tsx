import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Trash2,
  CheckCircle2,
  Circle,
  Plus,
  Tag,
  FolderKanban,
  User as UserIcon,
  Save,
  AlertTriangle,
} from 'lucide-react';
import type { Task, TaskStatus, TaskPriority, User, Project, ChecklistItem } from '../types';

interface TaskDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  projects: Project[];
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onToggleChecklistItem: (taskId: string, itemId: string, completed?: boolean) => Promise<void>;
}

export const TaskDrawer: React.FC<TaskDrawerProps> = ({
  task,
  isOpen,
  onClose,
  users,
  projects,
  onUpdateTask,
  onDeleteTask,
  onToggleChecklistItem,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [projectId, setProjectId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState(2);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setPriority(task.priority);
      setProjectId(task.projectId);
      setAssigneeId(task.assigneeId);
      setDueDate(task.dueDate);
      setEstimatedHours(task.estimatedHours || 2);
      setIsEditing(false);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const currentProject = projects.find((p) => p._id === (isEditing ? projectId : task.projectId));
  const currentAssignee = users.find((u) => u._id === (isEditing ? assigneeId : task.assigneeId));
  const isOverdue = task.status !== 'done' && task.dueDate < new Date().toISOString().split('T')[0];

  const handleSaveEdits = async () => {
    setIsSaving(true);
    try {
      await onUpdateTask(task._id, {
        title,
        description,
        status,
        priority,
        projectId,
        assigneeId,
        dueDate,
        estimatedHours,
      });
      setIsEditing(false);
    } catch (e) {
      console.error('Failed to save task:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddChecklistItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;

    const newItem: ChecklistItem = {
      id: `chk_${Date.now()}`,
      text: newChecklistText.trim(),
      completed: false,
    };

    const updatedList = [...task.checklist, newItem];
    await onUpdateTask(task._id, { checklist: updatedList });
    setNewChecklistText('');
  };

  const handleDeleteSelf = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      await onDeleteTask(task._id);
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Surface */}
      <div className="fixed top-0 right-0 bottom-0 z-50 flex w-full max-w-xl flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform dark:border-slate-800 dark:bg-slate-900">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            {currentProject && (
              <span
                className="font-mono text-xs font-bold px-2 py-0.5 rounded text-white"
                style={{ backgroundColor: currentProject.color }}
              >
                {currentProject.key}
              </span>
            )}
            <span className="font-mono text-xs text-slate-400">
              {task._id.substring(0, 10)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Edit Details
              </button>
            ) : (
              <button
                onClick={handleSaveEdits}
                disabled={isSaving}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save</span>
              </button>
            )}

            <button
              onClick={handleDeleteSelf}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
              title="Delete task"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Close drawer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Drawer Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Title Area */}
          <div>
            {isEditing ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-base font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            ) : (
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {task.title}
              </h2>
            )}
          </div>

          {/* Quick Status Bar */}
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/60 p-2.5 dark:border-slate-800 dark:bg-slate-800/40">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0">
              Status:
            </span>
            <div className="flex flex-wrap gap-1">
              {(['backlog', 'todo', 'in_progress', 'review', 'done'] as TaskStatus[]).map((s) => {
                const isActive = (isEditing ? status : task.status) === s;
                return (
                  <button
                    key={s}
                    onClick={() => {
                      if (isEditing) {
                        setStatus(s);
                      } else {
                        onUpdateTask(task._id, { status: s });
                      }
                    }}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                        : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    {s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Attribute Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            {/* Assignee */}
            <div className="rounded-lg border border-slate-200/80 p-3 dark:border-slate-800">
              <span className="text-slate-400 dark:text-slate-500">Assignee</span>
              {isEditing ? (
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 bg-white p-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              ) : currentAssignee ? (
                <div className="mt-1.5 flex items-center gap-2">
                  <img
                    src={currentAssignee.avatar}
                    alt={currentAssignee.name}
                    referrerPolicy="no-referrer"
                    className="h-6 w-6 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div>
                    <span className="block font-semibold text-slate-900 dark:text-white">
                      {currentAssignee.name}
                    </span>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                      {currentAssignee.role}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="mt-1 text-slate-500">Unassigned</p>
              )}
            </div>

            {/* Priority */}
            <div className="rounded-lg border border-slate-200/80 p-3 dark:border-slate-800">
              <span className="text-slate-400 dark:text-slate-500">Priority Level</span>
              {isEditing ? (
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="mt-1 w-full rounded border border-slate-300 bg-white p-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              ) : (
                <p className="mt-1 font-semibold text-slate-900 dark:text-white capitalize">
                  {task.priority}
                </p>
              )}
            </div>

            {/* Due Date */}
            <div className="rounded-lg border border-slate-200/80 p-3 dark:border-slate-800">
              <span className="text-slate-400 dark:text-slate-500">Due Date</span>
              {isEditing ? (
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 bg-white p-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              ) : (
                <div className="mt-1 flex items-center gap-1.5 font-mono tabular-nums">
                  {isOverdue && <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />}
                  <span className={isOverdue ? 'font-bold text-rose-600 dark:text-rose-400' : 'font-medium text-slate-900 dark:text-white'}>
                    {task.dueDate}
                  </span>
                </div>
              )}
            </div>

            {/* Est Hours */}
            <div className="rounded-lg border border-slate-200/80 p-3 dark:border-slate-800">
              <span className="text-slate-400 dark:text-slate-500">Estimated Effort</span>
              {isEditing ? (
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(parseInt(e.target.value, 10) || 1)}
                  className="mt-1 w-full rounded border border-slate-300 bg-white p-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              ) : (
                <p className="mt-1 font-mono font-medium tabular-nums text-slate-900 dark:text-white">
                  {task.estimatedHours} hours
                </p>
              )}
            </div>
          </div>

          {/* Description Section */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Description & Specification
            </h4>
            {isEditing ? (
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 p-2.5 text-xs leading-relaxed text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            ) : (
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">
                {task.description || 'No description provided.'}
              </p>
            )}
          </div>

          {/* Checklist / Subtasks */}
          <div className="border-t border-slate-200 pt-5 dark:border-slate-800">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                Checklist & Verification
              </h4>
              <span className="font-mono text-xs tabular-nums text-slate-400">
                {task.checklist.filter((i) => i.completed).length}/{task.checklist.length}
              </span>
            </div>

            {/* Checklist items */}
            <div className="space-y-2">
              {task.checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onToggleChecklistItem(task._id, item.id, !item.completed)}
                  className="flex items-center gap-2.5 rounded-lg border border-slate-200/60 p-2.5 text-xs cursor-pointer hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                >
                  {item.completed ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600" />
                  )}
                  <span
                    className={`flex-1 ${
                      item.completed
                        ? 'line-through text-slate-400 dark:text-slate-500'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Add Checklist Item Form */}
            <form onSubmit={handleAddChecklistItem} className="mt-3 flex gap-2">
              <input
                type="text"
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                placeholder="Add subtask or acceptance criterion..."
                className="h-8 flex-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <button
                type="submit"
                className="flex items-center gap-1 rounded-md bg-slate-100 px-3 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <Plus className="h-3 w-3" />
                <span>Add</span>
              </button>
            </form>
          </div>

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                <Tag className="h-3.5 w-3.5" />
                <span className="uppercase font-semibold tracking-wider text-[11px]">Tags</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="border-t border-slate-200 pt-4 text-[11px] text-slate-400 dark:border-slate-800">
            <p>Created: {new Date(task.createdAt).toLocaleString()}</p>
            <p>Updated: {new Date(task.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </>
  );
};
