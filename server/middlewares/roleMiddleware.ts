// server/middlewares/roleMiddleware.ts
import type { Request, Response, NextFunction } from "express";
import type { User } from "../types/user.js";
import { UserRole } from "../types/user.js";

function norm(v: unknown): string {
  return (v ?? "").toString().trim().toLowerCase();
}

// Para permitir pasar enums o strings mezclados en allowedRoles
function normalizeAllowedRoles(roles: Array<string | UserRole>): string[] {
  return roles.map(r => norm(r));
}

// Debug opcional: activa con ROLE_DEBUG=1 en el ambiente
const ROLE_DEBUG = process.env.ROLE_DEBUG === "1";

export function authorizeRoles(...allowedRoles: Array<string | UserRole>) {
  const normalizedAllowed = normalizeAllowedRoles(allowedRoles);

  return (req: Request, res: Response, next: NextFunction) => {
    const userRoleRaw = (req.user as User | undefined)?.role;
    const userRole = norm(userRoleRaw);

    if (ROLE_DEBUG) {
      console.log("ROLE_DEBUG authorizeRoles:", {
        userRoleRaw,
        userRole,
        allowedRoles,
        normalizedAllowed,
      });
    }

    if (!userRole) {
      return res.status(401).json({ message: "No autorizado: rol no encontrado" });
    }

    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({ message: "No tienes permiso para realizar esta acción" });
    }

    next();
  };
}