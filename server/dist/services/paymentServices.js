import { storage } from "../storage.js";
export class PaymentService {
    /**
     * Crea un nuevo pago.
     * @param paymentData Datos del pago a crear.
     * @returns El pago creado.
     */
    static async createPayment(paymentData) {
        // Aquí puedes agregar lógica adicional, validaciones o integración con pasarelas de pago
        return storage.createPayment(paymentData);
    }
    /**
     * Actualiza el estado de un pago por su orderId.
     * @param orderId Identificador de la orden.
     * @param status Nuevo estado del pago.
     * @returns El pago actualizado o undefined si no existe.
     */
    static async updatePaymentStatus(orderId, status) {
        // Validar estados permitidos, notificar, etc.
        return storage.updatePaymentStatus(orderId, status);
    }
    /**
     * Obtiene los pagos de un usuario con paginación.
     * @param userId ID del usuario.
     * @param page Número de página.
     * @param limit Cantidad de resultados por página.
     * @returns Lista de pagos.
     */
    static async getPaymentsByUser(userId, page = 1, limit = 10) {
        return storage.getPaymentsByUser(userId, page, limit);
    }
    /**
     * Obtiene un pago por su orderId.
     * @param orderId Identificador de la orden.
     * @returns El pago o undefined si no existe.
     */
    static async getPaymentByOrderId(orderId) {
        return storage.getPaymentByOrderId(orderId);
    }
}
