import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from './services/api';
import type { Task, Project, User, DbStatus, TaskStats, TaskStatus } from './types';
import { Sidebar, ViewMode, OverviewTab } from './components/Sidebar';
import { Header } from './components/Header';
import { ProjectHeroBanner } from './components/ProjectHeroBanner';
import { ViewToolbar } from './components/ViewToolbar';
import { KanbanBoard } from './components/KanbanBoard';
import { TaskListView } from './components/TaskListView';
import { TimelineView } from './components/TimelineView';
import { AnalyticsView } from './components/AnalyticsView';
import { TaskDrawer } from './components/TaskDrawer';
import { TaskModal } from './components/TaskModal';
import { SettingsModal } from './components/SettingsModal';
import { ProjectModal } from './components/ProjectModal';
import { CheckCircle2, AlertCircle, Info, RefreshCw } from 'lucide-react';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('zendo_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('zendo_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('zendo_theme', 'light');
    }
  }, [darkMode]);

  // Core Data State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);

  // View & Filter States
  const [currentView, setCurrentView] = useState<ViewMode>('kanban');
  const [activeNavTab, setActiveNavTab] = useState<OverviewTab>('dashboard');
  const [unreadTaskIds, setUnreadTaskIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('zendo_unread_task_ids');
      if (stored !== null) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed reading unread tasks:', e);
    }
    // Default initial unread tasks (task_003 and task_004 assigned to currentUser)
    return ['task_003', 'task_004'];
  });
  const [selectedProjectId, setSelectedProjectId] = useState<string>('proj_smart_dashboard');
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [boardSearch, setBoardSearch] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  useEffect(() => {
    try {
      localStorage.setItem('zendo_unread_task_ids', JSON.stringify(unreadTaskIds));
    } catch (e) {
      console.error('Failed saving unread tasks:', e);
    }
  }, [unreadTaskIds]);

  // Modals & Drawers State
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [quickAddStatus, setQuickAddStatus] = useState<TaskStatus>('todo');

  // Async States
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  // Initial Data Fetch
  const loadInitialData = useCallback(async (quiet = false) => {
    if (!quiet) setIsLoading(true);

    try {
      const [fetchedTasks, fetchedProjects, fetchedUsers, fetchedStats] = await Promise.all([
        api.getTasks(),
        api.getProjects(),
        api.getUsers(),
        api.getStats(),
      ]);

      setTasks(fetchedTasks);
      setProjects(fetchedProjects);
      setUsers(fetchedUsers);
      setStats(fetchedStats);
    } catch (err: any) {
      console.error('Error loading ZENDO data:', err);
      showToast('Could not load data from server', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Keyboard Shortcuts (Esc closes drawer/modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedTask(null);
        setIsTaskModalOpen(false);
        setIsProjectModalOpen(false);
        setIsSettingsModalOpen(false);
        setIsMobileSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load project-specific stats when active project changes
  useEffect(() => {
    if (selectedProjectId) {
      api.getStats(selectedProjectId).then(setStats).catch(console.error);
    }
  }, [selectedProjectId]);

  const currentUser = users[0] || null;

  const handleSelectNavTab = (tab: OverviewTab) => {
    setActiveNavTab(tab);
    if (tab === 'my_task') {
      setCurrentView('list');
      // When the user views "My Task", mark unseen tasks as viewed so the red badge disappears!
      if (unreadTaskIds.length > 0) {
        setUnreadTaskIds([]);
        showToast('Marked unread tasks as viewed', 'info');
      }
    } else if (tab === 'dashboard') {
      setCurrentView('kanban');
    } else if (tab === 'team') {
      setCurrentView('analytics');
    }
  };

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
    // When the user clicks to view a task, mark it as read so the badge updates
    if (unreadTaskIds.includes(task._id)) {
      setUnreadTaskIds((prev) => prev.filter((id) => id !== task._id));
    }
  };

  // Filtered Tasks computation
  const filteredTasks = useMemo(() => {
    const query = (globalSearch || boardSearch).toLowerCase().trim();
    return tasks.filter((task) => {
      // If My Task tab is selected, show tasks assigned to currentUser
      if (activeNavTab === 'my_task' && currentUser) {
        const isAssigned =
          task.assigneeId === currentUser._id ||
          Boolean(task.assigneeIds && task.assigneeIds.includes(currentUser._id));
        if (!isAssigned) return false;
      } else {
        // Project filter - match selected project in Workspace
        if (selectedProjectId && selectedProjectId !== 'all' && task.projectId !== selectedProjectId) {
          return false;
        }
      }
      // Priority filter
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
        return false;
      }
      // Search filter
      if (query) {
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesCategory = task.category?.toLowerCase().includes(query);
        const matchesTag = task.tags?.some((t) => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesCategory && !matchesTag) return false;
      }
      return true;
    });
  }, [tasks, selectedProjectId, priorityFilter, globalSearch, boardSearch, activeNavTab, currentUser]);

  // Handlers for Tasks
  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      const created = await api.createTask({
        ...taskData,
        projectId: selectedProjectId,
      });
      setTasks((prev) => [created, ...prev]);
      const newStats = await api.getStats();
      setStats(newStats);
      showToast('Task added successfully', 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to create task', 'error');
      throw e;
    }
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const updated = await api.updateTask(id, updates);
      setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
      if (selectedTask?._id === id) {
        setSelectedTask(updated);
      }
      const newStats = await api.getStats();
      setStats(newStats);
    } catch (e: any) {
      showToast(e.message || 'Failed to update task', 'error');
      throw e;
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
    );
    if (selectedTask?._id === taskId) {
      setSelectedTask((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    try {
      const updated = await api.updateTaskStatus(taskId, newStatus);
      setTasks((prev) => prev.map((t) => (t._id === taskId ? updated : t)));
      const newStats = await api.getStats();
      setStats(newStats);
    } catch (e: any) {
      loadInitialData(true);
      showToast('Failed to update task status', 'error');
    }
  };

  const handleToggleChecklistItem = async (taskId: string, itemId: string, completed?: boolean) => {
    try {
      const updated = await api.toggleChecklistItem(taskId, itemId, completed);
      setTasks((prev) => prev.map((t) => (t._id === taskId ? updated : t)));
      if (selectedTask?._id === taskId) {
        setSelectedTask(updated);
      }
    } catch (e: any) {
      showToast('Failed to update subtask', 'error');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      if (selectedTask?._id === taskId) {
        setSelectedTask(null);
      }
      const newStats = await api.getStats();
      setStats(newStats);
      showToast('Task removed', 'info');
    } catch (e: any) {
      showToast('Failed to delete task', 'error');
    }
  };

  const handleQuickAdd = (status: TaskStatus) => {
    setQuickAddStatus(status);
    setIsTaskModalOpen(true);
  };

  const handleCreateProject = async (data: { name: string; key: string; description: string; color: string }) => {
    try {
      const created = await api.createProject(data);
      setProjects((prev) => [...prev, created]);
      setSelectedProjectId(created._id);
      showToast(`Project "${created.name}" created`, 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to create project', 'error');
      throw e;
    }
  };

  const handleSeedData = async () => {
    const res = await api.seedData();
    setTasks(res.tasks);
    setStats(res.stats);
    showToast('Sprint tasks restored successfully', 'success');
  };

  const activeProject = projects.find((p) => p._id === selectedProjectId) || null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F4F5F9] text-slate-900 antialiased dark:bg-[#070A10] dark:text-slate-100 font-sans">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-4 right-4 z-60 flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white/95 px-4 py-2.5 text-xs font-semibold shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 transition-all animate-in fade-in slide-in-from-top-2">
          {toast.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
          {toast.type === 'error' && <AlertCircle className="h-4 w-4 text-rose-600" />}
          {toast.type === 'info' && <Info className="h-4 w-4 text-indigo-600" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ZENDO Sidebar */}
      <Sidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
        currentUser={currentUser}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode(!darkMode)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        activeNavTab={activeNavTab}
        onSelectNavTab={handleSelectNavTab}
        unreadCount={unreadTaskIds.length}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden bg-[#F4F5F9] dark:bg-[#070A10]">
        {/* Top Header (matches screenshot: Search, Notification Bell, + New Task) */}
        <Header
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
          onOpenNewTaskModal={() => {
            setQuickAddStatus('todo');
            setIsTaskModalOpen(true);
          }}
          onOpenMongoModal={() => setIsSettingsModalOpen(true)}
          dbStatus={null}
        />

        {/* Dashboard Body Scroll Container */}
        <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-8 space-y-4">
          {isLoading ? (
            <div className="flex h-96 w-full flex-col items-center justify-center gap-3">
              <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Loading ZENDO tasks...
              </p>
            </div>
          ) : (
            <>
              {/* Top Project Hero Banner with 4 KPI Cards */}
              <ProjectHeroBanner
                project={activeProject}
                users={users}
                stats={stats}
                onOpenSettings={() => setIsSettingsModalOpen(true)}
                activeNavTab={activeNavTab}
                onClearUnread={() => setUnreadTaskIds([])}
                unreadCount={unreadTaskIds.length}
              />

              {/* View Toolbar (Board, List, Timeline, Analytics, Filter, Sort) */}
              <ViewToolbar
                currentView={currentView}
                onSelectView={setCurrentView}
                taskSearch={boardSearch}
                onTaskSearchChange={setBoardSearch}
                onOpenFilter={() => {
                  const priorities = ['all', 'high', 'medium', 'low'];
                  const next = priorities[(priorities.indexOf(priorityFilter) + 1) % priorities.length];
                  setPriorityFilter(next);
                  showToast(`Filter: ${next === 'all' ? 'All priorities' : next + ' priority'}`, 'info');
                }}
                onOpenSort={() => {
                  setTasks((prev) => [...prev].reverse());
                  showToast('Reversed board sorting order', 'info');
                }}
              />

              {/* Active View Container */}
              <div className="pb-12">
                {currentView === 'kanban' && (
                  <KanbanBoard
                    tasks={filteredTasks}
                    users={users}
                    projects={projects}
                    onSelectTask={handleSelectTask}
                    onUpdateStatus={handleUpdateStatus}
                    onQuickAddTask={handleQuickAdd}
                    unreadTaskIds={unreadTaskIds}
                  />
                )}

                {currentView === 'list' && (
                  <TaskListView
                    tasks={filteredTasks}
                    users={users}
                    projects={projects}
                    onSelectTask={handleSelectTask}
                    onUpdateStatus={handleUpdateStatus}
                    onDeleteTask={handleDeleteTask}
                    unreadTaskIds={unreadTaskIds}
                  />
                )}

                {currentView === 'timeline' && (
                  <TimelineView
                    tasks={filteredTasks}
                    users={users}
                    projects={projects}
                    onSelectTask={handleSelectTask}
                  />
                )}

                {currentView === 'analytics' && (
                  <AnalyticsView
                    stats={stats}
                    tasks={tasks}
                    users={users}
                    projects={projects}
                  />
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Task Drawer */}
      <TaskDrawer
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        users={users}
        projects={projects}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        onToggleChecklistItem={handleToggleChecklistItem}
      />

      {/* Task Creation Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleCreateTask}
        users={users}
        projects={projects}
        defaultStatus={quickAddStatus}
        defaultProjectId={selectedProjectId}
      />

      {/* Workspace Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        projects={projects}
        users={users}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode(!darkMode)}
        onSeedData={handleSeedData}
      />

      {/* Project Creation Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
}
