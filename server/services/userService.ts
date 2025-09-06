import bcrypt from "bcrypt";
import { storage } from "../storage.js";
import type { UpsertUser, User } from "../shared/schema.js";

const SALT_ROUNDS = 10;

type UserWithOptionalHashes = User & {
  passwordHash?: string | null;
  hashedPassword?: string | null;
};

/**
 * Crea o actualiza un usuario con password hasheada.
 * @param userData Datos del usuario incluyendo password en texto plano.
 * @returns Usuario creado o actualizado.
 */
export async function createUser(userData: UpsertUser & { password: string }): Promise<User> {
  const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);

  const user = await storage.upsertUser({
    ...userData,
    password: hashedPassword, // Asegúrate que coincida con el campo en la DB
  } as UpsertUser);

  return user;
}

/**
 * Limpia y adapta un objeto parcial a la interfaz User completa.
 */
function cleanUserPartial(user: Record<string, any>): User {
  return {
    id: user.id ?? '',
    email: user.email ?? null,
    password: user.password ?? '',
    role: user.role ?? 'client',
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
    profileImageUrl: user.profileImageUrl ?? null,
    isTasker: user.isTasker ?? null,
    phone: user.phone ?? null,
    location: user.location ?? null,
    bio: user.bio ?? null,
    skills: user.skills ?? [],
    hourlyRate: user.hourlyRate ?? null,
    totalEarnings: user.totalEarnings ?? null,
    totalTasks: user.totalTasks ?? 0,
    rating: user.rating ?? 0,
    reviewCount: user.reviewCount ?? 0,
    notifications: user.notifications ?? null,
    createdAt: user.createdAt ?? null,
    updatedAt: user.updatedAt ?? null,
  };
}

/**
 * Valida login comparando email y password.
 * @param email Email del usuario.
 * @param password Password en texto plano.
 * @returns Usuario si credenciales válidas, null si no.
 */
export async function validateLogin(email: string, password: string): Promise<User | null> {
  const userRaw = await storage.getUserByEmail(email);
  if (!userRaw) return null;

  // Usamos tipo intermedio para acceder a campos opcionales
  const userWithHashes = userRaw as UserWithOptionalHashes;

  // Detecta el campo que guarda el hash
  const hash = userWithHashes.passwordHash ?? userWithHashes.hashedPassword ?? userWithHashes.password ?? null;
  if (!hash) return null;

  const isValid = await bcrypt.compare(password, String(hash));
  if (!isValid) return null;

  // Limpia y adapta el usuario para que cumpla con User
  const user = cleanUserPartial(userRaw);

  return user;
}