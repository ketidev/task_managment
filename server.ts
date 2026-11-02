import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { dbManager } from './src/server/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

async function bootstrap() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // ------------------ REST API ROUTES ------------------ //

  // DB Status & MongoDB Atlas Connection
  app.get('/api/db/status', (req: Request, res: Response) => {
    res.json(dbManager.getStatus());
  });

  app.post('/api/db/connect', async (req: Request, res: Response) => {
    const { uri, dbName } = req.body;
    if (!uri) {
      return res.status(400).json({ error: 'MongoDB URI is required' });
    }
    const result = await dbManager.connectToMongo(uri, dbName || 'taskflow');
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json({ ...result, status: dbManager.getStatus() });
  });

  app.post('/api/db/disconnect', async (req: Request, res: Response) => {
    await dbManager.disconnectMongo();
    res.json({ success: true, status: dbManager.getStatus() });
  });

  app.post('/api/db/seed', async (req: Request, res: Response) => {
    await dbManager.resetAndSeed();
    const tasks = await dbManager.getTasks();
    const stats = await dbManager.getStats();
    res.json({ success: true, tasks, stats, status: dbManager.getStatus() });
  });

  // Projects
  app.get('/api/projects', async (req: Request, res: Response) => {
    try {
      const projects = await dbManager.getProjects();
      res.json(projects);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/projects', async (req: Request, res: Response) => {
    try {
      const { name, description, color, key } = req.body;
      if (!name || !key) {
        return res.status(400).json({ error: 'Name and key are required' });
      }
      const project = await dbManager.createProject({
        name,
        description: description || '',
        color: color || '#3B82F6',
        key: key.toUpperCase(),
      });
      res.status(201).json(project);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Users
  app.get('/api/users', async (req: Request, res: Response) => {
    try {
      const users = await dbManager.getUsers();
      res.json(users);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Stats
  app.get('/api/stats', async (req: Request, res: Response) => {
    try {
      const stats = await dbManager.getStats(req.query.projectId as string | undefined);
      res.json(stats);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Tasks CRUD
  app.get('/api/tasks', async (req: Request, res: Response) => {
    try {
      const { status, priority, projectId, assigneeId, search, sortBy, sortOrder } = req.query;
      const tasks = await dbManager.getTasks({
        status: status as string | undefined,
        priority: priority as string | undefined,
        projectId: projectId as string | undefined,
        assigneeId: assigneeId as string | undefined,
        search: search as string | undefined,
        sortBy: sortBy as any,
        sortOrder: sortOrder as any,
      });
      res.json(tasks);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/tasks/:id', async (req: Request, res: Response) => {
    try {
      const task = await dbManager.getTaskById(req.params.id);
      if (!task) return res.status(404).json({ error: 'Task not found' });
      res.json(task);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/tasks', async (req: Request, res: Response) => {
    try {
      const { title, description, status, priority, dueDate, projectId, assigneeId, tags, checklist, estimatedHours } = req.body;
      if (!title || !title.trim()) {
        return res.status(400).json({ error: 'Title is required' });
      }

      const task = await dbManager.createTask({
        title: title.trim(),
        description: description || '',
        status: status || 'todo',
        priority: priority || 'medium',
        dueDate: dueDate || new Date().toISOString().split('T')[0],
        projectId: projectId || 'proj_core',
        assigneeId: assigneeId || 'user_alex',
        tags: Array.isArray(tags) ? tags : [],
        checklist: Array.isArray(checklist) ? checklist : [],
        estimatedHours: typeof estimatedHours === 'number' ? estimatedHours : 2,
        order: 0,
      });

      res.status(201).json(task);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put('/api/tasks/:id', async (req: Request, res: Response) => {
    try {
      const updated = await dbManager.updateTask(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Task not found' });
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.patch('/api/tasks/:id/status', async (req: Request, res: Response) => {
    try {
      const { status, order } = req.body;
      if (!status) return res.status(400).json({ error: 'Status is required' });

      const updates: any = { status };
      if (typeof order === 'number') updates.order = order;

      const updated = await dbManager.updateTask(req.params.id, updates);
      if (!updated) return res.status(404).json({ error: 'Task not found' });
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.patch('/api/tasks/:id/checklist/:itemId', async (req: Request, res: Response) => {
    try {
      const task = await dbManager.getTaskById(req.params.id);
      if (!task) return res.status(404).json({ error: 'Task not found' });

      const { itemId } = req.params;
      const { completed } = req.body;

      const updatedChecklist = task.checklist.map((item) => {
        if (item.id === itemId) {
          return { ...item, completed: typeof completed === 'boolean' ? completed : !item.completed };
        }
        return item;
      });

      const updated = await dbManager.updateTask(req.params.id, { checklist: updatedChecklist });
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/tasks/:id', async (req: Request, res: Response) => {
    try {
      const success = await dbManager.deleteTask(req.params.id);
      if (!success) return res.status(404).json({ error: 'Task not found or already deleted' });
      res.json({ success: true, id: req.params.id });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Global Error Handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('[SERVER ERROR]', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  });

  // ------------------ FRONTEND / VITE ------------------ //
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static frontend in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TaskFlow Express Server] listening on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('[BOOTSTRAP FATAL]', err);
  process.exit(1);
});
