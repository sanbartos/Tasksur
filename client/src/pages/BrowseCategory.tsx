import { useParams } from "wouter";
import { useEffect, useState } from "react";

type Task = {
  id: number;
  title: string;
  description: string;
  category: string;
};

export default function BrowseCategory() {
  const { categoryName } = useParams<{ categoryName: string }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!categoryName) return;

    setLoading(true);
    setError(null);

    const fetchTasksByCategory = async (category: string) => {
      try {
        const response = await fetch(`/api/tasks?category=${encodeURIComponent(category)}`);
        if (!response.ok) {
          throw new Error("Error al obtener tareas");
        }
        const data = await response.json();
        setTasks(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasksByCategory(categoryName);
  }, [categoryName]);

  if (!categoryName) {
    return <p>Categoría no especificada.</p>;
  }

  if (loading) {
    return <p>Cargando tareas...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>Error: {error}</p>;
  }

  if (tasks.length === 0) {
    return <p>No hay tareas en esta categoría.</p>;
  }

  return (
    <div style={{ padding: "24px" }}>
      <h1>Tareas en categoría: {categoryName}</h1>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {tasks.map((task) => (
          <li
            key={task.id}
            style={{
              marginBottom: "16px",
              borderBottom: "1px solid #ccc",
              paddingBottom: "12px",
            }}
          >
            <h3 style={{ margin: 0 }}>{task.title}</h3>
            <p style={{ margin: "4px 0" }}>{task.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}




