// src/api/api.ts
import { Task as LibTask } from "@/lib/types"; // Importa el tipo correcto con alias

function joinURL(base: string, path: string) {
  if (/^https?:\/\//i.test(path)) return path; // ya es absoluta
  const slashBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const slashPath = path.startsWith("/") ? path : `/${path}`;
  return `${slashBase}${slashPath}`;
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  // Base de API por entorno:
  // - En dev: /api (usa proxy de Vite)
  // - En prod: https://tu-backend.com/api (llama directo a tu backend)
  const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

  const token =
    localStorage.getItem("accessToken") || localStorage.getItem("token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const url = joinURL(API_BASE, path);

  const res = await fetch(url, {
    method: options.method || "GET",
    body: options.body,
    headers,
    credentials: "include", // envía cookies de sesión
  });

  if (!res.ok) {
    let errorMessage = "Error en la petición";
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // ignore JSON parse error
    }
    throw new Error(`${res.status} ${errorMessage}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// Usuarios
export function getUser() {
  return apiFetch("/auth/user");
}

// Tareas - Transformamos los datos para que coincidan con LibTask
export async function getTasks(page = 1, limit = 10): Promise<LibTask[]> {
  const data: any[] = await apiFetch(`/tasks?page=${page}&limit=${limit}`);
  
  // Transformar datos si es necesario
  return data.map((task: any) => ({
    id: task.id,
    clientId: task.client_id || task.clientId || "", // Ajusta según tu backend
    title: task.title,
    description: task.description,
    budget: task.budget,
    currency: task.currency,
    location: task.location,
    priority: task.priority,
    status: task.status,
    createdAt: task.created_at || task.createdAt,
    dueDate: task.due_date || task.dueDate,
    categoryId: task.category_id || task.categoryId,
    // Añade aquí el resto de propiedades según lo que devuelva tu backend
  }));
}

export async function getTaskById(id: string): Promise<LibTask> {
  const task: any = await apiFetch(`/tasks/${id}`);
  
  // Transformar datos si es necesario
  return {
    id: task.id,
    clientId: task.client_id || task.clientId || "",
    title: task.title,
    description: task.description,
    budget: task.budget,
    currency: task.currency,
    location: task.location,
    priority: task.priority,
    status: task.status,
    createdAt: task.created_at || task.createdAt,
    dueDate: task.due_date || task.dueDate,
    categoryId: task.category_id || task.categoryId,
    // Añade aquí el resto de propiedades según lo que devuelva tu backend
  };
}

export function createTask(taskData: any) {
  return apiFetch("/tasks", {
    method: "POST",
    body: JSON.stringify(taskData),
  });
}

// Tareas por categoría
export async function getTasksByCategory(slug: string, page = 1, limit = 10): Promise<LibTask[]> {
  const data: any[] = await apiFetch(`/tasks?category=${slug}&page=${page}&limit=${limit}`);
  
  // Transformar datos si es necesario
  return data.map((task: any) => ({
    id: task.id,
    clientId: task.client_id || task.clientId || "",
    title: task.title,
    description: task.description,
    budget: task.budget,
    currency: task.currency,
    location: task.location,
    priority: task.priority,
    status: task.status,
    createdAt: task.created_at || task.createdAt,
    dueDate: task.due_date || task.dueDate,
    categoryId: task.category_id || task.categoryId,
    // Añade aquí el resto de propiedades según lo que devuelva tu backend
  }));
}

// Ofertas
export function getOffersByTaskId(taskId: string) {
  return apiFetch(`/tasks/${taskId}/offers`);
}

export function createOffer(taskId: string, offerData: any) {
  return apiFetch(`/tasks/${taskId}/offers`, {
    method: "POST",
    body: JSON.stringify(offerData),
  });
}

// Mensajes
export function getMessagesByTaskId(taskId: string) {
  return apiFetch(`/tasks/${taskId}/messages`);
}

export function sendMessage(taskId: string, messageData: any) {
  return apiFetch(`/tasks/${taskId}/messages`, {
    method: "POST",
    body: JSON.stringify(messageData),
  });
}

// Pagos
export function createPayment(paymentData: any) {
  return apiFetch("/payments", {
    method: "POST",
    body: JSON.stringify(paymentData),
  });
}

export function getPaymentsByUserId(userId: string) {
  return apiFetch(`/users/${userId}/payments`);
}




