// src/lib/types.ts
/**
 * Tipos y enums compartidos para la aplicación.
 * Mejoras:
 * - IDs tipados (alias) para mayor claridad.
 * - Enums para estados comunes.
 * - Campos opcionales / nullable mantenidos según tu esquema.
 * - Campos auxiliares (attachments, tags, meta) añadidos para flexibilidad.
 */

/* Aliases para IDs */
export type UserId = string;
export type TaskId = number;
export type CategoryId = number;
export type OfferId = number;
export type MessageId = number;
export type ReviewId = number;
export type NotificationId = number;
export type PaymentId = number;

/* Enums útiles */
export enum TaskStatus {
  OPEN = "open",
  ASSIGNED = "assigned",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum TaskPriority {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
  URGENT = "urgent",
}

export enum OfferStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  WITHDRAWN = "withdrawn",
}

export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
}

export enum NotificationChannel {
  EMAIL = "email",
  PUSH = "push",
  SMS = "sms",
}

export enum NotificationType {
  TASK_UPDATE = "task_update",
  MESSAGE = "message",
  PAYMENT = "payment",
  SYSTEM = "system",
}

/* Preferencias de notificaciones */
export type NotificationPreferences = {
  emailTaskUpdates?: boolean;
  emailMessages?: boolean;
  emailPayments?: boolean;
  pushTaskUpdates?: boolean;
  pushMessages?: boolean;
  smsUrgent?: boolean;
};

/* Entidades principales */

/**
 * Cliente (subset de User pensado como "cliente" en el contexto de una tarea).
 */
export interface Client {
  id: UserId;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  createdAt?: string | null; // ISO date
  totalTasks?: number | null;
}

/**
 * Categoría de servicio
 */
export interface Category {
  id: CategoryId;
  name: string;
  description?: string;
  icon?: string; // URL o emoji
  color?: string; // color hex u otro identificador
  priceRange?: string; // ejemplo: "500-2000"
  slug?: string; // opcional para routing (ej. "reparaciones")
}

/**
 * Usuario completo (tasker o cliente)
 */
export interface User {
  id: UserId;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  role?: string | null; // ej. "admin" | "tasker" | "client"
  profileImageUrl?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  bio?: string | null;
  skills?: string[] | null;
  totalEarnings?: number | null;
  totalTasks?: number | null;
  phone?: string | null;
  location?: string | null;
  hourlyRate?: number | null;
  isTasker?: boolean | null;
  createdAt?: string | null; // ISO date
  notifications?: NotificationPreferences | null;
  // campos de perfil extendido opcionales
  languages?: string[] | null;
  verified?: boolean | null;
}

/**
 * Tarea / Trabajo solicitado
 */
export interface Task {
  id: TaskId;
  clientId: UserId;
  title: string;
  description?: string | null;
  budget?: number | null;
  currency?: string | null; // ej. "UYU", "ARS", "USD"
  location?: string | null;
  priority?: TaskPriority | string;
  status?: TaskStatus | string;
  createdAt?: string; // ISO date
  dueDate?: string | null; // ISO date
  categoryId?: CategoryId | null;
  category?: Category | null;
  client?: Client | null;
  assignedTasker?: User | null;
  attachments?: string[]; // URLs
  tags?: string[];
  // campos calculados / útiles en frontend
  rating?: number | null;
  offersCount?: number | null;
}

/**
 * Oferta hecha por un tasker a una tarea
 */
export interface Offer {
  id: OfferId;
  taskId: TaskId;
  taskerId: UserId;
  amount: number;
  currency?: string | null;
  message?: string | null;
  estimatedDuration?: string | null; // ejemplo "2 horas", "3 días"
  status: OfferStatus | string;
  createdAt: string; // ISO date
  updatedAt?: string; // ISO date
  tasker?: User | null;
  task?: Task | null;
}

/**
 * Mensaje dentro del chat de una tarea
 */
export interface Message {
  id: MessageId;
  taskId: TaskId;
  senderId: UserId;
  content: string;
  createdAt: string; // ISO date
  read: boolean;
  sender?: User | null;
  attachments?: string[]; // URLs
}

/**
 * Reseña / valoración entre usuarios
 */
export interface Review {
  id: ReviewId;
  taskId?: TaskId | null;
  reviewerId: UserId;
  reviewedId: UserId;
  rating: number; // 0-5 (valida en backend)
  comment?: string | null;
  createdAt: string; // ISO date
  reviewer?: User | null;
  reviewed?: User | null;
}

/**
 * Notificación para un usuario
 */
export interface Notification {
  id: NotificationId;
  userId: UserId;
  title: string;
  message: string;
  type: NotificationType | string;
  channel?: NotificationChannel | string;
  read: boolean;
  createdAt: string; // ISO date
  relatedId?: number | string | null; // id de entidad relacionada (taskId, offerId, etc.)
  meta?: Record<string, any> | null; // datos adicionales
}

/**
 * Pago asociado a una tarea
 */
export interface Payment {
  id: PaymentId;
  taskId: TaskId;
  payerId: UserId;
  receiverId: UserId;
  amount: number;
  currency: string;
  status: PaymentStatus | string;
  method?: string | null; // ej. "card", "mercado-pago"
  providerTransactionId?: string | null;
  createdAt: string; // ISO date
  updatedAt?: string; // ISO date
  task?: Task | null;
  payer?: User | null;
  receiver?: User | null;
}

/* Utilidades / tipos auxiliares exportados si los necesitas */
export type Maybe<T> = T | null | undefined;