import { PaymentService } from "../services/paymentServices.js";
import { parsePaginationParams } from "../utils/pagination.js";
export class PaymentController {
    static async createPayment(req, res) {
        try {
            const user = req.user;
            const userId = user?.id;
            if (!userId)
                return res.status(401).json({ message: "No autorizado" });
            const { orderId, amount, currency, method } = req.body;
            if (!orderId || amount === undefined || !currency || !method) {
                return res.status(400).json({ message: "Datos incompletos para crear pago" });
            }
            const amountNumber = Number(amount);
            if (isNaN(amountNumber) || amountNumber <= 0) {
                return res.status(400).json({ message: "El monto debe ser un número positivo" });
            }
            const validMethods = ['paypal', 'credit_card', 'bank_transfer'];
            if (!validMethods.includes(method)) {
                return res.status(400).json({ message: "Método de pago inválido" });
            }
            const validCurrencies = ['USD', 'EUR', 'UYU'];
            if (!validCurrencies.includes(currency)) {
                return res.status(400).json({ message: "Moneda no soportada" });
            }
            const payment = await PaymentService.createPayment({
                userId,
                orderId,
                amount: amountNumber.toString(),
                currency,
                status: 'pending',
                method,
            });
            res.status(201).json(payment);
        }
        catch (error) {
            console.error("Error creando pago:", error);
            res.status(500).json({ message: "Error interno del servidor" });
        }
    }
    static async updatePaymentStatus(req, res) {
        try {
            const { orderId } = req.params;
            const { status } = req.body;
            if (!status) {
                return res.status(400).json({ message: "Estado es requerido" });
            }
            const validStatuses = ['pending', 'completed', 'failed', 'cancelled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ message: "Estado inválido" });
            }
            const updatedPayment = await PaymentService.updatePaymentStatus(orderId, status);
            if (!updatedPayment) {
                return res.status(404).json({ message: "Pago no encontrado" });
            }
            res.json(updatedPayment);
        }
        catch (error) {
            console.error("Error actualizando estado de pago:", error);
            res.status(500).json({ message: "Error interno del servidor" });
        }
    }
    static async getPaymentsByUser(req, res) {
        try {
            const user = req.user;
            const userId = user?.id;
            if (!userId)
                return res.status(401).json({ message: "No autorizado" });
            const { page, limit } = req.query;
            const { pageNumber, limitNumber } = parsePaginationParams(page, limit);
            const payments = await PaymentService.getPaymentsByUser(userId, pageNumber, limitNumber);
            res.json(payments);
        }
        catch (error) {
            console.error("Error obteniendo pagos del usuario:", error);
            res.status(500).json({ message: "Error interno del servidor" });
        }
    }
    static async getPaymentByOrderId(req, res) {
        try {
            const user = req.user;
            const userId = user?.id;
            if (!userId)
                return res.status(401).json({ message: "No autorizado" });
            const { id } = req.params;
            const payment = await PaymentService.getPaymentByOrderId(id);
            if (!payment) {
                return res.status(404).json({ message: "Pago no encontrado" });
            }
            if (payment.userId !== userId && user?.role !== 'admin') {
                return res.status(403).json({ message: "No tienes permiso para ver este pago" });
            }
            res.json(payment);
        }
        catch (error) {
            console.error("Error obteniendo pago:", error);
            res.status(500).json({ message: "Error interno del servidor" });
        }
    }
}
