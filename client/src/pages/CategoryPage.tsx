import { useMemo, useState } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import TaskCard from "@/components/task-card";
import Modal from "@/components/Modal";
import { Task } from "@/lib/types";

type Category = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  priceRange?: string;
};

export default function CategoryPage() {
  // Leemos el slug desde la ruta canónica: /categories/:slug
  const [, params] = useRoute("/categories/:slug");
  const slug = params?.slug ?? "";

  // Cargar la categoría por slug usando ?slug= y filtrando el array
  const {
    data: category,
    isLoading: loadingCategory,
    error: errorCategory,
  } = useQuery<Category | undefined>({
    queryKey: ["categoryBySlug", slug],
    queryFn: async () => {
      if (!slug) throw new Error("Slug requerido");
      const res = await fetch(`/api/categories?slug=${encodeURIComponent(slug)}`);
      if (!res.ok) throw new Error("Error al cargar categoría");
      const arr = await res.json(); // el backend retorna un array
      if (Array.isArray(arr)) {
        return arr.find((c: Category) => c.slug === slug);
      }
      // Si por alguna razón no devuelve array, intenta fallback
      return arr && arr.slug === slug ? arr : undefined;
    },
    enabled: !!slug,
  });

  // Determinar clave para pedir tareas: usamos SIEMPRE el id
  const tasksKey = useMemo(() => {
    return category?.id ? String(category.id) : "";
  }, [category?.id]);

  // Obtener tareas de la categoría por id

const {
  data: tasks = [],
  isLoading: loadingTasks,
  error: errorTasks,
} = useQuery<Task[]>({
  queryKey: ["categoryTasks", tasksKey],
  queryFn: async () => {
    if (!tasksKey) return [];

    // Endpoints posibles (prueba en este orden)
    const candidates = [
      `/api/tasks?categoryId=${encodeURIComponent(tasksKey)}`,   // variante camelCase
      `/api/tasks?category_id=${encodeURIComponent(tasksKey)}`,  // variante snake_case
      `/api/tasks?category=${encodeURIComponent(tasksKey)}`,     // variante simple
    ];

    let lastErrorText = "";

    for (const url of candidates) {
      try {
        const res = await fetch(url);

        // Sin contenido o no encontrado => lista vacía (no es error)
        if (res.status === 204 || res.status === 404) {
          return [];
        }

        // Si el endpoint no existe o el parámetro no es aceptado (400), probamos el siguiente
        if (res.status === 400) {
          continue;
        }

        if (res.ok) {
          const data = await res.json().catch(() => []);
          return Array.isArray(data) ? data : [];
        }

        // Guarda texto de error por si todos fallan
        const txt = await res.text().catch(() => "");
        lastErrorText = txt || `HTTP ${res.status} en ${url}`;
        // Si es 500/403/401, intentamos el siguiente por si otro endpoint funciona
        continue;
      } catch (e: any) {
        lastErrorText = e?.message || "Fallo de red";
        continue;
      }
    }

    // Si llegamos aquí, ninguno funcionó y no es caso “sin tareas”
    throw new Error(lastErrorText || "Error al cargar tareas");
  },
  enabled: !!tasksKey,
});

  // Estados para filtros
  const [minBudget, setMinBudget] = useState<number | "">("");
  const [maxBudget, setMaxBudget] = useState<number | "">("");
  const [locationFilter, setLocationFilter] = useState<string>("");

  // Filtrar tareas según filtros
  const filteredTasks = tasks.filter((task) => {
    const budget =
      task.budget !== undefined
        ? typeof task.budget === "string"
          ? parseFloat(task.budget)
          : task.budget
        : 0;
    if (minBudget !== "" && budget < minBudget) return false;
    if (
      locationFilter &&
      (!task.location ||
        !task.location.toLowerCase().includes(locationFilter.toLowerCase()))
    )
      return false;
    return true;
  });

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 6;

  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * tasksPerPage,
    currentPage * tasksPerPage
  );

  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

  // Estados para modal de contacto
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [message, setMessage] = useState("");

  const openModal = (task: Task) => {
    setSelectedTask(task);
    setMessage("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleSendMessage = () => {
    alert(`Mensaje enviado para la tarea "${selectedTask?.title}":\n${message}`);
    closeModal();
  };

  if (loadingCategory || loadingTasks) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-white text-gray-900 min-h-screen">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-lg text-gray-600">Cargando...</div>
        </div>
      </div>
    );
  }

  if (errorCategory || errorTasks) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-white text-gray-900 min-h-screen">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-lg text-red-600">Error al cargar datos.</div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-white text-gray-900 min-h-screen">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-lg text-gray-600">Categoría no encontrada.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 text-gray-900 min-h-screen">
      {/* Detalles categoría */}
      <div className="flex items-center mb-8">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mr-6"
          style={{ backgroundColor: category.color || "#e5e7eb" }}
        >
          {category.icon ? (
            <img
              src={category.icon}
              alt={category.name}
              className="w-12 h-12 object-contain"
            />
          ) : (
            <div className="text-2xl">ðŸ“‹</div>
          )}
        </div>
        <div>
          <h1 className="text-4xl font-bold">{category.name}</h1>
          <p className="text-tasksur-neutral mt-2 max-w-xl">
            {category.description || "Explora tareas disponibles en esta categoría."}
          </p>
          {category.priceRange && (
            <p className="text-sm text-tasksur-secondary mt-1">
              {category.priceRange}
            </p>
          )}
        </div>
      </div>

      {/* Contador de tareas */}
      <div className="mb-6">
        <p className="text-gray-600">
          {filteredTasks.length === 0
            ? "No hay tareas disponibles"
            : `${filteredTasks.length} tarea${
                filteredTasks.length !== 1 ? "s" : ""
              } disponible${filteredTasks.length !== 1 ? "s" : ""}`}
          {filteredTasks.length !== tasks.length && ` (${tasks.length} total)`}
        </p>
      </div>

      {/* Filtros */}
      <div className="mb-8 flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-sm font-medium text-tasksur-dark">
            Presupuesto mínimo
          </label>
          <input
            type="number"
            value={minBudget}
            onChange={(e) =>
              setMinBudget(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="mt-1 p-2 border rounded w-32"
            placeholder="Ej: 10"
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-tasksur-dark">
            Presupuesto máximo
          </label>
          <input
            type="number"
            value={maxBudget}
            onChange={(e) =>
              setMaxBudget(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="mt-1 p-2 border rounded w-32"
            placeholder="Ej: 100"
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-tasksur-dark">
            Ubicación
          </label>
          <input
            type="text"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="mt-1 p-2 border rounded w-48"
            placeholder="Ej: Montevideo"
          />
        </div>
        {(minBudget !== "" || maxBudget !== "" || locationFilter !== "") && (
          <div className="flex items-end">
            <button
              onClick={() => {
                setMinBudget("");
                setMaxBudget("");
                setLocationFilter("");
                setCurrentPage(1);
              }}
              className="mt-6 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded border"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Lista de tareas */}
      {paginatedTasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">ðŸ”</div>
          <p className="text-lg text-gray-600 mb-2">
            {tasks.length === 0
              ? "No hay tareas en esta categoría todavía."
              : "No hay tareas que coincidan con los filtros."}
          </p>
          {tasks.length > 0 && filteredTasks.length === 0 && (
            <button
              onClick={() => {
                setMinBudget("");
                setMaxBudget("");
                setLocationFilter("");
                setCurrentPage(1);
              }}
              className="mt-4 px-4 py-2 bg-tasksur-primary text-white rounded hover:bg-tasksur-primary-dark"
            >
              Ver todas las tareas
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedTasks.map((task) => (
            <TaskCard key={task.id} task={task} onContact={openModal} />
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Anterior
          </button>
          <span className="px-4 py-2 bg-gray-100 rounded">
            Página {currentPage} de {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Modal de contacto */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={`Contactar para: ${selectedTask?.title}`}
      >
        <textarea
          className="w-full border rounded p-2"
          rows={5}
          placeholder="Escribe tu mensaje aquí..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          onClick={handleSendMessage}
          className="mt-4 bg-tasksur-primary text-white px-4 py-2 rounded hover:bg-tasksur-primary-dark"
          disabled={message.trim() === ""}
        >
          Enviar Mensaje
        </button>
      </Modal>
    </div>
  );
}




