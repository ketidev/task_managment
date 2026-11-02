import React from 'react';
import {
  Kanban,
  ListTodo,
  CalendarDays,
  BarChart2,
  Search,
  Filter,
  ArrowUpDown,
} from 'lucide-react';
import type { ViewMode } from './Sidebar';

interface ViewToolbarProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  taskSearch: string;
  onTaskSearchChange: (q: string) => void;
  onOpenFilter: () => void;
  onOpenSort: () => void;
}

export const ViewToolbar: React.FC<ViewToolbarProps> = ({
  currentView,
  onSelectView,
  taskSearch,
  onTaskSearchChange,
  onOpenFilter,
  onOpenSort,
}) => {
  return (
    <div className="flex flex-col gap-3 py-1 sm:flex-row sm:items-center sm:justify-between">
      {/* Left Segmented View Tabs */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onSelectView('kanban')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            currentView === 'kanban'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Kanban className="h-3.5 w-3.5" />
          <span>Board</span>
        </button>

        <button
          onClick={() => onSelectView('list')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            currentView === 'list'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <ListTodo className="h-3.5 w-3.5" />
          <span>List</span>
        </button>

        <button
          onClick={() => onSelectView('timeline')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            currentView === 'timeline'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <CalendarDays className="h-3.5 w-3.5" />
          <span>Timeline</span>
        </button>

        <button
          onClick={() => onSelectView('analytics')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            currentView === 'analytics'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <BarChart2 className="h-3.5 w-3.5" />
          <span>Analytics</span>
        </button>
      </div>

      {/* Right Controls: Mini search, Filter & Sort */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={taskSearch}
            onChange={(e) => onTaskSearchChange(e.target.value)}
            placeholder="Search task"
            className="h-9 w-44 rounded-xl border border-slate-200/80 bg-white pl-8 pr-3 text-xs text-slate-700 shadow-2xs focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <button
          onClick={onOpenFilter}
          className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          <Filter className="h-3.5 w-3.5 text-slate-500" />
          <span>Filter</span>
        </button>

        <button
          onClick={onOpenSort}
          className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          <ArrowUpDown className="h-3.5 w-3.5 text-slate-500" />
          <span>Sort</span>
        </button>
      </div>
    </div>
  );
};
