import type { Express, Request, Response, NextFunction } from "express";
import { isAuthenticated } from "./middlewares/authMiddleware.js";
import { authorizeRoles } from "./middlewares/roleMiddleware.js";
import { storage } from "./storage.js";
import { sendEmail } from './utils/notifications.js';
import { parsePaginationParams } from './utils/pagination.js';
import type { User } from './types/user.js'; // Ajusta la ruta según tu estructura

// Middleware para controlar permisos de modificación de oferta
async function canModifyOffer(req: Request, res: Response, next: NextFunction) {
  const user = req.user as { id: string; role?: string } | undefined;
  if (!user) return res.status(401).json({ message: 'No autorizado' });

  const userId = user.id;
  const userRole = user.role;
  const offerId = parseInt(req.params.id);

  if (!userId) return res.status(401).json({ message: 'No autorizado' });

  const offer = await storage.getOfferById(offerId);
  if (!offer) return res.status(404).json({ message: 'Oferta no encontrada' });

  const task = await storage.getTaskById(offer.taskId);
  if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });

  if (userRole === 'admin' || (task.clientId === userId && task.status === 'pending')) return next();

  return res.status(403).json({ message: 'No tienes permiso para modificar esta oferta' });
}

export function registerOfferRoutes(app: Express) {
  // Crear oferta (solo taskers)
  app.post('/api/offers', isAuthenticated, authorizeRoles('tasker'), async (req: Request, res: Response) => {
    try {
      const user = req.user as { id: string };
      const userId = user.id;
      const { taskId, amount, currency, message, estimatedDuration } = req.body;

      if (!taskId || !amount || !currency) {
        return res.status(400).json({ message: 'Faltan campos obligatorios' });
      }

      const offerData = {
        taskId,
        taskerId: userId,
        amount,
        currency,
        message,
        estimatedDuration,
        status: 'pending',
      };

      const offer = await storage.createOffer(offerData);
      res.status(201).json(offer);
    } catch (error) {
      console.error("Error creando oferta:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Listar ofertas de una tarea con paginación
  app.get('/api/tasks/:id/offers', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { page, limit } = req.query;
      const { pageNumber, limitNumber } = parsePaginationParams(page as string, limit as string);

      const offers = await storage.getOffersByTaskId(parseInt(id), pageNumber, limitNumber);
      res.json(offers);
    } catch (error) {
      console.error("Error fetching offers:", error);
      res.status(500).json({ message: "Failed to fetch offers" });
    }
  });

  // Listar ofertas de un tasker con paginación (solo el propio tasker o admin)
  app.get('/api/users/:id/offers', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { page, limit } = req.query;
      const { pageNumber, limitNumber } = parsePaginationParams(page as string, limit as string);

      if ((req.user as User)?.id !== id && (req.user as User)?.role !== 'admin') {
  return res.status(403).json({ message: 'No autorizado' });
}

      const offers = await storage.getOffersByTaskerId(id, pageNumber, limitNumber);
      res.json(offers);
    } catch (error) {
      console.error("Error fetching user offers:", error);
      res.status(500).json({ message: "Failed to fetch user offers" }); 
    }
  });

  // Actualizar estado de oferta (solo autorizado)
  app.patch('/api/offers/:id', isAuthenticated, canModifyOffer, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ['pending', 'accepted', 'rejected'];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Estado inválido' });
      }

      const updatedOffer = await storage.updateOffer(parseInt(id), { status });

      if (status === 'accepted') {
        const offer = await storage.getOfferById(parseInt(id));
        if (offer) {
          await storage.updateTask(offer.taskId, { assignedTaskerId: offer.taskerId, status: 'in_progress' });

          // Notificación por email al tasker
          const tasker = await storage.getUser(offer.taskerId);
          if (tasker && tasker.email) {
            await sendEmail(
              tasker.email,
              'Tu oferta ha sido aceptada',
              `Hola ${tasker.firstName ?? ''}, tu oferta para la tarea ha sido aceptada. ¡Felicidades!`
            );
          }
        }
      }

      res.json(updatedOffer);
    } catch (error) {
      console.error("Error updating offer:", error);
      res.status(500).json({ message: "Failed to update offer" });
    }
  });
}