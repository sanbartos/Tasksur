// src/pages/Home.tsx
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import TaskList from "@/components/TaskList";
import TaskCard from "@/components/task-card";
import ArticleCard from "@/components/ArticleCard";
import { Task, User } from "@/lib/types";

type Category = {
  id: number;
  name: string;
  icon?: string;
};

type Article = {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  imageUrl?: string;
};

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch("/api/categories");
  if (!res.ok) throw new Error("Error fetching categories");
  return res.json();
}

// Genera slug a partir del nombre de la categoría (coincide con backend)
function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/* Mock de tareas destacadas (puedes reemplazar por fetch real) */
const featuredTasks: Task[] = [
  {
    id: 101,
    title: "Reparación de aire acondicionado",
    description: "Técnico certificado para revisar y reparar split.",
    budget: 2500,
    currency: "UYU",
    location: "Pocitos, Montevideo",
    status: "open",
    priority: "high",
    createdAt: new Date().toISOString(),
    clientId: "1",
    client: {
      id: "1",
      firstName: "Carlos",
      lastName: "Mendoza",
      profileImageUrl: "",
      rating: 4.8,
      reviewCount: 15,
    } as User,
    category: { id: 1, name: "Reparaciones", icon: "🔧" },
    rating: 4.8,
  },
  {
    id: 102,
    title: "Clases de inglés conversacional",
    description: "Clases personalizadas para mejorar tu fluidez.",
    budget: 1200,
    currency: "UYU",
    location: "Ciudad Vieja, Montevideo",
    status: "open",
    priority: "normal",
    createdAt: new Date().toISOString(),
    clientId: "2",
    client: {
      id: "2",
      firstName: "Ana",
      lastName: "López",
      profileImageUrl: "",
      rating: 4.9,
      reviewCount: 22,
    } as User,
    category: { id: 2, name: "Clases", icon: "📚" },
    rating: 4.9,
  },
];

/* Mock de artículos (puedes reemplazar por fetch real) */
const articles: Article[] = [
  {
    id: 1,
    title: "Cómo elegir al mejor electricista para tu hogar",
    excerpt: "Conoce los factores clave para contratar un electricista confiable y profesional en Uruguay.",
    author: "María Pérez",
    date: "2025-08-15",
    category: "Guías",
    imageUrl: "https://images.unsplash.com/photo-1574717024456-4444c0ad7830?w=400&h=250&fit=crop",
  },
  {
    id: 2,
    title: "5 consejos para mantener tu jardín en primavera",
    excerpt: "Descubre técnicas sencillas para que tu jardín luzca espectacular durante toda la primavera.",
    author: "Juan Gómez",
    date: "2025-08-10",
    category: "Consejos",
    imageUrl: "https://images.unsplash.com/photo-1485903102802-30d775e1f9e4?w=400&h=250&fit=crop",
  },
  {
    id: 3,
    title: "Tendencias en reformas de cocinas 2025",
    excerpt: "Las últimas tendencias en diseño de cocinas que están revolucionando los hogares en Sudamérica.",
    author: "Laura Rodríguez",
    date: "2025-08-05",
    category: "Tendencias",
    imageUrl: "https://images.unsplash.com/photo-1556911220-ef35d2f3d3d0?w=400&h=250&fit=crop",
  },
];

export default function Home() {
  const { user } = useAuth();

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-tasksur-dark">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Conectamos talentos con oportunidades en{" "}
                <span className="text-yellow-300">Sudamérica</span>
              </h1>

              <p className="text-xl mb-8 text-white/80">
                Desde reparaciones domésticas hasta servicios profesionales.
                Encuentra expertos locales o ofrece tus habilidades en Uruguay
                y Argentina.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/browse"
                  className="inline-flex items-center justify-center bg-white text-primary hover:bg-gray-100 transition px-6 py-3 rounded-md font-medium"
                >
                  Buscar Trabajos
                </Link>

                <Link
                  href="/post-task"
                  className="inline-flex items-center justify-center border border-white text-white hover:bg-white hover:text-primary transition px-6 py-3 rounded-md font-medium"
                >
                  Ofrecer Trabajos
                </Link>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                alt="Profesionales trabajando en diversos servicios"
                className="rounded-2xl shadow-2xl w-full"
              />

              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-lg">
                <div className="text-primary font-bold text-2xl">10,000+</div>
                <div className="text-muted-foreground text-sm">Tareas Completadas</div>
              </div>

              <div className="absolute -top-6 -right-6 bg-white rounded-xl p-4 shadow-lg">
                <div className="text-secondary font-bold text-2xl">4.8★</div>
                <div className="text-muted-foreground text-sm">Calificación Promedio</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-4xl font-extrabold text-tasksur-dark">Explora Categorías</h2>
          <Link href="/categories" className="text-tasksur-primary font-semibold hover:underline text-lg">
            Ver Todas →
          </Link>
        </div>

        {categoriesLoading ? (
          <div className="text-center py-8">Cargando categorías...</div>
        ) : categoriesError ? (
          <div className="text-center py-8 text-red-600">Error cargando categorías</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/browse?category=${encodeURIComponent(slugify(category.name))}`}
                className="group block rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition cursor-pointer bg-white"
              >
                <div className="h-40 w-full bg-gray-100 flex items-center justify-center">
                  {category.icon ? (
                    <img
                      src={category.icon}
                      alt={category.name}
                      className="h-24 w-24 object-contain"
                    />
                  ) : (
                    <span className="text-6xl">📁</span>
                  )}
                </div>
                <div className="p-4 text-center">
                  <h3 className="text-lg font-semibold text-tasksur-dark group-hover:text-tasksur-primary transition">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Services Section */}
      <section className="max-w-7xl mx-auto px-6 py-10 bg-white rounded-xl shadow-sm">
        <h2 className="text-3xl font-extrabold text-tasksur-dark mb-8">Servicios Destacados</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredTasks.map((task) => (
            <TaskCard key={task.id} task={task} showOfferButton={false} />
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link href="/browse?featured=true" className="text-tasksur-primary font-semibold hover:underline">
            Ver más servicios destacados →
          </Link>
        </div>
      </section>

      {/* Articles Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-4xl font-extrabold text-tasksur-dark">Artículos y Consejos</h2>
          <Link href="/articles" className="text-tasksur-primary font-semibold hover:underline text-lg">
            Ver Todos →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>

      {/* Latest Tasks Section */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-extrabold text-tasksur-dark">Tareas Recientes</h2>
          <Link href="/browse" className="text-tasksur-primary font-semibold hover:underline">
            Ver Todas →
          </Link>
        </div>

        <TaskList />
      </section>
    </div>
  );
}