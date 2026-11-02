import React, { useState } from 'react';
import {
  X,
  Settings,
  Bell,
  Palette,
  Users,
  CheckCircle2,
  RefreshCw,
  FolderKanban,
  Sliders,
} from 'lucide-react';
import type { Project, User } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  users: User[];
  darkMode: boolean;
  onToggleTheme: () => void;
  onSeedData: () => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  projects,
  users,
  darkMode,
  onToggleTheme,
  onSeedData,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'team' | 'projects' | 'data'>('general');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleResetSampleData = async () => {
    if (confirm('Reset workspace and load initial sample sprint tasks?')) {
      setIsResetting(true);
      setFeedback(null);
      try {
        await onSeedData();
        setFeedback('Sample tasks and sprint metrics restored successfully!');
      } catch (err: any) {
        setFeedback(err.message || 'Failed to reload sample data');
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Workspace Settings
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage preferences, team members, and workspace environment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 pt-2 dark:border-slate-800 gap-4 text-xs font-semibold">
          {[
            { id: 'general', label: 'Preferences', icon: Sliders },
            { id: 'team', label: 'Team Members', icon: Users },
            { id: 'projects', label: 'Projects', icon: FolderKanban },
            { id: 'data', label: 'Data & Backup', icon: RefreshCw },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 pb-2.5 border-b-2 transition-colors ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {feedback && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{feedback}</span>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-4 text-xs">
              {/* Theme Preference */}
              <div className="flex items-center justify-between rounded-xl border border-slate-200/80 p-4 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <Palette className="h-5 w-5 text-indigo-600" />
                  <div>
                    <span className="block font-bold text-slate-900 dark:text-white">
                      Appearance Theme
                    </span>
                    <span className="text-slate-400">
                      Switch between Light and Dark interface appearance
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {darkMode ? 'Switch to Light' : 'Switch to Dark'}
                </button>
              </div>

              {/* Notification Toggles */}
              <div className="flex items-center justify-between rounded-xl border border-slate-200/80 p-4 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-indigo-600" />
                  <div>
                    <span className="block font-bold text-slate-900 dark:text-white">
                      Task Notifications
                    </span>
                    <span className="text-slate-400">
                      Show in-app alerts when tasks change column or status
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200/80 p-4 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-slate-400" />
                  <div>
                    <span className="block font-bold text-slate-900 dark:text-white">
                      Email Daily Digest
                    </span>
                    <span className="text-slate-400">
                      Receive morning sprint updates and deadline reminders
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-3">
              {users.map((u) => (
                <div
                  key={u._id}
                  className="flex items-center justify-between rounded-xl border border-slate-200/80 p-3 dark:border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      referrerPolicy="no-referrer"
                      className="h-9 w-9 rounded-full object-cover"
                    />
                    <div>
                      <span className="block text-xs font-bold text-slate-900 dark:text-white">
                        {u.name}
                      </span>
                      <span className="block text-[11px] text-slate-400">
                        {u.role} · {u.email}
                      </span>
                    </div>
                  </div>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    Active
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-2.5">
              {projects.map((p) => (
                <div
                  key={p._id}
                  className="flex items-center justify-between rounded-xl border border-slate-200/80 p-3 dark:border-slate-800"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: p.color }}
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {p.name}
                      </span>
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        {p.description}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
                    {p.key}
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-slate-200/80 p-4 dark:border-slate-800">
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Reset & Seed Sprint Tasks
                </h4>
                <p className="mt-1 text-slate-500 dark:text-slate-400">
                  Restore all standard sprint demo tasks matching the Smart Dashboard Redesign board.
                </p>
                <button
                  type="button"
                  onClick={handleResetSampleData}
                  disabled={isResetting}
                  className="mt-3 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                  <span>{isResetting ? 'Resetting...' : 'Reload Sample Data'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-200 px-6 py-3 dark:border-slate-800">
          <button
            onClick={onClose}
            className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
