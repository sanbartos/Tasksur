// services/task.service.ts

import { supabase } from "@/lib/supabaseClient"
import type { Task } from "@shared/types"

export async function fetchTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw new Error("Error al obtener tareas: " + error.message)
  return data || []
}

export async function createTask(task: Partial<Task>): Promise<Task> {
  const { data, error } = await supabase
    .from("tasks")
    .insert(task)
    .select()
    .single()

  if (error) throw new Error("Error al crear tarea: " + error.message)
  return data
}

export async function getTaskById(id: string): Promise<Task | null> {
  const { data, error } = await supabase
    .from("tasks")
    .select
