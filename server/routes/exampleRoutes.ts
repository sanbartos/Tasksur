import type { User } from "../types/user.js";
import type { Express, Request, Response } from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

export function registerExampleRoutes(app: Express) {
  app.get("/api/some-route", isAuthenticated, (req: Request, res: Response) => {
    const user = req.user as User | undefined;
    console.log("ID del usuario autenticado:", user?.id);
    res.json({ message: "Ruta protegida accesible", userId: user?.id });
  });
}