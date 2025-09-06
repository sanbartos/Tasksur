import { isAuthenticated } from "./middlewares/authMiddleware.js";
import { authorizeRoles } from "./middlewares/roleMiddleware.js";
import { storage } from "./storage.js";
import { parsePaginationParams } from "./utils/pagination.js";
import type { Request, Response, NextFunction } from "express";
import type { User } from "./types/user.js";

// Middleware para controlar permisos de modificación de tarea
async function canModifyTask(req: Request, res: Response, next: NextFunction) {
  const user = req.user as User | undefined;
  const userId = user?.id;
  const userRole = user?.role;
  const taskId = parseInt(req.params.id);

  if (!userId) return res.status(401).json({ message: "No autorizado" });

  const task = await storage.getTaskById(taskId);
  if (!task) return res.status(404).json({ message: "Tarea no encontrada" });

  if (userRole === "admin") return next();
  if (task.clientId === userId) return next();
  if (task.assignedTaskerId === userId) return next();

  return res.status(403).json({ message: "No tienes permiso para modificar esta tarea" });
}

export function registerTaskRoutes(app: any) {
  // Listar tareas con paginación y filtros
  app.get("/api/tasks", async (req: Request, res: Response) => {
    try {
      const { page, limit, ...filters } = req.query;
      const { pageNumber, limitNumber } = parsePaginationParams(page as string, limit as string);

      // Creamos un objeto nuevo para filtros parseados con tipos correctos
      const parsedFilters: {
  categoryId?: number;
  categoryName?: string;
  location?: string;
  status?: string;
  clientId?: string;
  taskerId?: string;
} = {};

      if (filters.categoryId) parsedFilters.categoryId = parseInt(filters.categoryId as string);
      if (filters.categoryName) parsedFilters.categoryName = filters.categoryName as string;
      if (filters.location) parsedFilters.location = filters.location as string;
      if (filters.status) parsedFilters.status = filters.status as string;
     if (filters.clientId) parsedFilters.clientId = filters.clientId as string;
if (filters.taskerId) parsedFilters.taskerId = filters.taskerId as string;

      const tasks = await storage.getTasks(parsedFilters, pageNumber, limitNumber);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  // Obtener tarea por ID
  app.get("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      const task = await storage.getTaskById(id);
      if (!task) {
        return res.status(404).json({ message: "Tarea no encontrada" });
      }
      res.json(task);
    } catch (error) {
      console.error("Error fetching task:", error);
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });

  // Crear tarea (usuarios con rol permitido)
  app.post(
    "/api/tasks",
    isAuthenticated,
    authorizeRoles("user", "client", "admin"),
    async (req: Request, res: Response) => {
      try {
        const user = req.user as User | undefined;
        const userId = user?.id;
        if (!userId) return res.status(401).json({ message: "No autorizado" });

        const { title, description, categoryId, budget, currency, location, dueDate, priority } = req.body;

        if (!title || !description || !categoryId) {
          return res.status(400).json({ message: "Faltan campos obligatorios" });
        }

        const taskData = {
          title: String(title),
          description: String(description),
          categoryId: Number(categoryId),
          clientId: userId,
          budget: String(budget),
          currency: currency ? String(currency) : "UYU",
          location: String(location),
          status: "pending",
          priority: priority ? String(priority) : "normal",
          dueDate: dueDate ? new Date(dueDate) : undefined,
        };

        const task = await storage.createTask(taskData);
        return res.status(201).json(task);
      } catch (error) {
        console.error("Error creating task:", error);
        return res.status(500).json({ message: "Failed to create task" });
      }
    }
  );

  // Actualizar tarea (solo usuarios autorizados)
  app.patch("/api/tasks/:id", isAuthenticated, canModifyTask, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      const updates = req.body;

      const validStatuses = ["pending", "in_progress", "completed", "cancelled"];
      if (updates.status && !validStatuses.includes(updates.status)) {
        return res.status(400).json({ message: "Estado inválido" });
      }

      const updatedTask = await storage.updateTask(id, updates);
      res.json(updatedTask);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });
}