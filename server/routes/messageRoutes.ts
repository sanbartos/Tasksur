import { Router, Request, Response, NextFunction } from "express";
import { storage } from '../storage.js';
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import type { User } from '../types/user.js';
import { sendMessageSchema } from '../schemas/messageSchemas.js';
import Joi from "joi";

const router = Router();

const ERROR_MESSAGES = {
  unauthorized: "No autorizado",
  notFound: "No encontrado",
  forbidden: "No tienes permiso para realizar esta acción",
  invalidId: "ID inválido",
  missingData: "Faltan datos obligatorios",
  internalError: "Error interno del servidor",
};

// Middleware para validar que un parámetro es un número válido
function validateIdParam(paramName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[paramName];
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: ERROR_MESSAGES.invalidId });
    }
    next();
  };
}

// Middleware para validar body con Joi
function validateBody(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    next();
  };
}

// Middleware para verificar acceso a mensajes de una tarea
async function canAccessTaskMessages(req: Request, res: Response, next: NextFunction) {
  const user = req.user as User | undefined;
  const userId = user?.id;
  const taskId = parseInt(req.params.taskId);

  if (!userId) return res.status(401).json({ message: ERROR_MESSAGES.unauthorized });

  const task = await storage.getTaskById(taskId);
  if (!task) return res.status(404).json({ message: ERROR_MESSAGES.notFound });

  if (task.clientId === userId || task.assignedTaskerId === userId || user?.role === "admin") {
    return next();
  }

  return res.status(403).json({ message: ERROR_MESSAGES.forbidden });
}

// Obtener conversación entre dos usuarios (para chat general)
router.get("/conversation", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User | undefined;
    const currentUserId = user?.id;
    const { user1, user2 } = req.query;

    if (!currentUserId) {
      return res.status(401).json({ message: ERROR_MESSAGES.unauthorized });
    }

    if (!user1 || !user2) {
      return res.status(400).json({ message: "Faltan parámetros user1 y user2" });
    }

    if (currentUserId !== user1 && currentUserId !== user2) {
      return res.status(403).json({ message: ERROR_MESSAGES.forbidden });
    }

    const messages = await storage.getMessagesBetweenUsers(user1 as string, user2 as string);
    res.json(messages);
  } catch (error) {
    console.error("Error obteniendo conversación:", error);
    next(error);
  }
});

// Enviar mensaje general entre usuarios
router.post(
  "/",
  isAuthenticated,
  validateBody(sendMessageSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as User | undefined;
      if (!user?.id) {
        return res.status(401).json({ message: ERROR_MESSAGES.unauthorized });
      }

      const { receiverId, taskId, content } = req.body;

      if (!taskId && receiverId && content) {
        const receiver = await storage.getUserById(receiverId);
        if (!receiver) {
          return res.status(404).json({ message: ERROR_MESSAGES.notFound });
        }

        const message = await storage.createGeneralMessage({
          senderId: user.id,
          receiverId,
          content,
        });

        return res.status(201).json(message);
      }

      if (taskId && receiverId && content) {
        const task = await storage.getTaskById(taskId);
        if (!task) return res.status(404).json({ message: ERROR_MESSAGES.notFound });

        if (task.clientId !== user.id && task.assignedTaskerId !== user.id && user.role !== "admin") {
          return res.status(403).json({ message: ERROR_MESSAGES.forbidden });
        }

        if (receiverId !== task.clientId && receiverId !== task.assignedTaskerId) {
          return res.status(400).json({ message: "El receptor no es participante de la tarea" });
        }

        const message = await storage.createMessage({
          senderId: user.id,
          receiverId,
          taskId,
          content,
        });

        return res.status(201).json(message);
      }

      return res.status(400).json({ message: ERROR_MESSAGES.missingData });
    } catch (error) {
      console.error("Error enviando mensaje:", error);
      next(error);
    }
  }
);

// Enviar mensaje para tarea (comportamiento original)
router.post(
  "/task",
  isAuthenticated,
  validateBody(sendMessageSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as User | undefined;
      if (!user?.id) {
        return res.status(401).json({ message: ERROR_MESSAGES.unauthorized });
      }

      const { receiverId, taskId, content } = req.body;

      if (!receiverId || !content || !taskId) {
        return res.status(400).json({ message: ERROR_MESSAGES.missingData });
      }

      const task = await storage.getTaskById(taskId);
      if (!task) return res.status(404).json({ message: ERROR_MESSAGES.notFound });

      if (task.clientId !== user.id && task.assignedTaskerId !== user.id && user.role !== "admin") {
        return res.status(403).json({ message: ERROR_MESSAGES.forbidden });
      }

      if (receiverId !== task.clientId && receiverId !== task.assignedTaskerId) {
        return res.status(400).json({ message: "El receptor no es participante de la tarea" });
      }

      const message = await storage.createMessage({
        senderId: user.id,
        receiverId,
        taskId,
        content,
      });

      res.status(201).json(message);
    } catch (error) {
      console.error("Error enviando mensaje para tarea:", error);
      next(error);
    }
  }
);

// Obtener mensajes por tarea
router.get(
  "/task/:taskId",
  isAuthenticated,
  validateIdParam("taskId"),
  canAccessTaskMessages,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const taskId = parseInt(req.params.taskId);
      const { page, limit } = req.query;
      const pageNumber = page ? parseInt(page as string) : 1;
      const limitNumber = limit ? parseInt(limit as string) : 20;

      const messages = await storage.getMessagesByTaskId(taskId, pageNumber, limitNumber);
      res.json(messages);
    } catch (error) {
      console.error("Error obteniendo mensajes por tarea:", error);
      next(error);
    }
  }
);

// Marcar mensaje como leído
router.patch(
  "/:id/read",
  isAuthenticated,
  validateIdParam("id"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const messageId = parseInt(req.params.id);
      const user = req.user as User | undefined;
      const userId = user?.id;

      if (!userId) {
        return res.status(401).json({ message: ERROR_MESSAGES.unauthorized });
      }

      const message = await storage.getMessageById(messageId);
      if (!message) {
        return res.status(404).json({ message: ERROR_MESSAGES.notFound });
      }

      if (message.receiverId !== userId) {
        return res.status(403).json({ message: ERROR_MESSAGES.forbidden });
      }

      const updatedMessage = await storage.markMessageAsRead(messageId);
      res.json(updatedMessage);
    } catch (error) {
      console.error("Error marcando mensaje como leído:", error);
      next(error);
    }
  }
);

export default router;