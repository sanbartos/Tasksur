import { Router, Request, Response } from "express";
import multer from "multer";
import bcrypt from "bcrypt";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { storage } from "../storage.js";
import type { User } from "../types/user.js";

const router = Router();
const upload = multer({ dest: "uploads/" });

// Rutas públicas

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const user = await storage.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
    });
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Rutas protegidas

router.get("/me", isAuthenticated, (req: Request, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).json({ message: "No autorizado" });
  res.json({ user });
});

router.post(
  "/profile",
  isAuthenticated,
  upload.single("profileImage"),
  async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ message: "Usuario no autenticado" });
      const userId = user.id;

      const { firstName, lastName, email, phone, location, bio } = req.body;

      let profileImageUrl;
      if (req.file) {
        profileImageUrl = `/uploads/${req.file.filename}`;
      }

      // Convierte hourlyRate, totalEarnings y rating a string si vienen como number
      const updates: Partial<User> = { firstName, lastName, email, phone, location, bio };
      if (profileImageUrl) {
        updates.profileImageUrl = profileImageUrl;
      }

      if (req.body.hourlyRate !== undefined && req.body.hourlyRate !== null) {
        const hr = req.body.hourlyRate as string | number;
        updates.hourlyRate = typeof hr === "number" ? hr.toString() : hr;
      }

      if (req.body.totalEarnings !== undefined && req.body.totalEarnings !== null) {
        const te = req.body.totalEarnings as string | number;
        updates.totalEarnings = typeof te === "number" ? te.toString() : te;
      }

      if (req.body.rating !== undefined && req.body.rating !== null) {
        const r = req.body.rating as string | number;
        updates.rating = typeof r === "number" ? r.toString() : r;
      }

      const updatedUser = await storage.updateUserProfile(userId, updates);
      res.json({ message: "Perfil actualizado", user: updatedUser });
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }
);

router.patch("/profile", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "No autenticado" });
    const userId = user.id;

    const updates: Partial<User> = req.body;

    if (updates.email && !updates.email.includes("@")) {
      return res.status(400).json({ message: "Email inválido" });
    }

    if (updates.hourlyRate !== undefined && updates.hourlyRate !== null) {
      const hr = updates.hourlyRate as string | number;
      updates.hourlyRate = typeof hr === "number" ? hr.toString() : hr;
    }

    if (updates.totalEarnings !== undefined && updates.totalEarnings !== null) {
      const te = updates.totalEarnings as string | number;
      updates.totalEarnings = typeof te === "number" ? te.toString() : te;
    }

    if (updates.rating !== undefined && updates.rating !== null) {
      const r = updates.rating as string | number;
      updates.rating = typeof r === "number" ? r.toString() : r;
    }

    const updatedUser = await storage.updateUserProfile(userId, updates);
    res.json({ message: "Perfil actualizado", user: updatedUser });
  } catch (error) {
    console.error("Error actualizando perfil:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.get("/:id/stats", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const stats = await storage.getUserStats(userId);
    res.json(stats);
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
});

router.post("/change-password", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Usuario no autenticado" });
    const userId = user.id;

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Faltan campos" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "La nueva contraseña es muy corta" });
    }

    const userFromDb = await storage.getUserById(userId);
    if (!userFromDb) return res.status(404).json({ message: "Usuario no encontrado" });

    const match = await bcrypt.compare(currentPassword, userFromDb.password);
    if (!match) {
      return res.status(401).json({ message: "Contraseña actual incorrecta" });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await storage.updateUserPassword(userId, newHash);

    res.json({ message: "Contraseña cambiada correctamente" });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.post("/notifications", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Usuario no autenticado" });
    const userId = user.id;

    const notifications = req.body;

    await storage.updateUserNotifications(userId, notifications);
    res.json({ message: "Preferencias guardadas" });
  } catch (error) {
    console.error("Error al guardar notificaciones:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.delete("/delete-account", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Usuario no autenticado" });
    const userId = user.id;

    const deleted = await storage.deleteUserById(userId);

    if (!deleted) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json({ message: "Cuenta eliminada correctamente" });
  } catch (error) {
    console.error("Error eliminando cuenta:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

export default router;