import { createServer } from "http";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Joi from "joi";
import { storage } from "./storage.js";
import { setupAuth } from "./replitAuth.js";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal.js";
import { isAuthenticated } from "./middlewares/authMiddleware.js";
import { authorizeRoles } from "./middlewares/roleMiddleware.js";
import { loggerMiddleware } from "./middlewares/loggerMiddleware.js";
import { createTaskSchema, updateTaskSchema, createOfferSchema, createCategorySchema, updateCategorySchema, createMessageSchema } from "./middlewares/validations.js";
import { v4 as uuidv4 } from "uuid";
import { sendEmail } from './utils/notifications.js';
import { parsePaginationParams } from './utils/pagination.js';
import { validateBody } from './middlewares/validateBody.js';
import { loginSchema } from './middlewares/validations.js'; // Ajusta ruta
import usersRouter from "./routes/user.js";
import express from "express";
import articlesRouter from "./routes/articles.js";
import messageRoutes from "./routes/messageRoutes.js";
const app = express();
app.use(express.json());
app.use("/api/messages", messageRoutes);
registerRoutes(app).then(() => {
    app.listen(3000, () => {
        console.log("Servidor corriendo en puerto 3000");
    });
});
app.use("/api/users", usersRouter);
export async function registerRoutes(app) {
    app.use(loggerMiddleware);
    await setupAuth(app);
    const registerSchema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
    });
    // Registro de usuario
    app.post('/api/register', validateBody(registerSchema), async (req, res, next) => {
        try {
            const { name, email, password } = req.body;
            const [firstName, ...lastNameParts] = name.trim().split(" ");
            const lastName = lastNameParts.length > 0 ? lastNameParts.join(" ") : "";
            const existingUser = await storage.getUserByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: 'Usuario ya existe' });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await storage.upsertUser({
                id: uuidv4(),
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role: 'client',
            });
            res.status(201).json({ message: 'Usuario creado', userId: newUser.id });
        }
        catch (error) {
            next(error);
        }
    });
    // Perfil de usuario
    app.get('/api/profile', isAuthenticated, async (req, res, next) => {
        try {
            const authReq = req;
            if (!authReq.user) {
                return res.status(401).json({ message: "No autorizado" });
            }
            res.json({ userId: authReq.user.id });
        }
        catch (error) {
            next(error);
        }
    });
    // Login de usuario
    app.post("/api/auth/login", validateBody(loginSchema), async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const user = await storage.getUserByEmail(email);
            if (!user) {
                return res.status(401).json({ message: "Credenciales inválidas" });
            }
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                return res.status(401).json({ message: "Credenciales inválidas" });
            }
            const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });
            res.json({ token });
        }
        catch (error) {
            next(error);
        }
    });
    // Obtener datos del usuario autenticado
    app.get('/api/auth/user', isAuthenticated, async (req, res, next) => {
        const authReq = req;
        const user = authReq.user;
        if (!user?.id) {
            return res.status(401).json({ message: "No autorizado" });
        }
        try {
            const userData = await storage.getUser(user.id);
            if (!userData) {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }
            const { password, ...safeUserData } = userData;
            res.json(safeUserData);
        }
        catch (error) {
            next(error);
        }
    });
    // Actualizar perfil de usuario
    app.patch('/api/users/profile', isAuthenticated, async (req, res, next) => {
        const authReq = req;
        const user = authReq.user;
        if (!user?.id) {
            return res.status(401).json({ message: "No autorizado" });
        }
        try {
            const updates = req.body;
            const updatedUser = await storage.updateUserProfile(user.id, updates);
            res.json(updatedUser);
        }
        catch (error) {
            next(error);
        }
    });
    // Obtener estadísticas de usuario
    app.get('/api/users/:id/stats', async (req, res, next) => {
        try {
            const { id } = req.params;
            const stats = await storage.getUserStats(id);
            res.json(stats);
        }
        catch (error) {
            next(error);
        }
    });
    // Categorías
    app.get('/api/categories', async (req, res, next) => {
        try {
            const categories = await storage.getCategories();
            res.json(categories);
        }
        catch (error) {
            next(error);
        }
    });
    // Endpoint para obtener tareas por slug de categoría
    app.get('/api/categories/:slug/tasks', async (req, res, next) => {
        try {
            const { slug } = req.params;
            const { page, limit } = req.query;
            const { pageNumber, limitNumber } = parsePaginationParams(page, limit);
            // Buscar la categoría por slug
            const categories = await storage.getCategories();
            const category = categories.find(c => c.slug === slug);
            if (!category) {
                return res.status(404).json({ message: 'Categoría no encontrada' });
            }
            // Obtener tareas de esa categoría
            const tasks = await storage.getTasks({ categoryId: category.id }, pageNumber, limitNumber);
            res.json(tasks);
        }
        catch (error) {
            next(error);
        }
    });
    app.post('/api/categories', isAuthenticated, authorizeRoles('admin'), validateBody(createCategorySchema), async (req, res, next) => {
        const authReq = req;
        try {
            const { name, slug, description, icon, color } = authReq.body;
            const isUnique = await storage.isSlugUnique(slug);
            if (!isUnique) {
                return res.status(400).json({ message: "Slug already exists" });
            }
            const category = await storage.createCategory({ name, slug, description, icon, color });
            res.status(201).json(category);
        }
        catch (error) {
            next(error);
        }
    });
    app.patch('/api/categories/:id', isAuthenticated, authorizeRoles('admin'), validateBody(updateCategorySchema), async (req, res, next) => {
        const authReq = req;
        try {
            const id = parseInt(authReq.params.id);
            const updates = authReq.body;
            if (updates.slug) {
                const isUnique = await storage.isSlugUnique(updates.slug, id);
                if (!isUnique) {
                    return res.status(400).json({ message: "Slug already exists" });
                }
            }
            const updatedCategory = await storage.updateCategory(id, updates);
            res.json(updatedCategory);
        }
        catch (error) {
            next(error);
        }
    });
    app.delete('/api/categories/:id', isAuthenticated, authorizeRoles('admin'), async (req, res, next) => {
        const authReq = req;
        try {
            const id = parseInt(authReq.params.id);
            await storage.deleteCategory(id);
            res.json({ message: "Category deleted" });
        }
        catch (error) {
            next(error);
        }
    });
    // Tareas
    app.get('/api/tasks', async (req, res, next) => {
        try {
            const { page, limit, ...queryFilters } = req.query;
            const { pageNumber, limitNumber } = parsePaginationParams(page, limit);
            // Construir filtros parseados
            const filters = {};
            if (queryFilters.categoryId)
                filters.categoryId = parseInt(queryFilters.categoryId);
            if (queryFilters.categoryName)
                filters.categoryName = queryFilters.categoryName;
            if (queryFilters.location)
                filters.location = queryFilters.location;
            if (queryFilters.status)
                filters.status = queryFilters.status;
            if (queryFilters.clientId)
                filters.clientId = queryFilters.clientId;
            if (queryFilters.taskerId)
                filters.taskerId = queryFilters.taskerId;
            const tasks = await storage.getTasks(filters, pageNumber, limitNumber);
            res.json(tasks);
        }
        catch (error) {
            next(error);
        }
    });
    app.get('/api/tasks/:id', async (req, res, next) => {
        try {
            const id = parseInt(req.params.id);
            const task = await storage.getTaskById(id);
            if (!task) {
                return res.status(404).json({ message: "Task not found" });
            }
            res.json(task);
        }
        catch (error) {
            next(error);
        }
    });
    app.post('/api/tasks', isAuthenticated, authorizeRoles('client'), validateBody(createTaskSchema), async (req, res, next) => {
        const authReq = req;
        const user = authReq.user;
        if (!user?.id) {
            return res.status(401).json({ message: "No autorizado" });
        }
        try {
            const { title, description, categoryId, budget, currency, location, dueDate, priority } = authReq.body;
            const taskData = {
                title,
                description,
                categoryId,
                clientId: user.id, // seguro que es string
                budget,
                currency,
                location,
                status: 'pending',
                priority,
                dueDate,
            };
            const task = await storage.createTask(taskData);
            res.status(201).json(task);
        }
        catch (error) {
            next(error);
        }
    });
    async function canModifyTask(req, res, next) {
        const userId = req.user?.id;
        const userRole = req.user?.role;
        const taskId = parseInt(req.params.id);
        if (!userId)
            return res.status(401).json({ message: 'No autorizado' });
        const task = await storage.getTaskById(taskId);
        if (!task)
            return res.status(404).json({ message: 'Tarea no encontrada' });
        if (userRole === 'admin')
            return next();
        if (task.clientId === userId)
            return next();
        if (task.assignedTaskerId === userId)
            return next();
        return res.status(403).json({ message: 'No tienes permiso para modificar esta tarea' });
    }
    app.patch('/api/tasks/:id', isAuthenticated, canModifyTask, validateBody(updateTaskSchema), async (req, res, next) => {
        try {
            const id = parseInt(req.params.id);
            const updates = req.body;
            const updatedTask = await storage.updateTask(id, updates);
            res.json(updatedTask);
        }
        catch (error) {
            next(error);
        }
    });
    async function canModifyOffer(req, res, next) {
        const userId = req.user?.id;
        const userRole = req.user?.role;
        const offerId = parseInt(req.params.id);
        if (!userId)
            return res.status(401).json({ message: 'No autorizado' });
        const offer = await storage.getOfferById(offerId);
        if (!offer)
            return res.status(404).json({ message: 'Oferta no encontrada' });
        const task = await storage.getTaskById(offer.taskId);
        if (!task)
            return res.status(404).json({ message: 'Tarea no encontrada' });
        if (userRole === 'admin' || (task.clientId === userId && task.status === 'pending'))
            return next();
        return res.status(403).json({ message: 'No tienes permiso para modificar esta oferta' });
    }
    app.post('/api/offers', isAuthenticated, authorizeRoles('tasker'), validateBody(createOfferSchema), async (req, res, next) => {
        const authReq = req;
        const user = authReq.user;
        if (!user?.id) {
            return res.status(401).json({ message: "No autorizado" });
        }
        try {
            const { taskId, amount, currency, message, estimatedDuration } = authReq.body;
            const offerData = {
                taskId,
                taskerId: user.id,
                amount,
                currency,
                message,
                estimatedDuration,
                status: 'pending',
            };
            const offer = await storage.createOffer(offerData);
            res.status(201).json(offer);
        }
        catch (error) {
            next(error);
        }
    });
    app.get('/api/tasks/:id/offers', async (req, res, next) => {
        try {
            const { id } = req.params;
            const { page, limit } = req.query;
            const { pageNumber, limitNumber } = parsePaginationParams(page, limit);
            const offers = await storage.getOffersByTaskId(parseInt(id), pageNumber, limitNumber);
            res.json(offers);
        }
        catch (error) {
            next(error);
        }
    });
    app.get('/api/users/:id/offers', isAuthenticated, async (req, res, next) => {
        const authReq = req;
        try {
            const { id } = authReq.params;
            const { page, limit } = authReq.query;
            const { pageNumber, limitNumber } = parsePaginationParams(page, limit);
            if (authReq.user?.id !== id && authReq.user?.role !== 'admin') {
                return res.status(403).json({ message: 'No autorizado' });
            }
            const offers = await storage.getOffersByTaskerId(id, pageNumber, limitNumber);
            res.json(offers);
        }
        catch (error) {
            next(error);
        }
    });
    app.get('/api/users/:id', async (req, res, next) => {
        try {
            const { id } = req.params;
            const user = await storage.getUser(id); // Asumo que tienes esta función para obtener usuario por id
            if (!user) {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }
            // No enviar datos sensibles como password
            const { password, ...safeUser } = user;
            res.json(safeUser);
        }
        catch (error) {
            next(error);
        }
    });
    app.patch('/api/offers/:id', isAuthenticated, canModifyOffer, async (req, res, next) => {
        const authReq = req;
        const user = authReq.user;
        try {
            const { id } = authReq.params;
            const { status } = authReq.body;
            const validStatuses = ['pending', 'accepted', 'rejected'];
            if (!status || !validStatuses.includes(status)) {
                return res.status(400).json({ message: 'Estado inválido' });
            }
            const updatedOffer = await storage.updateOffer(parseInt(id), { status });
            if (status === 'accepted') {
                const offer = await storage.getOfferById(parseInt(id));
                if (offer) {
                    await storage.updateTask(offer.taskId, { assignedTaskerId: offer.taskerId, status: 'in_progress' });
                    const tasker = await storage.getUser(offer.taskerId);
                    if (tasker && tasker.email) {
                        const taskerName = [tasker.firstName, tasker.lastName].filter(Boolean).join(' ') || 'Usuario';
                        await sendEmail(tasker.email, 'Tu oferta ha sido aceptada', `Hola ${taskerName}, tu oferta para la tarea ha sido aceptada. ¡Felicidades!`);
                    }
                }
            }
            res.json(updatedOffer);
        }
        catch (error) {
            next(error);
        }
    });
    // Reviews
    app.get('/api/users/:id/reviews', async (req, res, next) => {
        try {
            const { id } = req.params;
            const { page, limit } = req.query;
            const { pageNumber, limitNumber } = parsePaginationParams(page, limit);
            const reviews = await storage.getReviewsByTaskerId(id, pageNumber, limitNumber);
            res.json(reviews);
        }
        catch (error) {
            next(error);
        }
    });
    app.post('/api/reviews', isAuthenticated, async (req, res, next) => {
        const authReq = req;
        const user = authReq.user;
        if (!user?.id) {
            return res.status(401).json({ message: "No autorizado" });
        }
        try {
            const reviewData = { ...authReq.body, reviewerId: user.id };
            const review = await storage.createReview(reviewData);
            res.json(review);
        }
        catch (error) {
            next(error);
        }
    });
    // Mensajes
    async function canAccessTaskMessages(req, res, next) {
        const userId = req.user?.id;
        const taskId = parseInt(req.params.id);
        if (!userId)
            return res.status(401).json({ message: "No autorizado" });
        const task = await storage.getTaskById(taskId);
        if (!task)
            return res.status(404).json({ message: "Tarea no encontrada" });
        if (task.clientId === userId || task.assignedTaskerId === userId || req.user?.role === "admin") {
            return next();
        }
        return res.status(403).json({ message: "No tienes permiso para acceder a estos mensajes" });
    }
    app.get('/api/tasks/:id/messages', isAuthenticated, canAccessTaskMessages, async (req, res, next) => {
        const authReq = req;
        try {
            const taskId = parseInt(authReq.params.id);
            const page = Number(authReq.query.page) || 1;
            const limit = Number(authReq.query.limit) || 20;
            const messages = await storage.getMessagesByTaskId(taskId, page, limit);
            res.json(messages);
        }
        catch (error) {
            next(error);
        }
    });
    app.post('/api/messages', isAuthenticated, validateBody(createMessageSchema), async (req, res, next) => {
        const authReq = req;
        const user = authReq.user;
        if (!user?.id) {
            return res.status(401).json({ message: "No autorizado" });
        }
        try {
            const { taskId, content, receiverId } = authReq.body;
            const task = await storage.getTaskById(taskId);
            if (!task)
                return res.status(404).json({ message: "Tarea no encontrada" });
            if (task.clientId !== user.id && task.assignedTaskerId !== user.id && user.role !== "admin") {
                return res.status(403).json({ message: "No tienes permiso para enviar mensajes en esta tarea" });
            }
            if (receiverId !== task.clientId && receiverId !== task.assignedTaskerId) {
                return res.status(400).json({ message: "El receptor no es participante de la tarea" });
            }
            const message = await storage.createMessage({ taskId, senderId: user.id, receiverId, content });
            res.status(201).json(message);
        }
        catch (error) {
            next(error);
        }
    });
    app.patch('/api/messages/:id/read', isAuthenticated, async (req, res, next) => {
        const authReq = req;
        try {
            const messageId = parseInt(authReq.params.id);
            await storage.markMessageAsRead(messageId);
            res.json({ message: 'Mensaje marcado como leído' });
        }
        catch (error) {
            next(error);
        }
    });
    // Notificaciones
    app.get('/api/notifications', isAuthenticated, async (req, res, next) => {
        const authReq = req;
        try {
            const userId = authReq.user?.id;
            if (!userId) {
                return res.status(401).json({ message: "No autorizado" });
            }
            const { page, limit, type, isRead } = authReq.query;
            const { pageNumber, limitNumber } = parsePaginationParams(page, limit);
            const filters = {};
            if (type && typeof type === 'string')
                filters.type = type;
            if (typeof isRead === 'string')
                filters.isRead = isRead === 'true';
            const notifications = await storage.getNotificationsByUserId(userId, pageNumber, limitNumber, filters);
            res.json(notifications);
        }
        catch (error) {
            next(error);
        }
    });
    app.patch('/api/notifications/:id/read', isAuthenticated, async (req, res, next) => {
        const authReq = req;
        try {
            const notificationId = parseInt(authReq.params.id);
            await storage.markNotificationAsRead(notificationId);
            res.json({ message: "Notificación marcada como leída" });
        }
        catch (error) {
            next(error);
        }
    });
    app.patch('/api/notifications/read-all', isAuthenticated, async (req, res, next) => {
        const authReq = req;
        try {
            const userId = authReq.user?.id;
            if (!userId) {
                return res.status(401).json({ message: "No autorizado" });
            }
            await storage.markAllNotificationsAsRead(userId);
            res.json({ message: "Todas las notificaciones marcadas como leídas" });
        }
        catch (error) {
            next(error);
        }
    });
    app.get('/api/notifications/unread-count', isAuthenticated, async (req, res, next) => {
        const authReq = req;
        try {
            const userId = authReq.user?.id;
            if (!userId) {
                return res.status(401).json({ message: "No autorizado" });
            }
            const count = await storage.countUnreadNotifications(userId);
            res.json({ unreadCount: count });
        }
        catch (error) {
            next(error);
        }
    });
    app.post('/api/payments', isAuthenticated, async (req, res, next) => {
        const authReq = req;
        try {
            const userId = authReq.user?.id;
            if (!userId) {
                return res.status(401).json({ message: "No autorizado" });
            }
            const { orderId, amount, currency, method } = authReq.body;
            if (!orderId || !amount || !currency || !method) {
                return res.status(400).json({ message: "Datos incompletos para crear pago" });
            }
            const payment = await storage.createPayment({
                userId,
                orderId,
                amount,
                currency,
                status: 'pending',
                method,
            });
            res.status(201).json(payment);
        }
        catch (error) {
            next(error);
        }
    });
    app.patch('/api/payments/:orderId/status', async (req, res, next) => {
        try {
            const { orderId } = req.params;
            const { status } = req.body;
            if (!status) {
                return res.status(400).json({ message: "Estado es requerido" });
            }
            const updatedPayment = await storage.updatePaymentStatus(orderId, status);
            if (!updatedPayment) {
                return res.status(404).json({ message: "Pago no encontrado" });
            }
            res.json(updatedPayment);
        }
        catch (error) {
            next(error);
        }
    });
    app.get('/api/payments', isAuthenticated, async (req, res, next) => {
        const authReq = req;
        try {
            const userId = authReq.user?.id;
            if (!userId) {
                return res.status(401).json({ message: "No autorizado" });
            }
            const { page, limit } = authReq.query;
            const { pageNumber, limitNumber } = parsePaginationParams(page, limit);
            const payments = await storage.getPaymentsByUser(userId, pageNumber, limitNumber);
            res.json(payments);
        }
        catch (error) {
            next(error);
        }
    });
    // Dashboard
    app.get('/api/dashboard/my-tasks', isAuthenticated, async (req, res, next) => {
        const authReq = req;
        try {
            const userId = authReq.user?.id;
            if (!userId) {
                return res.status(401).json({ message: "No autorizado" });
            }
            const tasksWithOffers = await storage.getTasksWithOffers(userId);
            res.json(tasksWithOffers);
        }
        catch (error) {
            next(error);
        }
    });
    // PayPal
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
    // Debug endpoints - agregar antes de app.use(errorHandler)
    app.get('/api/debug/categories', async (req, res, next) => {
        try {
            const categories = await storage.getCategories();
            res.json({
                count: categories.length,
                categories: categories.map(c => ({ id: c.id, name: c.name, slug: c.slug }))
            });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: 'debug categories failed' });
        }
    });
    // Registrar rutas de artículos bajo /api
    app.use("/api", articlesRouter);
    app.listen(3000, () => {
        console.log("Servidor corriendo en puerto 3000");
    });
    return createServer(app);
    // GET /api/debug/tasks-by-category
    app.get("/api/debug/tasks-by-category", async (req, res) => {
        try {
            const prisma = storage.prisma;
            const rowsRaw = await prisma.$queryRawUnsafe(`
      SELECT c.slug, COUNT(t.id) AS task_count
      FROM categories c
      LEFT JOIN tasks t ON t.category_id = c.id
      GROUP BY c.slug
      ORDER BY c.slug
    `);
            const rows = rowsRaw;
            const normalized = rows.map(r => ({
                slug: r.slug,
                task_count: Number(r.task_count || 0),
            }));
            res.json(normalized);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: "debug tasks-by-category failed" });
        }
    });
}
app.listen(3000, () => {
    console.log("Servidor corriendo en puerto 3000");
});
