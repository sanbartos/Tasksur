const express = require("express");
const router = express.Router();

// Datos de ejemplo (en producción usa base de datos)
const allTasks = [
  { id: 1, title: "Limpiar casa", description: "Limpieza general", category: "Limpieza" },
  { id: 2, title: "Reparar grifo", description: "Plomería", category: "Plomería" },
  { id: 3, title: "Cortar césped", description: "Jardinería", category: "Jardinería" },
  // más tareas...
];

// Ruta para obtener tareas con filtro por categoría y otros filtros opcionales
router.get("/tasks", (req, res) => {
  const { category, location, status, clientId, taskerId } = req.query;

  let filteredTasks = allTasks;

  if (category) {
    filteredTasks = filteredTasks.filter(
      (task) => task.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Aquí puedes agregar más filtros si tienes esos campos en tus tareas
  // Por ejemplo:
  // if (location) { ... }
  // if (status) { ... }
  // etc.

  res.json({ tasks: filteredTasks });
});

module.exports = router;