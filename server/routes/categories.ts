import type { Express, Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { isAuthenticated } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';
import { parsePaginationParams } from '../utils/pagination.js';
import { validateBody } from '../middlewares/validateBody.js';
import { categorySchema } from '../validations/categoryValidation.js';

const prisma = new PrismaClient();

function normalizeSlug(slug: string): string {
  return slug.trim().toLowerCase();
}

export function registerCategoryRoutes(app: Express) {
  // Obtener todas las categorías
  app.get("/api/categories", async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await prisma.categories.findMany({
        orderBy: {
          name: "asc"
        }
      });
      res.json(categories);
    } catch (error) {
      next(error);
    }
  });

  // Obtener categoría por slug (slug único, usar findUnique)
  app.get("/api/categories/:slug", async (req: Request, res: Response, next: NextFunction) => {
    const slug = normalizeSlug(req.params.slug);
    try {
      const category = await prisma.categories.findUnique({
        where: { slug },
      });
      if (!category) {
        return res.status(404).json({ message: "Categoría no encontrada" });
      }
      res.json(category);
    } catch (error) {
      next(error);
    }
  });

  // Obtener tareas por slug de categoría con paginación
  app.get("/api/categories/:slug/tasks", async (req: Request, res: Response, next: NextFunction) => {
    const slug = normalizeSlug(req.params.slug);
    try {
      const category = await prisma.categories.findUnique({
        where: { slug },
      });
      if (!category) {
        return res.status(404).json({ message: "Categoría no encontrada" });
      }

      const { page, limit } = req.query;
      const { pageNumber, limitNumber } = parsePaginationParams(page as string, limit as string);

      const tasks = await prisma.tasks.findMany({
        where: { 
          category_id: category.id,
        },
        skip: (pageNumber - 1) * limitNumber,
        take: limitNumber,
        orderBy: {
          id: "desc"
        }
      });

      res.json(tasks);
    } catch (error) {
      next(error);
    }
  });

  // Crear una nueva categoría (solo admin)
  app.post(
    "/api/categories",
    isAuthenticated,
    authorizeRoles("admin"),
    validateBody(categorySchema),
    async (req: Request, res: Response, next: NextFunction) => {
      let { name, slug, description, icon, color } = req.body;

      slug = normalizeSlug(slug);

      try {
        const existingCategory = await prisma.categories.findUnique({
          where: { slug },
        });

        if (existingCategory) {
          return res.status(400).json({ message: "El slug ya está en uso" });
        }

        const category = await prisma.categories.create({
          data: {
            name,
            slug,
            description: description || "",
            icon: icon || "",
            color: color || "#000000",
          },
        });

        res.status(201).json(category);
      } catch (error) {
        next(error);
      }
    }
  );

  // Actualizar una categoría (solo admin)
  app.patch(
    "/api/categories/:id",
    isAuthenticated,
    authorizeRoles("admin"),
    validateBody(categorySchema),
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      let { name, slug, description, icon, color } = req.body;

      if (!id) {
        return res.status(400).json({ message: "ID es requerido" });
      }

      try {
        const categoryId = parseInt(id);
        if (isNaN(categoryId)) {
          return res.status(400).json({ message: "ID inválido" });
        }

        if (slug) {
          slug = normalizeSlug(slug);
          const existingCategory = await prisma.categories.findFirst({
            where: {
              slug,
              NOT: {
                id: categoryId,
              },
            },
          });

          if (existingCategory) {
            return res.status(400).json({ message: "El slug ya está en uso" });
          }
        }

        const category = await prisma.categories.update({
          where: { id: categoryId },
          data: {
            name: name || undefined,
            slug: slug || undefined,
            description: description || undefined,
            icon: icon || undefined,
            color: color || undefined,
          },
        });

        res.json(category);
      } catch (error) {
        next(error);
      }
    }
  );

  // Eliminar una categoría (solo admin)
  app.delete(
    "/api/categories/:id",
    isAuthenticated,
    authorizeRoles("admin"),
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;

      try {
        const categoryId = parseInt(id);
        if (isNaN(categoryId)) {
          return res.status(400).json({ message: "ID inválido" });
        }

        const taskCount = await prisma.tasks.count({
          where: { category_id: categoryId }
        });

        if (taskCount > 0) {
          return res.status(400).json({ 
            message: "No se puede eliminar la categoría porque tiene tareas asociadas" 
          });
        }

        await prisma.categories.delete({
          where: { id: categoryId },
        });

        res.json({ message: "Categoría eliminada correctamente" });
      } catch (error) {
        next(error);
      }
    }
  );
}