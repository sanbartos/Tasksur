// src/routes/offerRoutes.ts
import type { Express, Request, Response, NextFunction } from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import { validateBody } from "../middlewares/validateBody.js";
import { createOfferSchema, updateOfferStatusSchema } from "../schemas/offerSchemas.js";
import { parsePaginationParams } from "../utils/pagination.js";
import { OffersController } from "../controllers/offersController.js";
import { OfferService } from "../services/offerService.js";
import type { User } from "../types/user.js";

async function canModifyOffer(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user as User | undefined;
    if (!user) return res.status(401).json({ message: "No autorizado" });

    const offerId = parseInt(req.params.id);
    if (isNaN(offerId)) return res.status(400).json({ message: "ID inválido" });

    const offer = await OfferService.getOfferById(offerId);
    if (!offer) return res.status(404).json({ message: "Oferta no encontrada" });

    // Permite modificar si es admin o si el usuario es el creador (taskerId)
    if (user.role === "admin" || offer.taskerId === user.id) {
      return next();
    }

    return res.status(403).json({ message: "No tienes permiso para modificar esta oferta" });
  } catch (error: any) {
    next(error);
  }
}

export function registerOfferRoutes(app: Express) {
  app.post(
    "/api/offers",
    isAuthenticated,
    authorizeRoles("tasker"),
    validateBody(createOfferSchema),
    OffersController.createOffer
  );

  app.get(
    "/api/tasks/:id/offers",
    OffersController.getOffersByTask
  );

  app.get(
    "/api/users/:id/offers",
    isAuthenticated,
    OffersController.getOffersByUser
  );

  app.patch(
    "/api/offers/:id",
    isAuthenticated,
    canModifyOffer,
    validateBody(updateOfferStatusSchema),
    OffersController.updateOfferStatus
  );
}