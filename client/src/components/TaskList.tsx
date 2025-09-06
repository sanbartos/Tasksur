// src/components/TaskList.tsx
import React, { useState, useMemo } from "react";
import { useTasks } from "@/api/apiHooks";
import TaskCard from "@/components/task-card";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { AlertCircle, Loader2 } from "lucide-react";
import { Task } from "@/lib/types";

export default function TaskList() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Pagination state
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  // Fetch tasks (hook expected to accept page & limit)
  const { data, isLoading, error, isFetching } = useTasks(page, pageSize);
  // `data` is expected to be Task[] for this component (adjust if your hook returns { tasks, total }).

  // derived values
  const tasks: Task[] = Array.isArray(data) ? data : [];
  const isEmpty = tasks.length === 0;

  // Optimistic delete mutation
  const deleteTaskMutation = useMutation<number, Error, number>({
    mutationFn: async (taskId: number) => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "Error deleting");
        throw new Error(text || "Error al eliminar la tarea");
      }
      return taskId;
    },
    onMutate: async (taskIdToDelete: number) => {
      await queryClient.cancelQueries({ queryKey: ["tasks", page] });

      const previous = queryClient.getQueryData<Task[]>(["tasks", page]);

      // Optimistically remove the task from the cached page
      queryClient.setQueryData<Task[] | undefined>(["tasks", page], (old) =>
        old ? old.filter((t) => t.id !== taskIdToDelete) : old
      );

      return { previous };
    },
    onError: (err, taskId, context: any) => {
      // rollback
      if (context?.previous) {
        queryClient.setQueryData(["tasks", page], context.previous);
      }
      toast({
        title: "No se pudo eliminar",
        description: err?.message ?? "Error desconocido",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Tarea eliminada",
        description: "La tarea se eliminó correctamente.",
      });
    },
    onSettled: () => {
      // Refresh current page and related lists
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const handleEdit = (task: Task) => {
    setLocation(`/tasks/edit/${task.id}`);
  };

  const handleDelete = (task: Task) => {
    if (deleteTaskMutation.isLoading) return;

    const confirmed = window.confirm(
      `¿Estás seguro de eliminar la tarea "${task.title}"? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    deleteTaskMutation.mutate(task.id);
  };

  const handleCreate = () => setLocation("/tasks/new");

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // UI states
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Cargando tareas...</p>
      </div>
    );
  }

  if (error instanceof Error) {
    return (
      <div className="p-4">
        <Alert variant="destructive" className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5" />
          <div>
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>No se pudieron cargar las tareas: {error.message}</AlertDescription>
          </div>
        </Alert>

        <div className="mt-4 text-center">
          <Button onClick={() => window.location.reload()} variant="outline">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <Card className="max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="text-center">No hay tareas disponibles</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-4">Aún no tienes tareas creadas o asignadas.</p>
          <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
            Crear nueva tarea
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Pagination display: simple (shows current page only). Adjust if backend returns total count.
  const paginationControls = useMemo(() => {
    return (
      <div className="mt-8 flex justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(page - 1)}
                className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>

            <PaginationItem>
              <PaginationLink isActive>{page}</PaginationLink>
            </PaginationItem>

            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(page + 1)}
                className={tasks.length < pageSize ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  }, [page, tasks.length, pageSize]);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mis Tareas</h2>
          <p className="text-gray-600">Gestiona tus tareas publicadas y asignadas</p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
            Crear tarea
          </Button>
        </div>
      </div>

      {isFetching && (
        <div className="flex items-center gap-2 mb-4 text-sm text-blue-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Actualizando...</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={handleEdit}
            onDelete={handleDelete}
            showOfferButton={false}
          />
        ))}
      </div>

      {paginationControls}

      <div className="mt-4 text-center text-sm text-gray-500">
        Página {page} • {tasks.length} tareas mostradas
      </div>
    </div>
  );
}