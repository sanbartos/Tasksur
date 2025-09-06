// src/api/apiHooks.ts
import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { Task } from "@/lib/types"; // Importa el tipo correcto
import {
  getUser,
  getTasks,
  getTaskById,
  createTask,
  getTasksByCategory,
  getOffersByTaskId,
  createOffer,
  getMessagesByTaskId,
  sendMessage,
  createPayment,
  getPaymentsByUserId,
} from "./api";

// Usuario
export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: getUser,
  });
}

// Tareas - Transformamos los datos para que coincidan con Task
export function useTasks(page: number, limit: number) {
  return useQuery<Task[], Error>({
    queryKey: ["tasks", page, limit],
    queryFn: async () => {
      const data: any[] = await getTasks(page, limit);
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
        // Añade más campos según lo que devuelva tu backend
      }));
    },
  });
}

// Tarea individual
export function useTask(id: string) {
  return useQuery({
    queryKey: ["task", id],
    queryFn: async () => {
      const task: any = await getTaskById(id);
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
        // Añade más campos según lo que devuelva tu backend
      };
    },
  });
}

export function useCreateTask(): UseMutationResult<any, Error, any> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskData: any) => createTask(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

// Tareas por categoría - Transformamos los datos
export function useTasksByCategory(slug: string, page: number, limit: number) {
  return useQuery<Task[], Error>({
    queryKey: ["tasksByCategory", slug, page, limit],
    queryFn: async () => {
      const data: any[] = await getTasksByCategory(slug, page, limit);
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
        // Añade más campos según lo que devuelva tu backend
      }));
    },
    retry: 0,
    refetchOnWindowFocus: false,
  });
}

// Ofertas
export function useOffersByTaskId(taskId: string) {
  return useQuery({
    queryKey: ["offers", taskId],
    queryFn: () => getOffersByTaskId(taskId),
  });
}

export function useCreateOffer(taskId: string): UseMutationResult<any, Error, any> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (offerData: any) => createOffer(taskId, offerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers", taskId] });
    },
  });
}

// Mensajes
export function useMessagesByTaskId(taskId: string) {
  return useQuery({
    queryKey: ["messages", taskId],
    queryFn: () => getMessagesByTaskId(taskId),
  });
}

export function useSendMessage(taskId: string): UseMutationResult<any, Error, any> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageData: any) => sendMessage(taskId, messageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", taskId] });
    },
  });
}

// Pagos
export function useCreatePayment(): UseMutationResult<any, Error, any> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paymentData: any) => createPayment(paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}

export function usePaymentsByUserId(userId: string) {
  return useQuery({
    queryKey: ["payments", userId],
    queryFn: () => getPaymentsByUserId(userId),
  });
}




