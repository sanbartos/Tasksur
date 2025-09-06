import type { Express, Request, Response, NextFunction } from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import { validateBody } from "../middlewares/validationMiddleware.js";
import { createTaskSchema, updateTaskSchema } from "../middlewares/validations.js";
import { TaskController } from "../controllers/taskController.js";
import { prisma } from "../prisma.js";
import type { User } from "../types/user.js";

async function canModifyTask(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user as User | undefined;
    const userId = user?.id;
    const userRole = user?.role;
    const taskId = Number(req.params.id);

    if (!userId) return res.status(401).json({ message: "No autorizado" });

    if (isNaN(taskId)) return res.status(400).json({ message: "ID de tarea inválido" });

    const task = await prisma.tasks.findUnique({
      where: { id: taskId },
      select: { id: true, client_id: true }
    });

    if (!task) return res.status(404).json({ message: "Tarea no encontrada" });

    if (userRole === "admin") return next();

    if (task.client_id === userId) return next();

    return res.status(403).json({ message: "No tienes permiso para modificar esta tarea" });
  } catch (error) {
    next(error);
  }
}

export function registerTaskRoutes(app: Express) {
  app.get("/api/tasks", TaskController.listTasks);

  app.get("/api/tasks/:id", TaskController.getTaskById);

  app.post(
    "/api/tasks",
    isAuthenticated,
    authorizeRoles("client"),
    validateBody(createTaskSchema),
    TaskController.createTask
  );

  app.patch(
    "/api/tasks/:id",
    isAuthenticated,
    canModifyTask,
    validateBody(updateTaskSchema),
    TaskController.updateTask
  );

  app.delete(
    "/api/tasks/:id",
    isAuthenticated,
    canModifyTask,
    TaskController.deleteTask
  );
}