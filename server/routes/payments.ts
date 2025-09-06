import { Router } from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { PaymentController } from "../controllers/paymentController.js";

const router = Router();

router.post('/', isAuthenticated, PaymentController.createPayment);

router.patch('/:orderId/status', isAuthenticated, PaymentController.updatePaymentStatus);

router.get('/', isAuthenticated, PaymentController.getPaymentsByUser);

router.get('/:id', isAuthenticated, PaymentController.getPaymentByOrderId);

export default router;