// src/utils/validations.ts
import { z } from "zod";

// Validación para registro o actualización de usuario
export const userSchema = z.object({
  firstName: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().min(1, "El apellido es requerido"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(["user", "admin", "tasker"]).optional(),
});

// Validación para crear un pago
export const paymentSchema = z.object({
  orderId: z.string().min(1, "orderId es requerido"),
  amount: z.number().positive("El monto debe ser positivo"),
  currency: z.enum(["USD", "EUR", "UYU"]),
  method: z.enum(["paypal", "credit_card", "bank_transfer"]),
});

// Validación para crear o actualizar tarea
export const taskSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  categoryId: z.number().int().positive("categoryId inválido"),
  budget: z.number().positive("El presupuesto debe ser positivo").optional(),
  currency: z.enum(["USD", "EUR", "UYU"]).optional(),
  location: z.string().optional(),
  dueDate: z.string().optional(), // Podrías validar fecha con refinements
  status: z.enum(["open", "in_progress", "completed", "cancelled"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  assignedTaskerId: z.string().optional(),
});