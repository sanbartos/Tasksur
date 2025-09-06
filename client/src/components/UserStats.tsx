import React, { useEffect, useState } from "react";

function UserStats({ userId }: { userId: string }) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/users/${userId}/stats`, {
      credentials: "include", // <--- MUY IMPORTANTE para enviar cookies
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(res => {
        if (!res.ok) throw new Error("Error al obtener estadísticas");
        return res.json();
      })
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <p>Cargando estadísticas...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h3>Estadísticas del usuario</h3>
      <p>Total tareas: {stats.totalTasks}</p>
      <p>Tareas completadas: {stats.completedTasks}</p>
      <p>Calificación promedio: {stats.averageRating}</p>
      <p>Reseñas: {stats.reviewCount}</p>
    </div>
  );
}

export default UserStats;




