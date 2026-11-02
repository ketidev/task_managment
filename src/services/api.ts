import type { Task, Project, User, DbStatus, TaskStats, TaskStatus } from '../types';

const BASE_URL = '/api';

export const api = {
  // Tasks
  async getTasks(params?: {
    status?: string;
    priority?: string;
    projectId?: string;
    assigneeId?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<Task[]> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.set(key, val);
        }
      });
    }
    const res = await fetch(`${BASE_URL}/tasks?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to load tasks');
    return res.json();
  },

  async getTask(id: string): Promise<Task> {
    const res = await fetch(`${BASE_URL}/tasks/${id}`);
    if (!res.ok) throw new Error('Task not found');
    return res.json();
  },

  async createTask(taskData: Partial<Task>): Promise<Task> {
    const res = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create task');
    }
    return res.json();
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const res = await fetch(`${BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update task');
    return res.json();
  },

  async updateTaskStatus(id: string, status: TaskStatus, order?: number): Promise<Task> {
    const res = await fetch(`${BASE_URL}/tasks/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, order }),
    });
    if (!res.ok) throw new Error('Failed to update task status');
    return res.json();
  },

  async toggleChecklistItem(taskId: string, itemId: string, completed?: boolean): Promise<Task> {
    const res = await fetch(`${BASE_URL}/tasks/${taskId}/checklist/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });
    if (!res.ok) throw new Error('Failed to update checklist item');
    return res.json();
  },

  async deleteTask(id: string): Promise<{ success: boolean; id: string }> {
    const res = await fetch(`${BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete task');
    return res.json();
  },

  // Projects
  async getProjects(): Promise<Project[]> {
    const res = await fetch(`${BASE_URL}/projects`);
    if (!res.ok) throw new Error('Failed to load projects');
    return res.json();
  },

  async createProject(data: { name: string; key: string; description?: string; color?: string }): Promise<Project> {
    const res = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create project');
    }
    return res.json();
  },

  // Users
  async getUsers(): Promise<User[]> {
    const res = await fetch(`${BASE_URL}/users`);
    if (!res.ok) throw new Error('Failed to load users');
    return res.json();
  },

  // Stats
  async getStats(projectId?: string): Promise<TaskStats> {
    const url = projectId ? `${BASE_URL}/stats?projectId=${encodeURIComponent(projectId)}` : `${BASE_URL}/stats`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load statistics');
    return res.json();
  },

  // Database / MongoDB
  async getDbStatus(): Promise<DbStatus> {
    const res = await fetch(`${BASE_URL}/db/status`);
    if (!res.ok) throw new Error('Failed to fetch DB status');
    return res.json();
  },

  async connectMongo(uri: string, dbName?: string): Promise<{ success: boolean; message: string; status: DbStatus }> {
    const res = await fetch(`${BASE_URL}/db/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uri, dbName }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || data.error || 'Connection failed');
    }
    return data;
  },

  async disconnectMongo(): Promise<{ success: boolean; status: DbStatus }> {
    const res = await fetch(`${BASE_URL}/db/disconnect`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to disconnect MongoDB');
    return res.json();
  },

  async seedData(): Promise<{ success: boolean; tasks: Task[]; stats: TaskStats; status: DbStatus }> {
    const res = await fetch(`${BASE_URL}/db/seed`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to seed database');
    return res.json();
  },
};
