export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category?: string;
  dueDate: string; // ISO format: YYYY-MM-DD
  projectId: string;
  assigneeId: string;
  assigneeIds?: string[];
  tags: string[];
  checklist: ChecklistItem[];
  estimatedHours: number;
  commentsCount?: number;
  imageAttachment?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  color: string;
  key: string;
  taskCount?: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

export interface DbStatus {
  mode: 'mongodb' | 'embedded';
  connected: boolean;
  databaseName: string;
  uriRedacted: string;
  collections: {
    tasks: number;
    projects: number;
    users: number;
  };
  lastSyncedAt: string;
  error?: string | null;
}

export interface TaskStats {
  total: number;
  backlog: number;
  todo: number;
  inProgress: number;
  review: number;
  done: number;
  overdue: number;
  dueSoon: number; // due in next 48h
  highPriority: number;
  completionRate: number;
  totalEstimatedHours: number;
}
