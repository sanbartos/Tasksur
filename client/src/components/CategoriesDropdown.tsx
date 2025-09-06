// src/components/CategoriesDropdown.tsx
import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";

export const categories = [
  "Contadores",
  "Administración",
  "Arreglos",
  "Electrodomésticos",
  "Montaje",
  "Electricistas de Autos",
  "Panaderos",
  "Barberos",
  "Esteticistas",
  "Servicio de Bicicletas",
  "Albañilería",
  "Construcción",
  "Negocios",
  "Carrocería",
  "Detalle de Autos",
  "Reparación de Autos",
  "Servicio de Autos",
  "Carpintería",
  "Cuidado de Gatos",
  "Catering",
  "Chef",
  "Revestimientos",
  "Limpieza",
  "Computadoras y TI",
  "Hormigón",
  "Terrazas",
  "Delivery",
  "Diseño",
  "Cuidado de Perros",
  "Delineante",
  "Conducción",
  "Electricistas",
  "Entretenimiento",
  "Eventos",
  "Cercas",
  "Pisos",
  "Floristería",
  "Montaje de Muebles",
  "Jardinería",
  "Instalación de Portones",
  "Peluqueros",
  "Manitas",
  "Calefacción y Refrigeración",
  "Domótica y Seguridad",
  "Home Theatre",
  "Diseñador de Interiores",
  "Paisajismo",
  "Lavandería",
  "Cuidado de Césped",
  "Clases",
  "Cerrajería",
  "Maquillaje",
  "Marketing",
  "Mecánico Móvil",
  "Pintura",
  "Pavimentación",
  "Control de Plagas",
  "Cuidado de Mascotas",
  "Fotógrafos",
  "Yesero",
  "Plomería",
  "Mantenimiento de Piscinas",
  "Mudanzas",
  "Techos",
  "Afilado",
  "Personal",
  "Sastres",
  "Tatuadores",
  "Albañiles",
  "Tutorías",
  "Colgado de Paredes",
  "Papel Tapiz",
  "Impermeabilización",
  "Web",
  "Servicio de Ruedas y Neumáticos",
  "Redacción",
];

// Función para generar slug simple
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

export const categoriesWithSlug = categories.map((name) => ({
  name,
  slug: slugify(name),
}));

export default function CategoriesDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMouseEnter = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimer.current = window.setTimeout(() => {
      setIsOpen(false);
    }, 180);
  };

  return (
    <div
      className="relative"
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        aria-haspopup="true"
        aria-expanded={isOpen}
        tabIndex={0}
        className={`text-tasksur-neutral hover:text-tasksur-primary transition-colors font-medium ${
          isOpen ? "text-tasksur-primary font-medium" : ""
        }`}
        onClick={() => setIsOpen((v) => !v)}
      >
        Categorías
      </button>

      {isOpen && (
        <div
          role="menu" // âœ… Añadido para accesibilidad
          aria-label="Lista de categorías" // âœ… Etiqueta descriptiva
          className="absolute top-full left-0 mt-2 w-[600px] max-h-96 overflow-y-auto bg-white border border-gray-200 rounded shadow-lg z-[9999] p-6 grid grid-cols-3 gap-6 text-sm text-gray-700"
          style={{ pointerEvents: "auto" }}
        >
          <div>
            <h3 className="font-semibold mb-2">¿Qué estás buscando?</h3>
            <p className="mb-4">Elige un tipo de tarea.</p>

            <h4 className="font-semibold">Como Tasker</h4>
            <p className="mb-4">Busco trabajo en ...</p>

            <h4 className="font-semibold">Como Publicante</h4>
            <p>Busco contratar a alguien para ...</p>
          </div>

          <div className="col-span-2">
            <h3 className="font-semibold mb-2">Categorías</h3>
            <ul className="columns-2 gap-4">
              {categoriesWithSlug.map((category, i) => (
                <li key={i} className="mb-1">
                  <Link
                    href={`/categories/${encodeURIComponent(category.slug)}`}
                    role="menuitem" // âœ… Añadido para accesibilidad
                    className="hover:text-tasksur-primary block"
                    onClick={() => setIsOpen(false)}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}




