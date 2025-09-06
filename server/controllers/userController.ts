// src/controllers/userController.ts
import { Request, Response } from "express";
import { storage } from "../storage.js";
import type { User } from "../shared/schema.js";
import bcrypt from "bcrypt";

interface AuthenticatedRequest extends Request {
  user?: User;
}

function requireUser(req: AuthenticatedRequest): string | null {
  return req.user?.id ?? null;
}

export const getUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = requireUser(req);
    if (!userId) return res.status(401).json({ message: "No autorizado" });

    const user = await storage.getUserById(userId);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    return res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone,
      location: user.location,
      bio: user.bio,
      profileImageUrl: user.profileImageUrl,
      rating: user.rating,
      reviewCount: user.reviewCount,
      skills: user.skills,
      totalEarnings: user.totalEarnings,
      totalTasks: user.totalTasks,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error("Error obteniendo perfil:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const updateUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = requireUser(req);
    if (!userId) return res.status(401).json({ message: "No autorizado" });

    const allowedFields: (keyof User)[] = [
      "firstName",
      "lastName",
      "email",
      "bio",
      "phone",
      "location",
      "profileImageUrl",
      "skills",
      "hourlyRate",
      "isTasker",
    ];

    const updates: Partial<User> = {};
    for (const field of allowedFields) {
      if (field in req.body) {
        updates[field] = req.body[field];
      }
    }

    const updatedUser = await storage.updateUserProfile(userId, updates);
    return res.json(updatedUser);
  } catch (error) {
    console.error("Error actualizando perfil:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const updateUserPassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = requireUser(req);
    if (!userId) return res.status(401).json({ message: "No autorizado" });

    const { currentPassword, newPassword } = req.body;
    if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
      return res.status(400).json({ message: "Contraseña actual y nueva son requeridas" });
    }

    const user = await storage.getUserById(userId);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    // Verificar contraseña actual
    const passwordMatches = await bcrypt.compare(currentPassword, user.password ?? "");
    if (!passwordMatches) {
      return res.status(403).json({ message: "Contraseña actual incorrecta" });
    }

    // Hashear nueva contraseña y actualizar
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await storage.updateUserPassword(userId, hashedNewPassword);

    return res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("Error actualizando contraseña:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const updateUserNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = requireUser(req);
    if (!userId) return res.status(401).json({ message: "No autorizado" });

    const notifications = req.body.notifications;
    if (typeof notifications !== "object") {
      return res.status(400).json({ message: "Notificaciones inválidas" });
    }

    await storage.updateUserNotifications(userId, notifications);
    return res.json({ message: "Notificaciones actualizadas" });
  } catch (error) {
    console.error("Error actualizando notificaciones:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = requireUser(req);
    if (!userId) return res.status(401).json({ message: "No autorizado" });

    const deleted = await storage.deleteUserById(userId);
    if (!deleted) return res.status(404).json({ message: "Usuario no encontrado o ya eliminado" });

    return res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error eliminando usuario:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getUserStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = requireUser(req);
    if (!userId) return res.status(401).json({ message: "No autorizado" });

    const stats = await storage.getUserStats(userId);
    return res.json(stats);
  } catch (error) {
    console.error("Error obteniendo estadísticas de usuario:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};