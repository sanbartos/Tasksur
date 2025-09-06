// src/components/TaskCard.tsx
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, DollarSign, User as UserIcon } from "lucide-react";
import { Link } from "wouter";
import { Task } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface TaskCardProps {
  task: Task;
  showOfferButton?: boolean;
  showProgress?: boolean;
  onContact?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}

const priorityVariantMap: Record<string, "destructive" | "secondary" | "outline"> = {
  urgent: "destructive",
  high: "secondary",
  normal: "outline",
  low: "outline",
};

const statusVariantMap: Record<string, "default" | "secondary" | "outline"> = {
  open: "default",
  assigned: "secondary",
  in_progress: "outline",
  completed: "outline",
  cancelled: "outline",
};

function formatCurrency(amount?: number | string | null, currency?: string | null) {
  if (amount === undefined || amount === null) return "Consultar";
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(value)) return "Consultar";

  const curr = currency || "UYU";
  try {
    return new Intl.NumberFormat("es-UY", {
      style: "currency",
      currency: curr === "UYU" ? "UYU" : curr,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    const symbol = curr === "UYU" ? "$U" : curr === "ARS" ? "AR$" : curr;
    return `${symbol} ${value.toLocaleString()}`;
  }
}

function formatDate(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function getClientName(task: Task) {
  if (task.client) {
    return `${task.client.firstName ?? ""} ${task.client.lastName ?? ""}`.trim() || "Cliente";
  }
  return "Cliente desconocido";
}

function mapPriorityLabel(priority?: string) {
  switch (priority) {
    case "urgent":
      return "Urgente";
    case "high":
      return "Alta";
    case "low":
      return "Baja";
    default:
      return "Normal";
  }
}

function mapStatusLabel(status?: string) {
  switch (status) {
    case "open":
      return "Abierta";
    case "assigned":
      return "Asignada";
    case "in_progress":
      return "En progreso";
    case "completed":
      return "Completada";
    case "cancelled":
      return "Cancelada";
    default:
      return "Desconocido";
  }
}

export default React.memo(function TaskCard({
  task,
  showOfferButton = true,
  showProgress,
  onContact,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const { toast } = useToast();

  if (!task) return null;

  const clientName = useMemo(() => getClientName(task), [task]);
  const priceLabel = useMemo(() => formatCurrency(task.budget, task.currency), [task.budget, task.currency]);
  const publishedLabel = useMemo(() => (task.createdAt ? `Publicado ${formatDate(task.createdAt)}` : ""), [task.createdAt]);

  const handleDeleteClick = () => {
    if (!onDelete) return;
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar la tarea "${task.title}"? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;
    try {
      onDelete(task);
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la tarea.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card
      className="h-full hover:shadow-md transition-all duration-200 flex flex-col border border-gray-200"
      data-testid={`task-card-${task.id}`}
      role="article"
      aria-labelledby={`task-title-${task.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <CardTitle
            id={`task-title-${task.id}`}
            className="text-lg leading-tight font-semibold text-gray-900 line-clamp-2"
            title={task.title}
          >
            {task.title}
          </CardTitle>

          <div className="flex gap-1 flex-shrink-0">
            <Badge
              variant={priorityVariantMap[String(task.priority ?? "normal")] ?? "outline"}
              className="text-xs font-medium"
              aria-label={`Prioridad: ${task.priority ?? "normal"}`}
            >
              {mapPriorityLabel(task.priority)}
            </Badge>

            <Badge
              variant={statusVariantMap[String(task.status ?? "open")] ?? "outline"}
              className="text-xs font-medium"
              aria-label={`Estado: ${task.status ?? "open"}`}
            >
              {mapStatusLabel(task.status)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 flex-grow">
        <p className="text-gray-600 text-sm line-clamp-3" title={task.description ?? ""}>
          {task.description ?? "Sin descripción"}
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
            <DollarSign className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span>{priceLabel}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span>{task.location ?? "Sin ubicación"}</span>
          </div>

          {/* Cliente con link al perfil si tiene ID */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <UserIcon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            {task.client && task.client.id ? (
              <Link 
                href={`/taskers/${task.client.id}`} 
                className="text-sm text-gray-700 hover:underline truncate"
                aria-label={`Ver perfil de ${clientName}`}
              >
                {clientName}
              </Link>
            ) : (
              <span>{clientName}</span>
            )}
          </div>

          {task.category && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-lg" aria-hidden="true">
                {task.category.icon ?? "🗂️"}
              </span>
              <span>{task.category.name}</span>
            </div>
          )}

          {publishedLabel && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <span>{publishedLabel}</span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Acciones */}
      <div className="pt-4 mb-4 flex flex-col items-center gap-2 px-4">
        <Link href={`/tasks/${task.id}`} className="w-full" aria-label={`Ver detalles de ${task.title}`}>
          <Button
            size="sm"
            variant="default"
            className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Ver Detalles
          </Button>
        </Link>

        {showOfferButton && onContact && (
          <Button
            variant="default"
            className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
            onClick={() => onContact(task)}
            aria-label={`Contactar para la tarea ${task.title}`}
          >
            Contactar / Postular
          </Button>
        )}

        {onEdit && (
          <Button
            variant="outline"
            className="w-full border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-gray-400 transition-all duration-200"
            onClick={() => onEdit(task)}
            aria-label={`Editar tarea ${task.title}`}
          >
            Editar
          </Button>
        )}

        {onDelete && (
          <Button
            variant="destructive"
            className="w-full bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 transition-all duration-200 shadow-sm hover:shadow-md"
            onClick={handleDeleteClick}
            aria-label={`Eliminar tarea ${task.title}`}
          >
            Eliminar
          </Button>
        )}
      </div>
    </Card>
  );
});