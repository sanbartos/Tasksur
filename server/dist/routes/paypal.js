import { loadPaypalDefault, createPaypalOrder, capturePaypalOrder } from '../paypal.js';
export function registerPaypalRoutes(app) {
    app.get("/api/paypal/setup", async (req, res, next) => {
        try {
            await loadPaypalDefault(req, res);
        }
        catch (error) {
            next(error);
        }
    });
    app.post("/api/paypal/order", async (req, res, next) => {
        try {
            await createPaypalOrder(req, res);
        }
        catch (error) {
            next(error);
        }
    });
    app.post("/api/paypal/order/:orderID/capture", async (req, res, next) => {
        try {
            await capturePaypalOrder(req, res);
        }
        catch (error) {
            next(error);
        }
    });
}
