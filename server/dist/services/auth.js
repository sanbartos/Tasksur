// auth.ts
import bcrypt from "bcrypt";
import { storage } from "../storage.js";
export async function createUser(userData) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
    const user = await storage.upsertUser({
        ...userData,
        password: hashedPassword, // ajusta a tu columna real si se llama distinto
    });
    return user;
}
export async function validateLogin(email, password) {
    // Trae el usuario por email (incluye el campo de password/hash)
    const user = (await storage.getUserByEmail(email));
    if (!user)
        return null;
    // Detecta el campo que realmente guarda el hash en tu DB
    const hash = user.passwordHash ??
        user.hashedPassword ??
        user.password ??
        null;
    if (!hash) {
        // No hay hash en DB → no se puede validar
        return null;
    }
    const ok = await bcrypt.compare(password, String(hash));
    if (!ok)
        return null;
    // Asegura que tenga role (por si viene vacío)
    if (!user.role) {
        user.role = "client"; // o "admin" si prefieres por defecto para este caso
    }
    return user;
}
