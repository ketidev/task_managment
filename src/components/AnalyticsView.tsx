import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  Users,
  Target,
  BarChart,
  ShieldCheck,
} from 'lucide-react';
import type { Task, User, Project, TaskStats } from '../types';

interface AnalyticsViewProps {
  stats: TaskStats | null;
  tasks: Task[];
  users: User[];
  projects: Project[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  stats,
  tasks,
  users,
  projects,
}) => {
  if (!stats) return null;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* 4-KPI Metric Strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Metric 1 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Completion Rate
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {stats.completionRate}%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ({stats.done}/{stats.total} tasks)
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Active in Pipeline
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {stats.inProgress + stats.todo}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              in development
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
            {stats.review} items waiting in review
          </p>
        </div>

        {/* Metric 3 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Overdue & Critical
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tabular-nums text-rose-600 dark:text-rose-400">
              {stats.overdue}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              past due date
            </span>
          </div>
          <p className="mt-2 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            {stats.dueSoon} tasks due in 48 hours
          </p>
        </div>

        {/* Metric 4 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Engineering Workload
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {stats.totalEstimatedHours}h
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              total scoped
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
            Across {projects.length} active initiatives
          </p>
        </div>
      </div>

      {/* Two-Column Analytics Split */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Status Pipeline Breakdown */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Task Status Distribution
            </h4>
            <span className="font-mono text-xs text-slate-400 tabular-nums">
              {stats.total} total
            </span>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Completed', count: stats.done, color: 'bg-emerald-500' },
              { label: 'In Review', count: stats.review, color: 'bg-purple-500' },
              { label: 'In Progress', count: stats.inProgress, color: 'bg-blue-500' },
              { label: 'To Do', count: stats.todo, color: 'bg-amber-500' },
              { label: 'Backlog', count: stats.backlog, color: 'bg-slate-400' },
            ].map((item) => {
              const pct = stats.total ? Math.round((item.count / stats.total) * 100) : 0;
              return (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {item.label}
                    </span>
                    <div className="flex items-center gap-2 font-mono tabular-nums">
                      <span className="font-semibold text-slate-900 dark:text-white">{item.count}</span>
                      <span className="text-slate-400">({pct}%)</span>
                    </div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full ${item.color} transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Spectrum */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Priority Urgency Breakdown
            </h4>
            <span className="text-xs text-slate-400">Sprint risk assessment</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Urgent', count: tasks.filter((t) => t.priority === 'urgent').length, color: 'border-rose-200 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-950/20', text: 'text-rose-600 dark:text-rose-400' },
              { label: 'High', count: tasks.filter((t) => t.priority === 'high').length, color: 'border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20', text: 'text-amber-600 dark:text-amber-400' },
              { label: 'Medium', count: tasks.filter((t) => t.priority === 'medium').length, color: 'border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-950/20', text: 'text-blue-600 dark:text-blue-400' },
              { label: 'Low', count: tasks.filter((t) => t.priority === 'low').length, color: 'border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40', text: 'text-slate-600 dark:text-slate-400' },
            ].map((p) => (
              <div key={p.label} className={`rounded-lg border p-3 ${p.color}`}>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {p.label} Priority
                </span>
                <p className={`mt-1 font-mono text-xl font-bold tabular-nums ${p.text}`}>
                  {p.count}
                </p>
                <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                  {stats.total ? Math.round((p.count / stats.total) * 100) : 0}% of active backlog
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Workload & Velocity Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Team Workload & Capacity
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Task assignments and delivery throughput per team engineer
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Users className="h-4 w-4" />
            <span className="font-mono tabular-nums">{users.length} engineers</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {users.map((user) => {
            const userTasks = tasks.filter((t) => t.assigneeId === user._id);
            const userCompleted = userTasks.filter((t) => t.status === 'done').length;
            const userHours = userTasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);
            const userRate = userTasks.length ? Math.round((userCompleted / userTasks.length) * 100) : 0;

            return (
              <div
                key={user._id}
                className="flex flex-col justify-between rounded-lg border border-slate-200 bg-slate-50/40 p-4 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-white dark:ring-slate-700"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="min-w-0">
                    <h5 className="truncate text-xs font-bold text-slate-900 dark:text-white">
                      {user.name}
                    </h5>
                    <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                      {user.role}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2 border-t border-slate-200/80 pt-3 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Tasks</span>
                    <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                      {userCompleted} / {userTasks.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Est. Hours</span>
                    <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                      {userHours}h
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Velocity</span>
                    <span className="font-mono font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                      {userRate}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
