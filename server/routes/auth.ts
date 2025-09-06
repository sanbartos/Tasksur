import type { Express, Request, Response, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { validateLogin, createUser as createUserServiceUser } from '../services/userService.js';
import { storage } from '../storage.js';
import type { User } from '../shared/schema.js';
import { isAuthenticated as authMiddleware } from '../middlewares/authMiddleware.js';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_dev_only";
if (process.env.NODE_ENV !== "production" && JWT_SECRET === "fallback_secret_for_dev_only") {
  console.warn("[auth] Usando fallback JWT_SECRET — no seguro para producción.");
}

const COOKIE_NAME = "sesion";

function getTokenFromRequest(req: Request): string | undefined {
  const cookies = (req as any).cookies || {};
  if (cookies[COOKIE_NAME]) return cookies[COOKIE_NAME];
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  return undefined;
}

function generateTokenAndSetCookie(res: Response, user: User) {
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role ?? "client" },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
}

export async function loginHandler(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email y contraseña son requeridos" });
  }

  try {
    const user = await validateLogin(email, password);
    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const token = generateTokenAndSetCookie(res, user);

    return res.json({
      ok: true,
      userId: user.id,
      email: user.email,
      role: user.role ?? "client",
      token,
    });
  } catch (error) {
    console.error("Error en /api/auth/login:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}

export async function registerHandler(req: Request, res: Response) {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: "Faltan datos obligatorios" });
  }

  try {
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email ya registrado" });
    }

    const newUser = await createUserServiceUser({
      id: uuidv4(),
      firstName,
      lastName,
      email,
      password,
      role: "client",
    });

    const token = generateTokenAndSetCookie(res, newUser);

    return res.status(201).json({
      message: "Usuario creado exitosamente",
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      token,
    });
  } catch (error) {
    console.error("Error en registro:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}

export const isAuthenticated: RequestHandler = authMiddleware;

async function getUserProfile(req: Request, res: Response) {
  try {
    const user = req.user as User | undefined;
    const userId = user?.id;
    if (!userId) return res.status(401).json({ message: "No autorizado" });

    const userData = await storage.getUserById(userId);
    if (!userData) return res.status(404).json({ message: "Usuario no encontrado" });

    return res.json({
      id: userData.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      phone: userData.phone,
      location: userData.location,
      bio: userData.bio,
      profileImageUrl: userData.profileImageUrl,
      rating: userData.rating,
      reviewCount: userData.reviewCount,
      skills: userData.skills,
      totalEarnings: userData.totalEarnings,
      totalTasks: userData.totalTasks,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    });
  } catch (error) {
    console.error("Error en /api/auth/user:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}

async function changePasswordHandler(req: Request, res: Response) {
  try {
    const user = req.user as User | undefined;
    const userId = user?.id;
    if (!userId) return res.status(401).json({ message: "No autorizado" });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Contraseña actual y nueva son requeridas" });
    }

    const userData = await storage.getUserById(userId);
    if (!userData) return res.status(404).json({ message: "Usuario no encontrado" });

    const isMatch = await bcrypt.compare(currentPassword, userData.password ?? "");
    if (!isMatch) {
      return res.status(400).json({ message: "Contraseña actual incorrecta" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await storage.updateUserPassword(userId, hashedPassword);

    return res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}

function logoutHandler(_req: Request, res: Response) {
  res.clearCookie(COOKIE_NAME, { path: "/" });
  return res.json({ ok: true });
}

export function registerAuthRoutes(app: Express) {
  app.post("/api/auth/login", loginHandler);
  app.post("/api/login", loginHandler);
  app.post("/api/register", registerHandler);

  app.get("/api/auth/user", isAuthenticated, getUserProfile);

  app.post("/api/auth/change-password", isAuthenticated, changePasswordHandler);

  app.post("/api/auth/logout", logoutHandler);
}