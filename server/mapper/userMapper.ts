import type { UserFromDb } from "../types/userFromDb.js";
import type { User } from "../types/user.js";

/**
 * Mapea un usuario tal cual viene de la BD a un User seguro para la API.
 * Normaliza fechas, convierte hourlyRate a string y parsea skills correctamente.
 */
export function mapUserFromDb(user: UserFromDb): User {
  return {
    id: String(user.id),
    role: String(user.role ?? "user"),
    email: user.email ?? null,
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
    profileImageUrl: user.profileImageUrl ?? null,
    createdAt: parseDate(user.createdAt),
    updatedAt: parseDate(user.updatedAt),
    phone: user.phone ?? null,
    isTasker: Boolean(user.isTasker),
    skills: parseSkills(user.skills),
    hourlyRate: parseHourlyRate(user.hourlyRate),
    totalEarnings: user.totalEarnings != null ? String(user.totalEarnings) : null,
    totalTasks: user.totalTasks != null ? Number(user.totalTasks) : null,
    rating: user.rating != null ? String(user.rating) : null,
    reviewCount: user.reviewCount != null ? Number(user.reviewCount) : null,
  };
}

/**
 * Convierte valores que usas en tu API (User) de vuelta a formato DB.
 * Útil para insert/update.
 */
export function mapUserToDb(input: Partial<User>): Partial<UserFromDb> {
  const out: Partial<UserFromDb> = {};
  if (input.email !== undefined) out.email = input.email;
  if (input.firstName !== undefined) out.firstName = input.firstName;
  if (input.lastName !== undefined) out.lastName = input.lastName;
  if (input.profileImageUrl !== undefined) out.profileImageUrl = input.profileImageUrl;
  if (input.phone !== undefined) out.phone = input.phone;
  if (input.isTasker !== undefined) out.isTasker = input.isTasker;
  if (input.skills !== undefined) out.skills = JSON.stringify(input.skills);
  if (input.hourlyRate !== undefined) out.hourlyRate = input.hourlyRate == null ? null : String(input.hourlyRate);
  if (input.totalEarnings !== undefined) out.totalEarnings = input.totalEarnings == null ? null : String(input.totalEarnings);
  if (input.totalTasks !== undefined) out.totalTasks = input.totalTasks == null ? null : input.totalTasks;
  if (input.rating !== undefined) out.rating = input.rating == null ? null : String(input.rating);
  if (input.reviewCount !== undefined) out.reviewCount = input.reviewCount == null ? null : input.reviewCount;
  return out;
}

/* ---------- helpers ---------- */

function parseDate(val?: string | Date | null): Date | null {
  if (!val) return null;
  if (val instanceof Date) return isValidDate(val) ? val : null;
  const d = new Date(val);
  return isValidDate(d) ? d : null;
}
function isValidDate(d: Date) {
  return d instanceof Date && !isNaN(d.getTime());
}

function parseSkills(skills?: string | string[] | null): string[] {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills.map(String).map(s => s.trim()).filter(Boolean);

  // skills es string: probamos JSON.parse, si falla, lo interpretamos como CSV
  try {
    const parsed = JSON.parse(skills);
    if (Array.isArray(parsed)) return parsed.map(String).map(s => s.trim()).filter(Boolean);
  } catch (e) {
    // no JSON
  }

  // Split por comas (por si viene "js, node, react")
  return String(skills).split(",").map(s => s.trim()).filter(Boolean);
}

function parseHourlyRate(val?: string | number | null): string | null {
  if (val == null) return null;
  if (typeof val === "number") return val.toString();

  // Limpiar símbolos de moneda y separar miles/decimales (intento robusto)
  let cleaned = String(val).trim();
  // eliminar cualquier caracter que no sea dígito, coma, punto o signo menos
  cleaned = cleaned.replace(/[^\d,.\-]/g, "");
  // si hay más de un punto o coma, asumimos que los puntos son miles y la coma decimal (ej: "1.234,56")
  const commaCount = (cleaned.match(/,/g) || []).length;
  const dotCount = (cleaned.match(/\./g) || []).length;

  if (commaCount > 0 && dotCount > 0) {
    // ejemplo "1.234,56" => "1234.56"
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (commaCount > 0 && dotCount === 0) {
    // "1234,56" -> "1234.56"
    cleaned = cleaned.replace(",", ".");
  } else {
    // "1,234" or "1234.56" -> quitar comas de miles y mantener punto decimal si existe
    cleaned = cleaned.replace(/,/g, "");
  }

  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n.toString() : null;
}