import type { Express, Request, Response, NextFunction } from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { storage } from "../storage.js";
import { parsePaginationParams } from "../utils/pagination.js";

const ERROR_MESSAGES = {
  unauthorized: "No autorizado",
  notificationNotFound: "Notificación no encontrada",
  forbidden: "No tienes permiso para realizar esta acción",
  invalidId: "ID inválido",
  internalError: "Error interno del servidor",
};

/**
 * Middleware para validar que el parámetro :id es un número válido
 */
function validateIdParam(req: Request, res: Response, next: NextFunction) {
  const id = req.params.id;
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ message: ERROR_MESSAGES.invalidId });
  }
  next();
}

export function registerNotificationRoutes(app: Express) {
  /**
   * Obtener notificaciones del usuario con filtros y paginación
   */
  app.get('/api/notifications', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const userId = user?.id;
      if (!userId) return res.status(401).json({ message: ERROR_MESSAGES.unauthorized });

      const { page, limit, type, isRead } = req.query;
      const { pageNumber, limitNumber } = parsePaginationParams(page as string, limit as string);

      const filters: { type?: string; isRead?: boolean } = {};
      if (type && typeof type === 'string') filters.type = type;
      if (typeof isRead === 'string') filters.isRead = isRead === 'true';

      const notifications = await storage.getNotificationsByUserId(userId, pageNumber, limitNumber, filters);
      const total = await storage.countUnreadNotifications(userId);

      res.json({ notifications, total });
    } catch (error) {
      console.error("Error obteniendo notificaciones:", error);
      next(error);
    }
  });

  /**
   * Marcar una notificación como leída
   */
  app.patch('/api/notifications/:id/read', isAuthenticated, validateIdParam, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notificationId = Number(req.params.id);
      const user = req.user;
      const userId = user?.id;
      if (!userId) return res.status(401).json({ message: ERROR_MESSAGES.unauthorized });

      const notification = await storage.getNotificationById(notificationId);
      if (!notification) return res.status(404).json({ message: ERROR_MESSAGES.notificationNotFound });

      if (notification.userId !== userId) {
        return res.status(403).json({ message: ERROR_MESSAGES.forbidden });
      }

      await storage.markNotificationAsRead(notificationId);
      res.json({ message: "Notificación marcada como leída" });
    } catch (error) {
      console.error("Error marcando notificación como leída:", error);
      next(error);
    }
  });

  /**
   * Marcar todas las notificaciones como leídas
   */
  app.patch('/api/notifications/read-all', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const userId = user?.id;
      if (!userId) return res.status(401).json({ message: ERROR_MESSAGES.unauthorized });

      await storage.markAllNotificationsAsRead(userId);
      res.json({ message: "Todas las notificaciones marcadas como leídas" });
    } catch (error) {
      console.error("Error marcando todas las notificaciones como leídas:", error);
      next(error);
    }
  });

  /**
   * Obtener conteo de notificaciones no leídas
   */
  app.get('/api/notifications/unread-count', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const userId = user?.id;
      if (!userId) return res.status(401).json({ message: ERROR_MESSAGES.unauthorized });

      const count = await storage.countUnreadNotifications(userId);
      res.json({ unreadCount: count });
    } catch (error) {
      console.error("Error obteniendo conteo de notificaciones no leídas:", error);
      next(error);
    }
  });
}