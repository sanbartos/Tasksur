import type { Express, Request, Response, NextFunction } from "express";
import { loadPaypalDefault, createPaypalOrder, capturePaypalOrder } from '../paypal.js';

export function registerPaypalRoutes(app: Express) {
  app.get("/api/paypal/setup", async (req: Request, res: Response, next: NextFunction) => {
    try {
      await loadPaypalDefault(req, res);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/paypal/order", async (req: Request, res: Response, next: NextFunction) => {
    try {
      await createPaypalOrder(req, res);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/paypal/order/:orderID/capture", async (req: Request, res: Response, next: NextFunction) => {
    try {
      await capturePaypalOrder(req, res);
    } catch (error) {
      next(error);
    }
  });
}