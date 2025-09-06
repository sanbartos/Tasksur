// server/types/user.ts

// Enum para roles de usuario
export enum UserRole {
  ADMIN = "admin",
  TASKER = "tasker",
  CLIENT = "client",
  GUEST = "guest",
}

// Tipo para preferencias de notificaciones
export type NotificationPreferences = {
  emailTaskUpdates?: boolean;
  emailMessages?: boolean;
  emailPayments?: boolean;
  pushTaskUpdates?: boolean;
  pushMessages?: boolean;
  smsUrgent?: boolean;
};

// Interfaz User con propiedades comunes y flexibilidad para ampliar
export interface User {
  id: string;
  email: string | null;
  password?: string; // opcional si no siempre está disponible
  role?: UserRole | string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  phone: string | null;
  isTasker: boolean | null;
  location?: string | null;
  bio?: string | null;
  skills: string[] | any[] | null;
  hourlyRate: string | null;
  totalEarnings: string | null;
  totalTasks: number | null;
  rating: string | null;
  reviewCount: number | null;
  createdAt?: Date | null;
  updatedAt: Date | null;
  notifications?: NotificationPreferences | null;

  [key: string]: any; // para campos adicionales
}

// Tipo para crear o actualizar usuario, incluye role obligatorio
export type UpsertUser = {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  password: string;
  role: UserRole;
  // otras propiedades que uses para crear/actualizar usuario
};