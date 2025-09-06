import { isAuthenticated } from "../middlewares/authMiddleware.js";
export function registerExampleRoutes(app) {
    app.get("/api/some-route", isAuthenticated, (req, res) => {
        const user = req.user;
        console.log("ID del usuario autenticado:", user?.id);
        res.json({ message: "Ruta protegida accesible", userId: user?.id });
    });
}
