// src/hooks/useTasksWithOffers.ts
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

export type TaskWithOffers = {
  id: string;
  client_id: string;
  title: string;
  description: string;
  category_id: string;
  budget: number;
  location: string;
  status: string;
  created_at: string;
  offer_count: number;
};

export function useTasksWithOffers() {
  const [tasks, setTasks] = useState<TaskWithOffers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from("vw_tasks_with_offers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      setTasks((data as TaskWithOffers[]) || []);
    } catch (err: any) {
      setError(err.message || "Error al cargar las tareas");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const refresh = useCallback(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, loading, error, refresh };
}




