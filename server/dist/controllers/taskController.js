import { TaskService } from "../services/taskService.js";
export class TaskController {
    static async listTasks(req, res) {
        try {
            const filter = req.query;
            const tasks = await TaskService.listTasks(filter);
            res.json(tasks);
        }
        catch (error) {
            console.error("Error listando tareas:", error);
            res.status(500).json({ message: "Error interno del servidor" });
        }
    }
    static async getTaskById(req, res) {
        try {
            const taskId = Number(req.params.id);
            if (isNaN(taskId)) {
                return res.status(400).json({ message: "ID de tarea inválido" });
            }
            const task = await TaskService.getTaskById(taskId);
            if (!task) {
                return res.status(404).json({ message: "Tarea no encontrada" });
            }
            res.json(task);
        }
        catch (error) {
            console.error("Error obteniendo tarea:", error);
            res.status(500).json({ message: "Error interno del servidor" });
        }
    }
    static async createTask(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId)
                return res.status(401).json({ message: "No autorizado" });
            const taskData = {
                ...req.body,
                clientId: userId,
            };
            // Aquí puedes agregar validaciones adicionales
            const task = await TaskService.createTask(taskData);
            res.status(201).json(task);
        }
        catch (error) {
            console.error("Error creando tarea:", error);
            res.status(500).json({ message: "Error interno del servidor" });
        }
    }
    static async updateTask(req, res) {
        try {
            const taskId = Number(req.params.id);
            if (isNaN(taskId)) {
                return res.status(400).json({ message: "ID de tarea inválido" });
            }
            const updates = req.body;
            const updatedTask = await TaskService.updateTask(taskId, updates);
            if (!updatedTask) {
                return res.status(404).json({ message: "Tarea no encontrada" });
            }
            res.json(updatedTask);
        }
        catch (error) {
            console.error("Error actualizando tarea:", error);
            res.status(500).json({ message: "Error interno del servidor" });
        }
    }
    static async deleteTask(req, res) {
        try {
            const taskId = Number(req.params.id);
            if (isNaN(taskId)) {
                return res.status(400).json({ message: "ID de tarea inválido" });
            }
            const deleted = await TaskService.deleteTask(taskId);
            if (!deleted) {
                return res.status(404).json({ message: "Tarea no encontrada" });
            }
            res.json({ message: "Tarea eliminada correctamente" });
        }
        catch (error) {
            console.error("Error eliminando tarea:", error);
            res.status(500).json({ message: "Error interno del servidor" });
        }
    }
}
