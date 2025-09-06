// src/pages/Landing.tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import CategoryCard from "@/components/category-card";
import TaskCard from "@/components/task-card";
import TaskerCard from "@/components/tasker-card";
import type { Task as TaskType, Category, User } from "@/lib/types"; // Importamos el tipo correcto
import { useQuery } from "@tanstack/react-query";
import {
  Star,
  Wrench,
  Plug,
  Paintbrush,
  Hammer,
  Sparkles,
  Leaf,
  Truck,
  Laptop,
  Palette,
  Users,
  Scissors,
  Camera,
  Utensils,
  Music,
  Dumbbell,
  BookOpen,
  Home,
  Settings,
  Folder
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useState, useRef, useEffect } from "react";

interface Country {
  code: string;
  name: string;
  flag: string;
  path: string;
}

const countries: Country[] = [
  { code: "uy", name: "Uruguay", flag: "ðŸ‡ºðŸ‡¾", path: "/countries/uruguay" },
  { code: "ar", name: "Argentina", flag: "ðŸ‡¦ðŸ‡·", path: "/countries/argentina" },
  { code: "cl", name: "Chile", flag: "ðŸ‡¨ðŸ‡±", path: "/countries/chile" },
];

// Definimos tipos auxiliares para la transformación
type UserType = {
  id: string; // Cambiado a string para consistencia
  firstName?: string | null;
  lastName?: string | null;
};

// Genera el slug a partir del nombre (alineado con tu backend)
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Función para transformar el objeto al tipo Task esperado
function transformToTask(task: any): TaskType {
  return {
    id: Number(task.id),
    clientId: task.client?.id !== undefined && task.client?.id !== null ? String(task.client.id) : "",
    title: String(task.title),
    description: task.description ?? null,
    budget: typeof task.budget === "number" ? task.budget : null,
    currency: task.currency ?? null,
    location: task.location ?? null,
    priority: task.priority ?? undefined,
    status: task.status ?? undefined,
    createdAt: task.createdAt ?? undefined,
    dueDate: task.dueDate ?? undefined,
    categoryId: task.category?.id ?? null,
    category: task.category ?? null,
    client: task.client ?? null,
    assignedTasker: task.assignedTasker ?? null,
  };
}

// âœ… Datos editables de artículos
const featuredArticles = [
  {
    title: "Cómo una familia optimizó sus tareas del hogar con TaskSur",
    excerpt:
      "Implementaron recordatorios y contrataron un Tasker semanal. Estos son los resultados tras 2 meses.",
    tag: "Historia",
    date: "15 Ago 2025",
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop",
    href: "/articulos/como-una-familia-optimizo-sus-tareas-del-hogar",
  },
  {
    title: "Novedades de la plataforma: perfiles verificados y reseñas mejoradas",
    excerpt:
      "Lanzamos nuevas funcionalidades para aumentar la confianza y mejorar la experiencia de contratación.",
    tag: "Noticias",
    date: "10 Ago 2025",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop",
    href: "/articulos/novedades-plataforma-perfiles-verificados",
  },
  {
    title: "Guía: cómo elegir al Tasker ideal para tu proyecto",
    excerpt:
      "Consejos prácticos para evaluar perfiles, presupuestos y tiempos de entrega sin complicaciones.",
    tag: "Artículo",
    date: "05 Ago 2025",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop",
    href: "/articulos/como-elegir-al-tasker-ideal",
  },
];

const latestArticles = [
  {
    title: "Historias de Taskers: de hobby a ingreso principal",
    tag: "Historia",
    date: "01 Ago 2025",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop",
    href: "/articulos/historias-de-taskers-de-hobby-a-ingreso",
  },
  {
    title: "Actualizamos la app móvil con notificaciones inteligentes",
    tag: "Noticias",
    date: "28 Jul 2025",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop",
    href: "/articulos/actualizacion-app-movil-notificaciones-inteligentes",
  },
  {
    title: "Checklist para tu primera contratación en TaskSur",
    tag: "Artículo",
    date: "24 Jul 2025",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop",
    href: "/articulos/checklist-primera-contratacion-tasksur",
  },
  {
    title: "Cómo fijar precios competitivos como Tasker",
    tag: "Artículo",
    date: "20 Jul 2025",
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop",
    href: "/articulos/como-fijar-precios-competitivos-como-tasker",
  },
  {
    title: "Casos de éxito: pequeñas reformas con gran impacto",
    tag: "Historia",
    date: "17 Jul 2025",
    image:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1200&auto=format&fit=crop",
    href: "/articulos/casos-de-exito-pequenas-reformas-gran-impacto",
  },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // 1) Hooks primero: queries, refs y states
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: recentTasks = [] } = useQuery<any[]>({ // Usamos any[] temporalmente para los datos crudos
    queryKey: ["/api/tasks"],
  });

  const categoriesCarouselRef = useRef<HTMLDivElement | null>(null);
  const newsCarouselRef = useRef<HTMLDivElement | null>(null);

  const [testimonialIndex, setTestimonialIndex] = useState(0);

  // Enriquecer tareas para asegurar que tengan category y client
  const enrichedTasks = recentTasks.map((task) => ({
    ...task,
    category: task.category || null,
    client: task.client || { id: "0", firstName: "Desconocido", lastName: "" },
  }));

  const featuredCategories = categories.slice(0, 8);
  
  // Transformamos las tareas usando nuestra función
  const featuredTasks = enrichedTasks.slice(0, 3).map(transformToTask);

  const getCategoryIcon = (name: string) => {
    const n = name.toLowerCase();
    const commonProps = "h-10 w-10 text-primary/90 group-hover:text-primary transition-colors";

    if (n.includes("electric")) return <Plug className={commonProps} strokeWidth={1.75} />;
    if (n.includes("plom") || n.includes("plumb")) return <Wrench className={commonProps} strokeWidth={1.75} />;
    if (n.includes("carp")) return <Hammer className={commonProps} strokeWidth={1.75} />;
    if (n.includes("pint") || n.includes("paint")) return <Paintbrush className={commonProps} strokeWidth={1.75} />;
    if (n.includes("limp") || n.includes("clean")) return <Sparkles className={commonProps} strokeWidth={1.75} />;
    if (n.includes("jardin") || n.includes("garden")) return <Leaf className={commonProps} strokeWidth={1.75} />;
    if (n.includes("mudan") || n.includes("move")) return <Truck className={commonProps} strokeWidth={1.75} />;
    if (n.includes("comput") || n.includes("inform") || n.includes("tech") || n.includes("it")) return <Laptop className={commonProps} strokeWidth={1.75} />;
    if (n.includes("diseñ") || n.includes("design") || n.includes("branding")) return <Palette className={commonProps} strokeWidth={1.75} />;
    if (n.includes("niñ") || n.includes("cuidado") || n.includes("child") || n.includes("baby")) return <Users className={commonProps} strokeWidth={1.75} />;
    if (n.includes("pelu") || n.includes("barber") || n.includes("hair")) return <Scissors className={commonProps} strokeWidth={1.75} />;
    if (n.includes("foto") || n.includes("photo")) return <Camera className={commonProps} strokeWidth={1.75} />;
    if (n.includes("coc") || n.includes("chef") || n.includes("food")) return <Utensils className={commonProps} strokeWidth={1.75} />;
    if (n.includes("música") || n.includes("music")) return <Music className={commonProps} strokeWidth={1.75} />;
    if (n.includes("gim") || n.includes("fit") || n.includes("trainer")) return <Dumbbell className={commonProps} strokeWidth={1.75} />;
    if (n.includes("clase") || n.includes("tutor") || n.includes("edu") || n.includes("prof")) return <BookOpen className={commonProps} strokeWidth={1.75} />;
    if (n.includes("hogar") || n.includes("casa") || n.includes("home")) return <Home className={commonProps} strokeWidth={1.75} />;
    if (n.includes("repar") || n.includes("fix") || n.includes("repair")) return <Settings className={commonProps} strokeWidth={1.75} />;

    return <Folder className={commonProps} strokeWidth={1.75} />;
  };

  // Funciones para carruseles
  const scrollCategoriesByAmount = (amount: number) => {
    categoriesCarouselRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  };

  const scrollByCard = (dir = 1) => {
    const el = newsCarouselRef.current;
    if (!el) return;
    const card = el.querySelector("[data-card]");
    const gap = 16; // tailwind gap-4
    const width = card ? (card as HTMLElement).clientWidth + gap : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * width, behavior: "smooth" });
  };

  const featuredTaskers = [
    {
      id: "user1",
      firstName: "Carlos",
      lastName: "R.",
      specialty: "Plomero y Electricista",
      rating: "4.9",
      reviewCount: 156,
      hourlyRate: "45",
      profileImageUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      bio: "Experto en plomería y electricidad con más de 10 años de experiencia.",
      location: "Montevideo, Uruguay",
      skills: ["Plomería", "Electricidad", "Reparaciones"],
      isTasker: true,
    },
    {
      id: "user2",
      firstName: "Ana",
      lastName: "M.",
      specialty: "Limpieza del Hogar",
      rating: "5.0",
      reviewCount: 89,
      hourlyRate: "30",
      profileImageUrl:
        "https://images.unsplash.com/photo-1494790108755-2616b612b665?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      bio: "Profesional en limpieza con atención al detalle.",
      location: "Buenos Aires, Argentina",
      skills: ["Limpieza", "Organización", "Cuidado del hogar"],
      isTasker: true,
    },
    {
      id: "user3",
      firstName: "Diego",
      lastName: "F.",
      specialty: "Carpintero y Pintor",
      rating: "4.8",
      reviewCount: 203,
      hourlyRate: "40",
      profileImageUrl:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      bio: "Carpintero profesional con experiencia en pintura y acabados.",
      location: "Montevideo, Uruguay",
      skills: ["Carpintería", "Pintura", "Acabados"],
      isTasker: true,
    },
    {
      id: "user4",
      firstName: "Laura",
      lastName: "G.",
      specialty: "Diseñadora Gráfica",
      rating: "4.9",
      reviewCount: 127,
      hourlyRate: "35",
      profileImageUrl:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      bio: "Diseñadora gráfica con 5 años de experiencia en branding y diseño digital.",
      location: "Buenos Aires, Argentina",
      skills: ["Diseño gráfico", "Illustrator", "Photoshop"],
      isTasker: true,
    },
  ];

  const testimonials = [
    {
      name: "Roberto Silva",
      location: "Montevideo, Uruguay",
      text:
        "Encontré un electricista excelente en menos de 2 horas. El proceso fue súper fácil y el pago seguro me dio mucha confianza.",
      image:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60",
    },
    {
      name: "María López",
      location: "Buenos Aires, Argentina",
      text:
        "Los taskers son muy profesionales y confiables. Recomiendo TaskSur a todos mis amigos.",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      name: "Juan Pérez",
      location: "Santiago, Chile",
      text:
        "Publicar tareas es muy sencillo y recibí ofertas rápidamente. Excelente plataforma.",
      image: "https://randomuser.me/api/portraits/men/46.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      
    {/* Hero Section */}
<section className="bg-gradient-to-br from-primary to-secondary text-white relative">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
    {/* Sección países arriba a la izquierda en fila horizontal con menos margen */}
    <nav className="flex space-x-6 mb-8 justify-start">
      {countries.map((country: Country) => (
        <button
          key={country.code}
          onClick={() => setLocation(country.path)}
          className="flex items-center space-x-2 text-white hover:text-yellow-300 transition font-semibold text-lg"
        >
          {/* Aquí aseguramos que se muestre la bandera (emoji) */}
          <span className="text-2xl select-none">{country.flag}</span>
          <span>{country.name}</span>
        </button>
      ))}
    </nav>

    {/* Contenido principal del Hero */}
    <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
      {/* Texto y botones */}
      <div className="max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          Conectamos talentos con oportunidades en{" "}
          <span className="text-yellow-300">Sudamérica</span>
        </h1>
        <p className="text-xl mb-8 text-muted-foreground">
          Desde reparaciones domésticas hasta servicios profesionales.
          Encuentra expertos locales o ofrece tus habilidades en Uruguay
          y Argentina.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            size="lg"
            className="bg-white text-primary hover:bg-gray-100 transition"
            onClick={() => setLocation("/browse")}
          >
            Buscar Trabajos
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-primary transition"
            onClick={() => setLocation("/login")}
          >
            Ofrecer Trabajos
          </Button>
        </div>
      </div>

      {/* Imagen y elementos absolutos */}
      <div className="relative hidden lg:block w-1/2">
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
          <div className="text-secondary font-bold text-2xl">4.8â˜…</div>
          <div className="text-muted-foreground text-sm">Calificación Promedio</div>
        </div>
      </div>
    </div>
  </div>
</section>
      {/* Service Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Servicios Populares
            </h2>
            <p className="text-xl text-black max-w-3xl mx-auto">
              Desde tareas del hogar hasta servicios profesionales especializados
            </p>
          </div>

          <div className="relative">
            <button
              aria-label="Anterior"
              onClick={() => scrollCategoriesByAmount(-320)}
              className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white shadow hover:bg-gray-100 border border-gray-200"
            >
              â€¹
            </button>

            <button
              aria-label="Siguiente"
              onClick={() => scrollCategoriesByAmount(320)}
              className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white shadow hover:bg-gray-100 border border-gray-200"
            >
              â€º
            </button>

            <div
              ref={categoriesCarouselRef}
              className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory px-1 pb-2"
            >
              {featuredCategories.map((category) => {
                const to = `/categories/${slugify(category.name)}`;
                return (
                  <div
                    key={category.id}
                    className="snap-start min-w-[240px] max-w-[260px] w-[240px] shrink-0"
                  >
                    <div
                      onClick={() => setLocation(to)}
                      className="cursor-pointer group rounded-2xl bg-white border border-gray-200 hover:border-primary hover:shadow-lg transition p-5"
                    >
                      <div className="h-24 w-full mb-4 flex items-center justify-center bg-muted/50 rounded-xl">
                        {getCategoryIcon(category.name)}
                      </div>
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition">
                          {category.name}
                        </h3>
                        {category.priceRange ? (
                          <p className="text-sm text-muted-foreground mt-1">
                            {category.priceRange}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-1">&nbsp;</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-10">
              <Button
                size="lg"
                className="bg-white text-primary border border-gray-200 hover:bg-gray-100 transition"
                onClick={() => setLocation("/categories")}
              >
                Ver Todas las Categorías
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-tasksur-dark mb-4">
              ¿Cómo Funciona?
            </h2>
            <p className="text-xl text-tasksur-neutral max-w-2xl mx-auto">
              Tres simples pasos para conectar con los mejores profesionales
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center px-6">
              <div className="bg-tasksur-primary text-white rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold mb-6 shadow-lg transition-transform duration-300 ease-in-out hover:scale-110 hover:shadow-2xl">
                1
              </div>
              <h3 className="text-xl font-semibold text-tasksur-dark mb-3">
                Publica tu Tarea
              </h3>
              <p className="text-tasksur-neutral max-w-sm">
                Describe lo que necesitas, establece tu presupuesto y ubicación. Es gratis publicar.
              </p>
            </div>

            <div className="flex flex-col items-center text-center px-6">
              <div className="bg-tasksur-secondary text-white rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold mb-6 shadow-lg transition-transform duration-300 ease-in-out hover:scale-110 hover:shadow-2xl">
                2
              </div>
              <h3 className="text-xl font-semibold text-tasksur-dark mb-3">
                Recibe Ofertas
              </h3>
              <p className="text-tasksur-neutral max-w-sm">
                Los Taskers interesados te enviarán ofertas. Revisa sus perfiles y calificaciones.
              </p>
            </div>

            <div className="flex flex-col items-center text-center px-6">
              <div className="bg-tasksur-accent text-white rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold mb-6 shadow-lg transition-transform duration-300 ease-in-out hover:scale-110 hover:shadow-2xl">
                3
              </div>
              <h3 className="text-xl font-semibold text-tasksur-dark mb-3">
                Elige y Paga
              </h3>
              <p className="text-tasksur-neutral max-w-sm">
                Selecciona el mejor Tasker y paga de forma segura cuando el trabajo esté completo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tasks */}
      {featuredTasks.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-tasksur-dark mb-4">
                  Tareas Recientes
                </h2>
                <p className="text-xl text-tasksur-neutral">
                  Oportunidades disponibles ahora mismo
                </p>
              </div>
              <Button
                variant="ghost"
                className="text-blue-400 hover:text-blue-500 transition"
                onClick={() => setLocation("/browse")}
              >
                Ver Todas →
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top Taskers */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-tasksur-dark mb-4">
              Taskers Destacados
            </h2>
            <p className="text-xl text-tasksur-neutral">
              Profesionales verificados con excelentes calificaciones
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredTaskers.map((tasker) => {
              console.log("ID del tasker en lista:", tasker.id);
              return <TaskerCard key={tasker.id} tasker={tasker} />;
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-tasksur-dark mb-4">
              Lo que Dicen Nuestros Usuarios
            </h2>
          </div>

          <div className="relative">
            <Card className="bg-gray-50 p-8 max-w-3xl mx-auto shadow-lg transition-transform duration-500 ease-in-out transform hover:scale-105">
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <p className="text-tasksur-neutral mb-6 italic text-lg">
                {testimonials[testimonialIndex].text}
              </p>
              <div className="flex items-center justify-center gap-4">
                <img
                  src={testimonials[testimonialIndex].image}
                  alt={testimonials[testimonialIndex].name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-tasksur-dark text-lg">
                    {testimonials[testimonialIndex].name}
                  </div>
                  <div className="text-tasksur-neutral text-sm">
                    {testimonials[testimonialIndex].location}
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex justify-center mt-6 space-x-4">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setTestimonialIndex(idx)}
                  className={`w-4 h-4 rounded-full ${
                    idx === testimonialIndex
                      ? "bg-tasksur-primary"
                      : "bg-gray-300"
                  }`}
                  aria-label={`Testimonio ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Artículos, Historias y Noticias */}
      <section className="py-20 bg-gradient-to-r from-tasksur-primary to-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black">
              Artículos, Historias y Noticias
            </h2>
            <p className="text-lg text-black">
              Explora novedades de la plataforma, consejos prácticos y casos de éxito de nuestra comunidad.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredArticles.map((a, i) => (
              <a
                key={i}
                href={a.href}
                className="group bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition border border-gray-100 flex flex-col"
              >
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={a.image}
                    alt={a.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="text-xs uppercase tracking-wide text-tasksur-primary font-semibold">
                    {a.tag}
                  </div>
                  <h3 className="mt-1 text-lg font-semibold text-gray-900 group-hover:text-tasksur-primary">
                    {a.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-3">{a.excerpt}</p>
                  <div className="mt-4 text-xs text-gray-500">{a.date}</div>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-14">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold">Lo más reciente</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => scrollByCard(-1)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
                  aria-label="Anterior"
                  title="Anterior"
                >
                  â€¹
                </button>
                <button
                  onClick={() => scrollByCard(1)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
                  aria-label="Siguiente"
                  title="Siguiente"
                >
                  â€º
                </button>
              </div>
            </div>

            <div
              ref={newsCarouselRef}
              className="overflow-x-auto no-scrollbar scroll-smooth"
            >
              <div className="flex gap-4">
                {latestArticles.map((a, i) => (
                  <div
                    key={i}
                    data-card
                    className="min-w-[260px] sm:min-w-[300px] max-w-[320px] flex-1"
                  >
                    <a
                      href={a.href}
                      className="block bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition border border-gray-100 text-gray-900"
                    >
                      <div className="aspect-[16/9] overflow-hidden">
                        <img
                          src={a.image}
                          alt={a.title}
                          className="h-full w-full object-cover hover:scale-105 transition duration-300"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-4">
                        <div className="text-xs uppercase tracking-wide text-tasksur-primary font-semibold">
                          {a.tag}
                        </div>
                        <h4 className="mt-1 text-base font-semibold line-clamp-2">
                          {a.title}
                        </h4>
                        <div className="mt-3 text-xs text-gray-500">{a.date}</div>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <style>{`
              .no-scrollbar::-webkit-scrollbar { display: none; }
              .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
          </div>
        </div>
      </section>
    </div>
  );
}




