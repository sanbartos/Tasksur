// src/middlewares/isAuthenticated.ts
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { User } from "../types/user.js";
import { storage } from "../storage.js";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extrae token de cookie o header Authorization
    const authHeader = req.headers.authorization;
    const token =
      (req.cookies?.sesion as string | undefined) ||
      (req.cookies?.session as string | undefined) ||
      (authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined);

    if (!token) {
      return res.status(401).json({ message: "No autorizado: token no proporcionado" });
    }

    // Verifica token JWT
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string; role?: string; email?: string };

    if (!payload.userId) {
      return res.status(401).json({ message: "Token inválido: userId no encontrado" });
    }

    // Busca usuario en DB
    const user = await storage.getUserById(payload.userId);

    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    // Normaliza campos numéricos y opcionales
    const toNumberOrNull = (value: any): number | null => {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
};

    const normalizedUser: User = {
  ...user,
  totalEarnings: user.totalEarnings != null ? String(user.totalEarnings) : null,
  totalTasks: toNumberOrNull(user.totalTasks),
  rating: user.rating != null ? String(user.rating) : null,
  reviewCount: toNumberOrNull(user.reviewCount),
  hourlyRate: user.hourlyRate != null ? String(user.hourlyRate) : null,
  skills: user.skills ?? [],
  bio: user.bio ?? null,
  location: user.location ?? null,
  phone: user.phone ?? null,
  profileImageUrl: user.profileImageUrl ?? null,
  firstName: user.firstName ?? null,
  lastName: user.lastName ?? null,
  email: user.email ?? null,
  isTasker: user.isTasker ?? null,
  createdAt: user.createdAt ?? undefined,
  updatedAt: user.updatedAt ?? null,
};

    // Asigna usuario normalizado a req.user
    req.user = normalizedUser;

    next();
  } catch (error) {
    console.error("Error en autenticación:", error);
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};