import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger.js";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Loguea el stack completo usando logger
  logger.error(`[${new Date().toISOString()}] Error en ${req.method} ${req.url}`);
  logger.error(err.stack || err);

  // Puedes detectar tipos de error específicos aquí
  // Ejemplo: error de validación
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message, details: err.errors });
  }

  // En desarrollo, enviar más detalles
  if (process.env.NODE_ENV === "development") {
    return res.status(500).json({
      message: err.message || "Error interno del servidor",
      stack: err.stack,
    });
  }

  // En producción, mensaje genérico
  res.status(500).json({ message: "Error interno del servidor" });
}