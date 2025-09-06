// src/index.ts
import 'dotenv/config';
import path from "path";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "node:url";
import { createServer } from "http";
// Importaciones corregidas con extensión .js para ESM
import usersRouter from "./routes/user.js";
import articlesRouter from "./routes/articles.js";
import messageRoutes from "./routes/messageRoutes.js";
import { registerRoutes } from "./routes/index.js";
import { storage } from "./storage.js"; // <-- storage real
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// CORS desde env (por defecto frontend local)
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true,
}));
// Servir uploads
app.use('/uploads', express.static('uploads'));
// Logging conciso de /api
const log = console.log;
app.use((req, res, next) => {
    const start = Date.now();
    const pathReq = req.path;
    let capturedJsonResponse = undefined;
    const originalResJson = res.json.bind(res);
    res.json = function (bodyJson) {
        capturedJsonResponse = bodyJson;
        return originalResJson(bodyJson);
    };
    res.on("finish", () => {
        const duration = Date.now() - start;
        if (pathReq.startsWith("/api")) {
            let logLine = `${req.method} ${pathReq} ${res.statusCode} in ${duration}ms`;
            if (capturedJsonResponse) {
                try {
                    const snippet = typeof capturedJsonResponse === "string"
                        ? capturedJsonResponse
                        : JSON.stringify(capturedJsonResponse);
                    logLine += ` :: ${snippet.length > 200 ? snippet.slice(0, 200) + "…" : snippet}`;
                }
                catch { }
            }
            log(logLine);
        }
    });
    next();
});
// Rutas que ya tenías
app.use("/api/messages", messageRoutes);
app.use("/api", articlesRouter);
app.use("/api/users", usersRouter);
// Endpoints reemplazando los temporales — usan storage
app.get('/api/categories', async (_req, res) => {
    try {
        const cats = await storage.getCategories();
        return res.json(cats);
    }
    catch (err) {
        console.error("GET /api/categories error:", err);
        return res.status(500).json({ message: "Error al obtener categorías" });
    }
});
app.get('/api/tasks', async (req, res) => {
    try {
        // Soportar query params básicos: page, limit, status, categoryId, location
        const page = req.query.page ? Number(req.query.page) : 1;
        const limit = req.query.limit ? Number(req.query.limit) : 10;
        const filters = {};
        if (req.query.status)
            filters.status = String(req.query.status);
        if (req.query.categoryId)
            filters.categoryId = Number(req.query.categoryId);
        if (req.query.location)
            filters.location = String(req.query.location);
        if (req.query.clientId)
            filters.clientId = String(req.query.clientId);
        if (req.query.taskerId)
            filters.taskerId = String(req.query.taskerId);
        const tasks = await storage.getTasks(filters, page, limit);
        return res.json(tasks);
    }
    catch (err) {
        console.error("GET /api/tasks error:", err);
        return res.status(500).json({ message: "Error al obtener tareas" });
    }
});
// Registrar rutas dinámicas (auth, tasks, etc.)
async function startApp() {
    await registerRoutes(app);
    // Error handler (después de las rutas)
    app.use((err, _req, res, _next) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        const payload = { message };
        if (process.env.NODE_ENV === "development")
            payload.stack = err.stack;
        res.status(status).json(payload);
    });
}
startApp().then(() => {
    const server = createServer(app);
    const port = parseInt(process.env.PORT || "3000", 10);
    const host = process.env.HOST || "127.0.0.1";
    server.listen(port, host, () => {
        log(`API escuchando en http://${host === "0.0.0.0" ? "localhost" : host}:${port}`);
    });
}).catch(err => {
    console.error("Error al iniciar la aplicación:", err);
});
