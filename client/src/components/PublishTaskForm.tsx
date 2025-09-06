// src/components/PublishTaskForm.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Task, Category } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

// Función para obtener categorías desde el backend
async function fetchCategories(): Promise<Category[]> {
  const res = await fetch("/api/categories");
  if (!res.ok) throw new Error("Error al cargar las categorías");
  return res.json();
}

interface PublishTaskFormProps {
  onSubmit: (task: Omit<Task, "id" | "createdAt" | "updatedAt" | "clientId" | "client">) => void;
  initialData?: Partial<Task>;
  isEditing?: boolean;
}

export default function PublishTaskForm({
  onSubmit,
  initialData = {},
  isEditing = false,
}: PublishTaskFormProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState(initialData.title || "");
  const [description, setDescription] = useState(initialData.description || "");
  const [categoryId, setCategoryId] = useState<string>(initialData.category?.id?.toString() || "");
  const [budget, setBudget] = useState<string>(initialData.budget?.toString() || "");
  const [currency, setCurrency] = useState(initialData.currency || "UYU");
  const [location, setLocation] = useState(initialData.location || "");
  const [priority, setPriority] = useState(initialData.priority || "normal");
  const [isLoading, setIsLoading] = useState(false);

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validaciones básicas
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "El título es obligatorio",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!categoryId) {
      toast({
        title: "Error",
        description: "Selecciona una categoría",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const budgetNum = budget ? parseFloat(budget) : undefined;
    if (budget && (isNaN(budgetNum!) || budgetNum! <= 0)) {
      toast({
        title: "Error",
        description: "Ingresa un presupuesto válido",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        categoryId: parseInt(categoryId),
        budget: budgetNum,
        currency,
        location: location.trim(),
        priority,
        status: "open",
      };

      onSubmit(taskData);
    } catch (err) {
      toast({
        title: "Error",
        description: "Ocurrió un error al publicar la tarea",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {isEditing ? "Editar Tarea" : "Publicar Nueva Tarea"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="¿Qué necesitas hacer?"
              required
              aria-required="true"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe en detalle lo que necesitas..."
              rows={4}
            />
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoría *</Label>
            <Select value={categoryId} onValueChange={setCategoryId} required>
              <SelectTrigger id="category" aria-required="true">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categoriesLoading ? (
                  <SelectItem value="loading" disabled>
                    Cargando categorías...
                  </SelectItem>
                ) : categoriesError ? (
                  <SelectItem value="error" disabled>
                    Error al cargar
                  </SelectItem>
                ) : (
                  categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.icon ? (
                        <span className="flex items-center">
                          <span className="mr-2 text-lg">{cat.icon}</span>
                          {cat.name}
                        </span>
                      ) : (
                        cat.name
                      )}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Presupuesto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Presupuesto (opcional)</Label>
              <Input
                id="budget"
                type="number"
                min="0"
                step="100"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Ej: 2500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UYU">Pesos Uruguayos (UYU)</SelectItem>
                  <SelectItem value="ARS">Pesos Argentinos (ARS)</SelectItem>
                  <SelectItem value="USD">Dólares (USD)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ubicación */}
          <div className="space-y-2">
            <Label htmlFor="location">Ubicación</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ej: Montevideo, Ciudad Vieja"
            />
          </div>

          {/* Prioridad */}
          <div className="space-y-2">
            <Label htmlFor="priority">Prioridad</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baja</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botón de submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || categoriesLoading}
          >
            {isLoading ? "Publicando..." : isEditing ? "Actualizar Tarea" : "Publicar Tarea"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}