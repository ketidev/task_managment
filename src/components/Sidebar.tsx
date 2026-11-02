import React, { useState } from 'react';
import {
  LayoutGrid,
  CheckSquare,
  Users,
  Calendar,
  PieChart,
  Settings,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  X,
  Database,
  Moon,
  Sun,
} from 'lucide-react';
import type { Project, DbStatus, User } from '../types';

export type ViewMode = 'kanban' | 'list' | 'timeline' | 'analytics';
export type OverviewTab = 'dashboard' | 'my_task' | 'team';

interface SidebarProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (projectId: string) => void;
  currentUser: User | null;
  onOpenSettingsModal: () => void;
  darkMode: boolean;
  onToggleTheme: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  activeNavTab: OverviewTab;
  onSelectNavTab: (tab: OverviewTab) => void;
  unreadCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  projects,
  selectedProjectId,
  onSelectProject,
  currentUser,
  onOpenSettingsModal,
  darkMode,
  onToggleTheme,
  isOpenMobile,
  onCloseMobile,
  activeNavTab,
  onSelectNavTab,
  unreadCount,
}) => {
  const [isWorkspaceExpanded, setIsWorkspaceExpanded] = useState(true);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200/80 bg-white transition-transform duration-200 ease-in-out dark:border-slate-800 dark:bg-[#0F1422] lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-18 items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            {/* Zendo Double-loop Logo */}
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.267-8-12.362-8-5.096 0-5.096 8 0 8 5.095 0 7.267-8 12.362-8z" />
              </svg>
            </div>
            <span className="text-lg font-black tracking-wide text-slate-900 dark:text-white uppercase font-sans">
              ZENDO
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Dark mode toggle pill switch */}
            <button
              onClick={onToggleTheme}
              className="flex h-6 w-11 items-center rounded-full bg-slate-200 p-0.5 transition-colors dark:bg-slate-700"
              title="Toggle theme appearance"
              aria-label="Toggle theme appearance"
            >
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-xs transition-transform dark:bg-slate-900 ${
                  darkMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              >
                {darkMode ? (
                  <Moon className="h-3 w-3 text-indigo-400" />
                ) : (
                  <Sun className="h-3 w-3 text-amber-500" />
                )}
              </div>
            </button>

            <button
              onClick={onCloseMobile}
              className="rounded-md p-1 text-slate-400 hover:text-slate-600 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6">
          {/* Overview */}
          <div>
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              Overview
            </span>
            <div className="mt-2 space-y-1">
              <button
                onClick={() => {
                  onSelectNavTab('dashboard');
                  onSelectView('kanban');
                  onCloseMobile();
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                  activeNavTab === 'dashboard'
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-slate-200'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => {
                  onSelectNavTab('my_task');
                  onSelectView('list');
                  onCloseMobile();
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  activeNavTab === 'my_task'
                    ? 'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50/70 dark:bg-indigo-950/40'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CheckSquare className="h-4 w-4" />
                  <span>My Task</span>
                </div>
                {unreadCount > 0 && (
                  <span className="flex h-4.5 min-w-4.5 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white transition-all duration-300 animate-in fade-in zoom-in">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  onSelectNavTab('team');
                  onSelectView('analytics');
                  onCloseMobile();
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  activeNavTab === 'team'
                    ? 'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50/70 dark:bg-indigo-950/40'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-slate-200'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Team</span>
              </button>
            </div>
          </div>

          {/* Workspace */}
          <div>
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              Workspace
            </span>
            <div className="mt-2 space-y-1.5">
              {/* Dashboard Project Accordion */}
              <div>
                <button
                  onClick={() => setIsWorkspaceExpanded(!isWorkspaceExpanded)}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-600 text-[11px] font-bold text-white">
                      D
                    </span>
                    <span>Dashboard Project</span>
                  </div>
                  {isWorkspaceExpanded ? (
                    <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                  )}
                </button>

                {isWorkspaceExpanded && (
                  <div className="mt-1 space-y-1 pl-4">
                    {[
                      { id: 'proj_smart_dashboard', name: 'Smart Dashboard Redesign' },
                      { id: 'proj_fleet', name: 'Fleet Management System' },
                      { id: 'proj_finance', name: 'Finance Dashboard' },
                      { id: 'proj_job_seeker', name: 'Job Seeker Admin View' },
                    ].map((item) => {
                      const isSelected = selectedProjectId === item.id && activeNavTab === 'dashboard';
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            onSelectProject(item.id);
                            onSelectNavTab('dashboard');
                            onCloseMobile();
                          }}
                          className={`relative flex w-full items-center py-1.5 pl-3 pr-2 text-left text-xs transition-colors rounded-md ${
                            isSelected
                              ? 'font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
                              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                          }`}
                        >
                          {isSelected && (
                            <span className="absolute left-0 top-1 bottom-1 w-0.75 rounded-full bg-indigo-600" />
                          )}
                          <span className="truncate">{item.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tools */}
          <div>
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              Tools
            </span>
            <div className="mt-2 space-y-1">
              <button
                onClick={() => {
                  onSelectView('timeline');
                  onCloseMobile();
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-slate-200"
              >
                <Calendar className="h-4 w-4" />
                <span>Calendar</span>
              </button>

              <button
                onClick={() => {
                  onSelectView('analytics');
                  onCloseMobile();
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-slate-200"
              >
                <PieChart className="h-4 w-4" />
                <span>Report</span>
              </button>

              <button
                onClick={onOpenSettingsModal}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-slate-200"
              >
                <Settings className="h-4 w-4" />
                <span>Setting</span>
              </button>
            </div>
          </div>
        </div>

        {/* User Profile Bar */}
        <div className="border-t border-slate-100 px-4 py-3 dark:border-slate-800/60">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2 dark:bg-slate-800/50">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={currentUser?.avatar || '/src/assets/images/avatar_devon_reed_1793617778986.jpg'}
                alt={currentUser?.name || 'User'}
                referrerPolicy="no-referrer"
                className="h-8 w-8 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="min-w-0">
                <span className="block truncate text-xs font-bold text-slate-900 dark:text-white">
                  {currentUser?.name || 'Brilyan Andi Syahbana'}
                </span>
                <span className="block truncate text-[11px] text-slate-400 dark:text-slate-500">
                  {currentUser?.role || 'UI/UX Designer'}
                </span>
              </div>
            </div>
            <ChevronsUpDown className="h-4 w-4 text-slate-400 shrink-0" />
          </div>
        </div>
      </aside>
    </>
  );
};
