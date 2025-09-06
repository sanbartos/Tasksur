import { PrismaClient } from "@prisma/client";
import { isAuthenticated } from '../middlewares/authMiddleware.js';
import { parsePaginationParams } from '../utils/pagination.js';
const prisma = new PrismaClient();
async function canModifyReview(req, res, next) {
    try {
        const user = req.user;
        if (!user)
            return res.status(401).json({ message: "No autorizado" });
        const reviewId = req.params.id;
        if (!reviewId)
            return res.status(400).json({ message: "ID inválido" });
        const review = await prisma.reviews.findUnique({ where: { id: reviewId } });
        if (!review)
            return res.status(404).json({ message: "Reseña no encontrada" });
        if (user.role === "admin" || review.reviewerid === user.id) {
            return next();
        }
        return res.status(403).json({ message: "No tienes permiso para modificar esta reseña" });
    }
    catch (error) {
        next(error);
    }
}
export function registerReviewRoutes(app) {
    app.post("/api/reviews", isAuthenticated, async (req, res, next) => {
        try {
            const user = req.user;
            const { taskid, rating, comment } = req.body;
            if (!taskid || !rating) {
                return res.status(400).json({ message: "Faltan campos obligatorios: taskid, rating" });
            }
            if (typeof rating !== "number" || rating < 1 || rating > 5) {
                return res.status(400).json({ message: "Rating debe ser un número entre 1 y 5" });
            }
            const task = await prisma.tasks.findUnique({ where: { id: taskid } });
            if (!task) {
                return res.status(400).json({ message: "Tarea no encontrada" });
            }
            const existingReview = await prisma.reviews.findFirst({
                where: { taskid, reviewerid: user.id },
            });
            if (existingReview) {
                return res.status(400).json({ message: "Ya has reseñado esta tarea" });
            }
            const review = await prisma.reviews.create({
                data: {
                    taskid,
                    reviewerid: user.id,
                    targetuserid: task.client_id, // asumiendo que la tarea tiene user_id como dueño
                    rating,
                    comment: comment || "",
                },
            });
            res.status(201).json(review);
        }
        catch (error) {
            next(error);
        }
    });
    app.get("/api/tasks/:id/reviews", async (req, res, next) => {
        try {
            const taskid = parseInt(req.params.id);
            if (isNaN(taskid))
                return res.status(400).json({ message: "ID de tarea inválido" });
            const { page, limit } = req.query;
            const { pageNumber, limitNumber } = parsePaginationParams(page, limit);
            const reviews = await prisma.reviews.findMany({
                where: { taskid },
                skip: (pageNumber - 1) * limitNumber,
                take: limitNumber,
                orderBy: { createdat: "desc" },
            });
            res.json(reviews);
        }
        catch (error) {
            next(error);
        }
    });
    app.patch("/api/reviews/:id", isAuthenticated, canModifyReview, async (req, res, next) => {
        try {
            const reviewId = req.params.id;
            if (!reviewId)
                return res.status(400).json({ message: "ID inválido" });
            const { rating, comment } = req.body;
            if (rating !== undefined && (typeof rating !== "number" || rating < 1 || rating > 5)) {
                return res.status(400).json({ message: "Rating debe ser un número entre 1 y 5" });
            }
            const data = {};
            if (rating !== undefined)
                data.rating = rating;
            if (comment !== undefined)
                data.comment = comment;
            const updatedReview = await prisma.reviews.update({
                where: { id: reviewId },
                data,
            });
            res.json(updatedReview);
        }
        catch (error) {
            next(error);
        }
    });
    app.delete("/api/reviews/:id", isAuthenticated, canModifyReview, async (req, res, next) => {
        try {
            const reviewId = req.params.id;
            if (!reviewId)
                return res.status(400).json({ message: "ID inválido" });
            await prisma.reviews.delete({ where: { id: reviewId } });
            res.json({ message: "Reseña eliminada correctamente" });
        }
        catch (error) {
            next(error);
        }
    });
}
