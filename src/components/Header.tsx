import React from 'react';
import { Menu, Plus, Search, Bell } from 'lucide-react';
import type { DbStatus } from '../types';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenNewTaskModal: () => void;
  onOpenMongoModal: () => void;
  dbStatus: DbStatus | null;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  searchQuery,
  onSearchChange,
  onOpenNewTaskModal,
  onOpenMongoModal,
  dbStatus,
}) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between gap-4 bg-[#F8F9FD] px-4 dark:bg-[#0A0D14] sm:px-8">
      {/* Mobile Toggle Button */}
      <button
        onClick={onOpenMobileSidebar}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 lg:hidden shrink-0"
        aria-label="Open sidebar navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Center / Search Input (matches screenshot) */}
      <div className="relative w-full max-w-lg">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search task, project or ask AI"
          className="h-10 w-full rounded-xl border border-slate-200/80 bg-white pl-10 pr-12 text-xs text-slate-800 placeholder:text-slate-400 shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
        />
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
          <span>⌘</span>
          <span>K</span>
        </div>
      </div>

      {/* Right Actions (Notification Bell & + New Task CTA) */}
      <div className="flex items-center gap-3 shrink-0">

        {/* Notification Bell */}
        <button
          onClick={() => {}}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
        </button>

        {/* + New Task Primary CTA */}
        <button
          onClick={onOpenNewTaskModal}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 active:bg-indigo-800 transition-colors whitespace-nowrap"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>New Task</span>
        </button>
      </div>
    </header>
  );
};
