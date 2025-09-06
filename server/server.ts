import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";

import usersRouter from "./routes/user.js";
import articlesRouter from "./routes/articles.js";
import messageRoutes from "./routes/messageRoutes.js";
import { registerRoutes } from "./routes.js";

import { registerTaskRoutes } from "./routes/tasks.js";
import { registerCategoryRoutes } from "./routes/categories.js";
import { registerOfferRoutes } from "./routes/offers.js"; // corregido nombre archivo
import { registerReviewRoutes } from "./routes/reviews.js";
import paymentsRouter from "./routes/payments.js";
import logger from './utils/logger.js';
import { loggerMiddleware } from "./middlewares/loggerMiddleware.js";

import createProfileRouter from "./routes/createProfile.js";

import { errorHandler } from "./middlewares/errorMiddleware.js";

const app = express();

// Middlewares globales
app.use(cors({ origin: true })); // En producción, restringir orígenes específicos
app.use(cookieParser());
app.use(express.json());
app.use(loggerMiddleware);
app.use("/uploads", express.static("uploads"));

// Rutas
app.use("/api/messages", messageRoutes);
app.use("/api", articlesRouter);
app.use("/api", createProfileRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/users", usersRouter);

registerTaskRoutes(app);
registerCategoryRoutes(app);
registerOfferRoutes(app);
registerReviewRoutes(app);

registerRoutes(app).catch(err => {
  logger.error("Error registrando rutas:", err);
  process.exit(1);
});

// Middleware para rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

// Middleware global de manejo de errores
app.use(errorHandler);

const server = createServer(app);
const port = process.env.PORT || 3000;
server.listen(port, () => {
  logger.info(`Servidor corriendo en puerto ${port}`);
  console.log(`Servidor corriendo en puerto ${port}`);
});

// Manejo global de errores no capturados
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection:", reason);
});

export default app;