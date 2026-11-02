import React from 'react';
import { Calendar, ChevronRight, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import type { Task, User, Project } from '../types';

interface TimelineViewProps {
  tasks: Task[];
  users: User[];
  projects: Project[];
  onSelectTask: (task: Task) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  tasks,
  users,
  projects,
  onSelectTask,
}) => {
  // Calendar days range for November 2026
  const days: { dateStr: string; dayNum: number; dayName: string; isToday: boolean }[] = [];
  const todayStr = '2026-11-02';

  for (let d = 1; d <= 15; d++) {
    const pad = d < 10 ? `0${d}` : `${d}`;
    const dateStr = `2026-11-${pad}`;
    const dateObj = new Date(2026, 10, d);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    days.push({
      dateStr,
      dayNum: d,
      dayName,
      isToday: dateStr === todayStr,
    });
  }

  return (
    <div className="flex flex-col h-full overflow-hidden p-4 sm:p-6">
      {/* Intro Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Sprint Schedule & Delivery Roadmap
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            November 2026 delivery window with live milestones and dependency tracking.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-slate-600 dark:text-slate-400">In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-slate-600 dark:text-slate-400">Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span className="text-slate-600 dark:text-slate-400">Urgent/Overdue</span>
          </div>
        </div>
      </div>

      {/* Timeline Grid Container */}
      <div className="flex-1 overflow-auto rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="min-w-[900px]">
          {/* Days Header */}
          <div className="grid grid-cols-15 border-b border-slate-200 bg-slate-50/80 text-center font-mono dark:border-slate-800 dark:bg-slate-800/80">
            {days.map((day) => (
              <div
                key={day.dateStr}
                className={`py-3 px-1 border-r border-slate-200/60 dark:border-slate-800/60 last:border-r-0 ${
                  day.isToday ? 'bg-blue-50/60 dark:bg-blue-950/40 font-bold' : ''
                }`}
              >
                <span className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase">
                  {day.dayName}
                </span>
                <span
                  className={`mt-0.5 inline-block text-xs tabular-nums ${
                    day.isToday
                      ? 'rounded-full bg-blue-600 text-white px-1.5 py-0.5'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {day.dayNum}
                </span>
              </div>
            ))}
          </div>

          {/* Timeline Tasks Grouped by Project */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {projects.map((project) => {
              const projectTasks = tasks.filter((t) => t.projectId === project._id);
              if (projectTasks.length === 0) return null;

              return (
                <div key={project._id} className="p-3">
                  {/* Project Row Label */}
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      {project.name}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      ({projectTasks.length} tasks)
                    </span>
                  </div>

                  {/* Task Bars Row */}
                  <div className="space-y-2 pl-4">
                    {projectTasks.map((task) => {
                      const assignee = users.find((u) => u._id === task.assigneeId);
                      // Calculate due day index
                      const dueDay = parseInt(task.dueDate.split('-')[2] || '5', 10);
                      const colStart = Math.max(1, Math.min(15, dueDay - 2));
                      const colSpan = Math.max(2, Math.min(4, 16 - colStart));
                      const isOverdue = task.status !== 'done' && task.dueDate < todayStr;

                      return (
                        <div
                          key={task._id}
                          onClick={() => onSelectTask(task)}
                          className="group grid grid-cols-15 items-center gap-1 cursor-pointer py-1"
                        >
                          <div
                            style={{
                              gridColumn: `${colStart} / span ${colSpan}`,
                            }}
                            className={`flex items-center justify-between rounded-lg border px-3 py-1.5 text-xs transition-all hover:scale-[1.01] hover:shadow-xs ${
                              task.status === 'done'
                                ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200'
                                : isOverdue
                                ? 'border-rose-200 bg-rose-50/80 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200'
                                : 'border-blue-200 bg-blue-50/70 text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              {task.status === 'done' ? (
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                              ) : isOverdue ? (
                                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-rose-600 dark:text-rose-400" />
                              ) : (
                                <Clock className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                              )}
                              <span className="truncate font-medium">{task.title}</span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 pl-2">
                              {assignee && (
                                <img
                                  src={assignee.avatar}
                                  alt={assignee.name}
                                  referrerPolicy="no-referrer"
                                  className="h-4 w-4 rounded-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              )}
                              <span className="font-mono text-[10px] opacity-75">
                                {task.dueDate.substring(5)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
