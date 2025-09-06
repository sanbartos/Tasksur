import express, { Request, Response } from "express";
import { Pool } from "pg";
import { isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

const TABLE_NAME = "articles";

const pool = new Pool({
  user: process.env.PG_USER || "tu_usuario",
  host: process.env.PG_HOST || "localhost",
  database: process.env.PG_DATABASE || "tu_base_de_datos",
  password: process.env.PG_PASSWORD || "tu_contraseña",
  port: Number(process.env.PG_PORT) || 5432,
});

// Obtener todos los artículos (público)
router.get("/articles", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM ${TABLE_NAME} ORDER BY date DESC`);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener artículos:", error);
    res.status(500).json({ error: "Error interno al obtener artículos" });
  }
});

// Obtener artículo por slug (público)
router.get("/articles/:slug", async (req: Request, res: Response) => {
  const { slug } = req.params;
  try {
    const result = await pool.query(`SELECT * FROM ${TABLE_NAME} WHERE href = $1`, [slug]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Artículo no encontrado" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener artículo:", error);
    res.status(500).json({ error: "Error interno al obtener artículo" });
  }
});

// Crear un artículo (solo admin)
router.post("/articles", isAdmin, async (req: Request, res: Response) => {
  const { title, excerpt, tag, date, image, href } = req.body;

  if (!title || !excerpt || !tag || !date || !href) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO ${TABLE_NAME} (title, excerpt, tag, date, image, href)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, excerpt, tag, date, image, href]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al crear artículo:", error);
    res.status(500).json({ error: "Error interno al crear artículo" });
  }
});

// Actualizar un artículo (solo admin)
router.put("/articles/:id", isAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, excerpt, tag, date, image, href } = req.body;

  if (!title || !excerpt || !tag || !date || !href) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    const result = await pool.query(
      `UPDATE ${TABLE_NAME} SET title=$1, excerpt=$2, tag=$3, date=$4, image=$5, href=$6 WHERE id=$7 RETURNING *`,
      [title, excerpt, tag, date, image, href, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Artículo no encontrado" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar artículo:", error);
    res.status(500).json({ error: "Error interno al actualizar artículo" });
  }
});

// Eliminar un artículo (solo admin)
router.delete("/articles/:id", isAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`DELETE FROM ${TABLE_NAME} WHERE id=$1`, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Artículo no encontrado" });
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar artículo:", error);
    res.status(500).json({ error: "Error interno al eliminar artículo" });
  }
});

export default router;