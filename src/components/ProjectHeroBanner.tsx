import React from 'react';
import { Settings, Send } from 'lucide-react';
import type { Project, User, TaskStats } from '../types';

interface ProjectHeroBannerProps {
  project: Project | null;
  users: User[];
  stats: TaskStats | null;
  onOpenSettings: () => void;
  activeNavTab?: 'dashboard' | 'my_task' | 'team';
  onClearUnread?: () => void;
  unreadCount?: number;
}

export const ProjectHeroBanner: React.FC<ProjectHeroBannerProps> = ({
  project,
  users,
  stats,
  onOpenSettings,
  activeNavTab = 'dashboard',
  onClearUnread,
  unreadCount = 0,
}) => {
  const isDashboardProject = !project || ['proj_smart_dashboard', 'proj_fleet', 'proj_finance', 'proj_job_seeker'].includes(project._id);
  const isMyTasks = activeNavTab === 'my_task';
  const isTeam = activeNavTab === 'team';

  const displayTitle = isMyTasks
    ? 'My Tasks'
    : isTeam
    ? 'Team Overview'
    : project
    ? project.name
    : 'Smart Dashboard Redesign';

  const breadcrumbParent = isMyTasks || isTeam ? 'Overview' : isDashboardProject ? 'Dashboard Project' : 'Workspace';
  const breadcrumbCurrent = isMyTasks ? 'My Task' : isTeam ? 'Team' : (project ? project.name : 'Smart Dashboard Redesign');

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
      {/* Top Row: Title, Breadcrumbs, Team Avatars & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              {displayTitle}
            </h1>
            {isMyTasks && unreadCount > 0 && (
              <span className="flex items-center gap-1.5 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                {unreadCount} unread
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>{breadcrumbParent}</span>
            <span>/</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {breadcrumbCurrent}
            </span>
            {isMyTasks && (
              <>
                <span>·</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-medium">Assigned to you</span>
              </>
            )}
          </div>
        </div>

        {/* Right Actions: Team Avatars Stack + Cog + Share */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Overlapping Avatar Stack */}
          <div className="flex items-center -space-x-2 overflow-hidden">
            {users.slice(0, 4).map((user) => (
              <img
                key={user._id}
                src={user.avatar}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover dark:ring-slate-900"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ))}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 ring-2 ring-white text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:ring-slate-900 dark:text-slate-300">
              +8
            </div>
          </div>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            title="Project Settings"
            aria-label="Project Settings"
          >
            <Settings className="h-4 w-4" />
          </button>

          {/* Share / Send Button */}
          <button
            onClick={() => {}}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            title="Share Project"
            aria-label="Share Project"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Row: 4 Metric Cards (Matching Screenshot) */}
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {/* Total Task */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800/80 dark:bg-slate-800/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Task
            </span>
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              12%
            </span>
          </div>
          <div className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
            {stats ? stats.total : 128}
          </div>
          <span className="mt-1 block text-[11px] text-slate-400 dark:text-slate-500">
            +12 This Week
          </span>
        </div>

        {/* Overdue Task */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800/80 dark:bg-slate-800/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Overdue Task
            </span>
            <span className="flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              1%
            </span>
          </div>
          <div className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
            {stats ? stats.overdue : 6}
          </div>
          <span className="mt-1 block text-[11px] text-slate-400 dark:text-slate-500">
            +12 This Week
          </span>
        </div>

        {/* In Progress */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800/80 dark:bg-slate-800/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              In Progress
            </span>
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              On Track
            </span>
          </div>
          <div className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
            {stats ? stats.inProgress : 34}
          </div>
          <span className="mt-1 block text-[11px] text-slate-400 dark:text-slate-500">
            Active Task
          </span>
        </div>

        {/* Completed */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800/80 dark:bg-slate-800/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Completed
            </span>
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              8%
            </span>
          </div>
          <div className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
            {stats ? stats.done : 24}
          </div>
          <span className="mt-1 block text-[11px] text-slate-400 dark:text-slate-500">
            This Week
          </span>
        </div>
      </div>
    </div>
  );
};
