// validations.ts
import Joi from 'joi';

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "El email debe ser válido",
    "any.required": "El email es obligatorio",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "La contraseña debe tener al menos 6 caracteres",
    "any.required": "La contraseña es obligatoria",
  }),
});

export const registerSchema = Joi.object({
  name: Joi.string().required().messages({
    "any.required": "El nombre es obligatorio",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "El email debe ser válido",
    "any.required": "El email es obligatorio",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "La contraseña debe tener al menos 6 caracteres",
    "any.required": "La contraseña es obligatoria",
  }),
});

export const createTaskSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  categoryId: Joi.number().integer().required(),
  budget: Joi.number().optional(),
  currency: Joi.string().optional(),
  location: Joi.string().optional(),
  dueDate: Joi.date().optional(),
  priority: Joi.string().valid('low', 'medium', 'high').optional(),
});

export const updateTaskSchema = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().optional(),
  categoryId: Joi.number().integer().optional(),
  budget: Joi.number().optional(),
  currency: Joi.string().optional(),
  location: Joi.string().optional(),
  dueDate: Joi.date().optional(),
  priority: Joi.string().valid('low', 'medium', 'high').optional(),
  status: Joi.string().valid('pending', 'in_progress', 'completed', 'cancelled').optional(),
});

export const createOfferSchema = Joi.object({
  taskId: Joi.number().integer().required(),
  amount: Joi.number().required(),
  currency: Joi.string().required(),
  message: Joi.string().optional(),
  estimatedDuration: Joi.string().optional(),
});

export const createCategorySchema = Joi.object({
  name: Joi.string().required(),
  slug: Joi.string().required(),
  description: Joi.string().optional(),
  icon: Joi.string().optional(),
  color: Joi.string().optional(),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().optional(),
  slug: Joi.string().optional(),
  description: Joi.string().optional(),
  icon: Joi.string().optional(),
  color: Joi.string().optional(),
});

export const createMessageSchema = Joi.object({
  taskId: Joi.number().integer().required(),
  content: Joi.string().required(),
  receiverId: Joi.string().required(),
});