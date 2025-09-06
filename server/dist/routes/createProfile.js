import { Router } from "express";
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
const router = Router();
const CREATE_PROFILE_SECRET_HEADER = "x-create-profile-secret";
const SHARED_SECRET = process.env.CREATE_PROFILE_SECRET;
router.post("/create-profile", async (req, res) => {
    try {
        if (SHARED_SECRET) {
            const headerSecret = req.headers[CREATE_PROFILE_SECRET_HEADER];
            if (!headerSecret || headerSecret !== SHARED_SECRET) {
                console.warn("Intento de creación de perfil no autorizado: Secreto incorrecto o ausente.");
                return res.status(401).json({ error: "Unauthorized: Invalid or missing secret." });
            }
        }
        const payload = req.body;
        if (!payload || typeof payload.id !== 'string' || payload.id.trim() === '') {
            console.warn("Intento de creación de perfil con payload inválido: ID faltante o incorrecto.");
            return res.status(400).json({ error: "Bad Request: 'id' is required and must be a non-empty string." });
        }
        if (typeof payload.email !== 'string' || !payload.email.includes('@')) {
            console.warn(`Intento de creación de perfil con email inválido para ID: ${payload.id}`);
            return res.status(400).json({ error: "Bad Request: 'email' is required and must be a valid email format." });
        }
        // Inserción en Supabase
        const { error } = await supabaseAdmin.from("users").insert([payload]);
        if (error) {
            console.error(`Error al crear perfil para ID ${payload.id} en Supabase:`, error);
            if (error.code === '23505') {
                return res.status(409).json({ error: `Conflict: User with ID ${payload.id} already exists.` });
            }
            return res.status(500).json({ error: `Failed to create profile: ${error.message}` });
        }
        console.log(`Perfil creado exitosamente para ID: ${payload.id}`);
        return res.status(201).json({ success: true, message: "Profile created successfully." });
    }
    catch (err) {
        console.error("Error interno en la ruta /create-profile:", err);
        return res.status(500).json({ error: "Internal Server Error: An unexpected error occurred." });
    }
});
export default router;
