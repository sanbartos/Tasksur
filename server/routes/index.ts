// src/routes/index.ts
import type { Express } from "express";
import usersRouter from "./user.js";
import { registerTaskRoutes } from "./tasks.js";
import { registerCategoryRoutes } from "./categories.js";
import { registerAuthRoutes } from "./auth.js";
import messageRoutes from "./messageRoutes.js";
import { registerOfferRoutes } from "./offers.js";
import { registerReviewRoutes } from "./reviews.js";
import paymentsRouter from "./payments.js";
import { registerNotificationRoutes } from "./notifications.js";
import { registerPaypalRoutes } from "./paypal.js";
import { registerDashboardRoutes } from "./dashboard.js";

import createProfileRouter from "./createProfile.js";

export async function registerRoutes(app: Express) {
  registerAuthRoutes(app);

  app.use("/api", createProfileRouter);

  app.use("/api/users", usersRouter);
  registerTaskRoutes(app);
  registerCategoryRoutes(app);
  app.use("/api/messages", messageRoutes);
  registerOfferRoutes(app);
  registerReviewRoutes(app);
  app.use("/api/payments", paymentsRouter);
  registerNotificationRoutes(app);
  registerPaypalRoutes(app);
  registerDashboardRoutes(app);
}