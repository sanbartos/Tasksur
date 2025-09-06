// src/controllers/offersController.ts
import type { Request, Response, NextFunction } from "express";
import { OfferService } from "../services/offerService.js";
import type { User } from "../types/user.js";
import { parsePaginationParams } from "../utils/pagination.js";

export class OffersController {
  /**
   * Crea una nueva oferta.
   */
  static async createOffer(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User;
      const { taskId, price, description } = req.body;

      const offer = await OfferService.createOffer({
        taskId,
        taskerId: user.id,
        amount: price.toString(),
        message: description ?? null,
      });

      res.status(201).json(offer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene ofertas asociadas a una tarea con paginación.
   */
  static async getOffersByTask(req: Request, res: Response, next: NextFunction) {
    try {
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) return res.status(400).json({ message: "ID de tarea inválido" });

      const { page, limit } = req.query;
      const { pageNumber, limitNumber } = parsePaginationParams(page as string, limit as string);

      const offers = await OfferService.getOffersByTask(taskId, pageNumber, limitNumber);
      res.json(offers);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene ofertas realizadas por un usuario con paginación.
   */
  static async getOffersByUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User | undefined;
      const userId = req.params.id;
      if (user?.id !== userId && user?.role !== "admin") {
        return res.status(403).json({ message: "No autorizado" });
      }

      const { page, limit } = req.query;
      const { pageNumber, limitNumber } = parsePaginationParams(page as string, limit as string);

      const offers = await OfferService.getOffersByUser(userId, pageNumber, limitNumber);
      res.json(offers);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualiza el estado de una oferta.
   */
  static async updateOfferStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const offerId = parseInt(req.params.id);
      if (isNaN(offerId)) return res.status(400).json({ message: "ID inválido" });

      const { status } = req.body;
      const updatedOffer = await OfferService.updateOfferStatus(offerId, status);
      res.json(updatedOffer);
    } catch (error) {
      next(error);
    }
  }
}