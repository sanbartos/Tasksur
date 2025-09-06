// src/schemas/offerSchemas.ts
import Joi from "joi";

/**
 * Esquema para validar la creación de una oferta.
 * Campos obligatorios y opcionales con validaciones claras.
 */
export const createOfferSchema = Joi.object({
  taskId: Joi.number().integer().positive().required()
    .messages({
      "number.base": "El ID de la tarea debe ser un número.",
      "number.integer": "El ID de la tarea debe ser un entero.",
      "number.positive": "El ID de la tarea debe ser positivo.",
      "any.required": "El ID de la tarea es obligatorio.",
    }),
  price: Joi.number().positive().required()
    .messages({
      "number.base": "El precio debe ser un número.",
      "number.positive": "El precio debe ser un número positivo.",
      "any.required": "El precio es obligatorio.",
    }),
  description: Joi.string().max(500).optional()
    .messages({
      "string.base": "La descripción debe ser un texto.",
      "string.max": "La descripción no puede exceder 500 caracteres.",
    }),
});

/**
 * Esquema para validar la actualización del estado de una oferta.
 * Solo permite ciertos valores para el estado.
 */
export const updateOfferStatusSchema = Joi.object({
  status: Joi.string().valid("pending", "accepted", "rejected").required()
    .messages({
      "any.only": "El estado debe ser 'pending', 'accepted' o 'rejected'.",
      "any.required": "El estado es obligatorio.",
    }),
});