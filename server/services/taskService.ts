// src/services/taskService.ts
import type { Task, InsertTask } from "../shared/schema.js";
import { storage } from "../storage.js";

type TaskFilter = {
  categoryId?: number;
  status?: string;
  clientId?: string;
  taskerId?: string;
  // Agrega más filtros según necesites
};

export class TaskService {
  /**
   * Crea una nueva tarea.
   * @param taskData Datos para crear la tarea.
   * @returns La tarea creada.
   * @throws Error si la creación falla.
   */
  static async createTask(taskData: InsertTask): Promise<Task> {
    try {
      return await storage.createTask(taskData);
    } catch (error) {
      throw new Error(`Error creando tarea: ${(error as Error).message}`);
    }
  }

  /**
   * Actualiza una tarea existente.
   * @param taskId ID de la tarea a actualizar.
   * @param updates Campos a actualizar.
   * @returns La tarea actualizada o null si no existe.
   * @throws Error si la actualización falla.
   */
  static async updateTask(taskId: number, updates: Partial<InsertTask>): Promise<Task | null> {
    const existingTask = await storage.getTaskById(taskId);
    if (!existingTask) {
      return null;
    }

    try {
      return await storage.updateTask(taskId, updates);
    } catch (error) {
      throw new Error(`Error actualizando tarea: ${(error as Error).message}`);
    }
  }

  /**
   * Obtiene una tarea por su ID.
   * @param taskId ID de la tarea.
   * @returns La tarea encontrada o null si no existe.
   */
  static async getTaskById(taskId: number): Promise<Task | null> {
    const task = await storage.getTaskById(taskId);
    return task ?? null;
  }

  /**
   * Lista tareas con filtros opcionales.
   * @param filter Filtros para la búsqueda.
   * @returns Lista de tareas que cumplen el filtro.
   */
  static async listTasks(filter?: TaskFilter): Promise<Task[]> {
    return storage.getTasks(filter);
  }

  /**
   * Elimina una tarea por su ID.
   * @param taskId ID de la tarea.
   * @returns true si se eliminó, false si no se encontró.
   * @throws Error si ocurre otro error.
   */
  static async deleteTask(taskId: number): Promise<boolean> {
    try {
      const deleted = await storage.deleteTaskById(taskId);
      return deleted;
    } catch (error) {
      throw new Error(`Error eliminando tarea: ${(error as Error).message}`);
    }
  }

  /**
   * Asigna un tasker a una tarea y cambia su estado a "assigned".
   * @param taskId ID de la tarea.
   * @param taskerId ID del tasker.
   * @returns La tarea actualizada.
   * @throws Error si la tarea no existe o la actualización falla.
   */
  static async assignTasker(taskId: number, taskerId: string): Promise<Task> {
    const task = await storage.getTaskById(taskId);
    if (!task) {
      throw new Error(`Tarea con id ${taskId} no encontrada`);
    }

    try {
      return await storage.updateTask(taskId, { assignedTaskerId: taskerId, status: "assigned" });
    } catch (error) {
      throw new Error(`Error asignando tasker: ${(error as Error).message}`);
    }
  }
}