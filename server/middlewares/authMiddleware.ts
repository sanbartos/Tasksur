// src/middlewares/authMiddleware.ts
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { storage } from "../storage.js";
import { UserRole } from "../types/user.js";
import type { User } from "../types/user.js";
import type { UserFromDb } from "../types/userFromDb.js";

// Extiende Request para incluir user tipado
export interface AuthenticatedRequest extends Request {
  user?: User;
}

// Nombres posibles de cookie para token JWT
const COOKIE_NAMES = ["sesion", "session"] as const;

// Extrae token JWT de cookies o header Authorization
function getCookieToken(req: Request): string | undefined {
  const cookies = (req as any).cookies || {};
  for (const name of COOKIE_NAMES) {
    if (cookies[name]) return cookies[name] as string;
  }
  return undefined;
}

// Limpia y adapta usuario de DB a tipo User esperado
export function cleanUser(user: UserFromDb): User {
  const toNumberOrNull = (value: any): number | null => {
    if (value === null || value === undefined) return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
  };

  const toStringOrNull = (value: any): string | null => {
    if (value === null || value === undefined) return null;
    return String(value);
  };

  return {
    ...user,
    email: user.email ?? null,
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
    profileImageUrl: user.profileImageUrl ?? null,
    phone: user.phone ?? null,
    location: user.location ?? null,
    bio: user.bio ?? null,
    skills: user.skills ? JSON.parse(user.skills) : [],
    hourlyRate: toStringOrNull(user.hourlyRate),
    totalEarnings: toStringOrNull(user.totalEarnings),
    rating: toStringOrNull(user.rating),
    reviewCount: toNumberOrNull(user.reviewCount),
    totalTasks: toNumberOrNull(user.totalTasks),
    createdAt: user.createdAt ?? undefined,
    updatedAt: user.updatedAt ?? null,
    isTasker: user.isTasker ?? null,
  };
}

interface JwtPayload {
  id?: string;
  userId?: string;
  email?: string;
  role: string;
  iat?: number;
  exp?: number;
}

function isValidUserRole(role: any): role is UserRole {
  return Object.values(UserRole).includes(role);
}

function getTokenFromRequest(req: Request): string | null {
  const cookieToken = getCookieToken(req);
  if (cookieToken) return cookieToken;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);

  return null;
}

// Middleware principal: verifica JWT y carga usuario completo a req.user
export const isAuthenticated = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ message: "No autorizado: falta token" });
    }

    const secret = process.env.JWT_SECRET || "secret";
    const decoded = jwt.verify(token, secret) as JwtPayload;

    const userId = decoded.id || decoded.userId;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Token inválido: sin id de usuario" });
    }

    if (!decoded.role || !isValidUserRole(decoded.role)) {
      return res.status(401).json({ message: "Rol inválido en token" });
    }

   const dbUser: User | undefined = await storage.getUser(userId);
if (!dbUser) {
  return res.status(401).json({ message: "Usuario no encontrado" });
}

// No llamar a cleanUser porque dbUser ya es User
req.user = dbUser;
return next();
  } catch (err: any) {
    if (err?.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expirado" });
    }
    if (err?.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token inválido" });
    }
    console.error("Error en autenticación:", err);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Middleware ligero: solo verifica token y asigna id/role sin cargar DB
export async function verifyToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const token = getTokenFromRequest(req);
  if (!token)
    return res
      .status(401)
      .json({ message: "No autorizado: token faltante" });

  try {
    const secret = process.env.JWT_SECRET || "secret";
    const decoded = jwt.verify(token, secret) as JwtPayload;

    const userId = decoded.id || decoded.userId;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Token inválido: sin id de usuario" });
    }
    if (!decoded.role || !isValidUserRole(decoded.role)) {
      return res.status(401).json({ message: "Rol inválido en token" });
    }

    const role = decoded.role;
    req.user = {
      id: userId,
      email: null,
      role,
      firstName: null,
      lastName: null,
      profileImageUrl: null,
      phone: null,
      isTasker: null,
      skills: [],
      hourlyRate: null,
      totalEarnings: null,
      totalTasks: null,
      rating: null,
      reviewCount: null,
      updatedAt: null,
      userId,
    } as User & { userId?: string };

    return next();
  } catch (err: any) {
    if (err?.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expirado" });
    }
    if (err?.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token inválido" });
    }
    return res.status(401).json({ message: "Token inválido" });
  }
}

// Permisos para modificar tarea
export async function canModifyTask(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user;
    const userId = user?.id;
    const userRole = user?.role;
    const taskId = parseInt(req.params.id);

    if (!userId) return res.status(401).json({ message: "No autorizado" });

    const task = await storage.getTaskById(taskId);
    if (!task) return res.status(404).json({ message: "Tarea no encontrada" });

    if (userRole === UserRole.ADMIN) return next();
    if (task.clientId === userId) return next();
    if (task.assignedTaskerId === userId) return next();

    return res
      .status(403)
      .json({ message: "No tienes permiso para modificar esta tarea" });
  } catch (error) {
    console.error("Error en canModifyTask:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
}

// Permisos para modificar oferta
export async function canModifyOffer(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user;
    const userId = user?.id;
    const userRole = user?.role;
    const offerId = parseInt(req.params.id);

    if (!userId) return res.status(401).json({ message: "No autorizado" });

    const offer = await storage.getOfferById(offerId);
    if (!offer) return res.status(404).json({ message: "Oferta no encontrada" });

    const task = await storage.getTaskById(offer.taskId);
    if (!task) return res.status(404).json({ message: "Tarea no encontrada" });

    if (
      userRole === UserRole.ADMIN ||
      (task.clientId === userId && task.status === "pending")
    ) {
      return next();
    }

    return res
      .status(403)
      .json({ message: "No tienes permiso para modificar esta oferta" });
  } catch (error) {
    console.error("Error en canModifyOffer:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
}

// Permisos para acceder a mensajes de tarea
export async function canAccessTaskMessages(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user;
    const userId = user?.id;
    const taskId = parseInt(req.params.id);

    if (!userId) return res.status(401).json({ message: "No autorizado" });

    const task = await storage.getTaskById(taskId);
    if (!task) return res.status(404).json({ message: "Tarea no encontrada" });

    if (
      task.clientId === userId ||
      task.assignedTaskerId === userId ||
      user?.role === UserRole.ADMIN
    ) {
      return next();
    }

    return res
      .status(403)
      .json({ message: "No tienes permiso para acceder a estos mensajes" });
  } catch (error) {
    console.error("Error en canAccessTaskMessages:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
}

// Middleware para verificar si el usuario es admin
export function isAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const user = req.user;

  if (!user || user.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: "Acceso denegado. Solo administradores." });
  }

  return next();
}