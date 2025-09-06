import type { Express, Request, Response, NextFunction } from "express";
import { isAuthenticated } from '../middlewares/authMiddleware.js';
import { storage } from '../storage.js';

export function registerDashboardRoutes(app: Express) {
  app.get('/api/dashboard/my-tasks', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const userId = user?.id;
      if (!userId) {
        return res.status(401).json({ message: "No autorizado" });
      }
      const tasksWithOffers = await storage.getTasksWithOffers(userId);
      res.json(tasksWithOffers);
    } catch (error) {
      next(error);
    }
  });
}