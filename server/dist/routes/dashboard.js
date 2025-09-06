import { isAuthenticated } from '../middlewares/authMiddleware.js';
import { storage } from '../storage.js';
export function registerDashboardRoutes(app) {
    app.get('/api/dashboard/my-tasks', isAuthenticated, async (req, res, next) => {
        try {
            const user = req.user;
            const userId = user?.id;
            if (!userId) {
                return res.status(401).json({ message: "No autorizado" });
            }
            const tasksWithOffers = await storage.getTasksWithOffers(userId);
            res.json(tasksWithOffers);
        }
        catch (error) {
            next(error);
        }
    });
}
