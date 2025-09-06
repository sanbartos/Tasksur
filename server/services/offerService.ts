// src/services/offerService.ts
import type { Offer, InsertOffer } from "../shared/schema.js";
import { storage } from "../storage.js";

interface CreateOfferData {
  taskId: number;
  taskerId: string;
  amount: string; // o number si prefieres, pero storage espera string
  currency?: string | null;
  status?: string;
  message?: string;
  estimatedDuration?: string;
}

/**
 * Servicio para manejar la lógica de negocio relacionada con ofertas.
 * Incluye creación, actualización y consulta de ofertas.
 */
export class OfferService {
  /**
   * Crea una nueva oferta.
   * @param data Datos para crear la oferta.
   * @returns La oferta creada.
   */
  static async createOffer(data: CreateOfferData): Promise<Offer> {
    // Mapear CreateOfferData a InsertOffer esperado por storage
    const offerData: InsertOffer = {
      taskId: data.taskId,
      taskerId: data.taskerId,
      amount: data.amount,
      currency: data.currency ?? null,
      status: data.status ?? "pending",
      message: data.message ?? null,
      estimatedDuration: data.estimatedDuration ?? null,
    };

    return storage.createOffer(offerData);
  }

  /**
   * Actualiza el estado de una oferta.
   * @param offerId ID de la oferta a actualizar.
   * @param status Nuevo estado de la oferta.
   * @returns La oferta actualizada o null si no existe.
   */
  static async updateOfferStatus(offerId: number, status: string): Promise<Offer | null> {
    const validStatuses = ["pending", "accepted", "rejected"];
    if (!validStatuses.includes(status)) {
      throw new Error(`Estado inválido: ${status}`);
    }
    const updatedOffer = await storage.updateOfferStatusById(offerId, status);
    return updatedOffer ?? null;
  }

  /**
   * Obtiene una oferta por su ID.
   * @param offerId ID de la oferta.
   * @returns La oferta encontrada o null si no existe.
   */
  static async getOfferById(offerId: number): Promise<Offer | null> {
    const offer = await storage.getOfferById(offerId);
    return offer ?? null;
  }

  /**
   * Lista ofertas asociadas a una tarea con paginación.
   * @param taskId ID de la tarea.
   * @param page Número de página.
   * @param limit Cantidad de resultados por página.
   * @returns Lista de ofertas.
   */
  static async getOffersByTask(taskId: number, page: number, limit: number): Promise<Offer[]> {
    return storage.getOffersByTaskId(taskId, page, limit);
  }

  /**
   * Lista ofertas realizadas por un usuario con paginación.
   * @param userId ID del usuario.
   * @param page Número de página.
   * @param limit Cantidad de resultados por página.
   * @returns Lista de ofertas.
   */
  static async getOffersByUser(userId: string, page: number, limit: number): Promise<Offer[]> {
    return storage.getOffersByTaskerId(userId, page, limit);
  }

  /**
   * Lista ofertas con filtros opcionales.
   * @param filter Filtros para la búsqueda.
   * @returns Lista de ofertas que cumplen el filtro.
   */
  static async listOffers(filter?: Partial<Offer>): Promise<Offer[]> {
    if (typeof storage.listOffers !== "function") {
      throw new Error("Método listOffers no implementado en storage");
    }
    return storage.listOffers(filter);
  }
}