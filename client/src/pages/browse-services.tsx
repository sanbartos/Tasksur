// src/pages/BrowseServices.tsx
import React, { useMemo, useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Star, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import "leaflet/dist/leaflet.css";
import { Task } from "@/lib/types";

/**
 * BrowseServices
 * - filtros: búsqueda, categoría (via query), featured (via query), rango precio, ubicación, rating, disponibilidad
 * - paginación del listado (client-side)
 * - mapa que muestra los resultados de la página actual
 * - fetch real a /api/tasks
 * - manejo de loading y errores
 */

/* Tipado del servicio (mock / backend) */
type Service = Task & {
  lat: number;
  lng: number;
  location: string;
  featured?: boolean;
};

// Función para generar coordenadas mock a partir de ubicación
function getLocationCoords(location: string): [number, number] {
  const locations: Record<string, [number, number]> = {
    "Montevideo, Uruguay": [-34.9011, -56.1645],
    "Buenos Aires, Argentina": [-34.6037, -58.3816],
    "Pocitos, Montevideo": [-34.9111, -56.14],
    "Ciudad Vieja, Montevideo": [-34.905, -56.215],
    "Cordón, Montevideo": [-34.895, -56.17],
    "Palermo, Buenos Aires": [-34.58, -58.43],
  };
  return locations[location] || [-34.9011, -56.1645];
}

// Función para generar datos mock desde Task[]
function generateMockServices(tasks: Task[]): Service[] {
  return tasks.map((task) => {
    const [lat, lng] = getLocationCoords(task.location || "Montevideo, Uruguay");
    return {
      ...task,
      lat,
      lng,
      location: task.location || "Montevideo, Uruguay",
      featured: Math.random() > 0.7, // 30% de servicios destacados
    };
  });
}

// Función para obtener servicios desde el backend
async function fetchServices(): Promise<Task[]> {
  const res = await fetch("/api/tasks");
  if (!res.ok) throw new Error("Error al cargar los servicios");
  return res.json();
}

export default function BrowseServices() {
  // UI / filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [availableOnly, setAvailableOnly] = useState<boolean>(false);

  // selección en listado
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // paginación
  const pageOptions = [6, 12, 24];
  const [pageSize, setPageSize] = useState<number>(6);
  const [page, setPage] = useState<number>(1);

  // leer query params (category, featured, etc.)
  const [locationPath] = useLocation();
  const query = useMemo(() => {
    const search = locationPath.split("?")[1];
    return new URLSearchParams(search);
  }, [locationPath]);

  const categoryFilter = query.get("category") || undefined;
  const featuredFilter = query.get("featured") === "true";

  // Fetch real con react-query
  const {
    data: tasks = [],
    isLoading,
    isError,
    error,
  } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: fetchServices,
  });

  // Generar servicios mock desde tasks
  const servicesData = useMemo(() => generateMockServices(tasks), [tasks]);

  // Ubicaciones únicas para el select
  const locations = useMemo(() => {
    return Array.from(new Set(servicesData.map((s) => s.location)));
  }, [servicesData]);

  // Filtrado principal combinando todos los criterios
  const filteredServices = useMemo(() => {
    let result = servicesData;

    if (categoryFilter) {
      const slug = decodeURIComponent(categoryFilter).toLowerCase();
      result = result.filter(
        (service) => (service.category?.name || "").toLowerCase() === slug
      );
    }

    if (featuredFilter) {
      result = result.filter((s) => s.featured);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(term) ||
          s.description?.toLowerCase().includes(term) ||
          s.location.toLowerCase().includes(term)
      );
    }

    // precio
    result = result.filter(
      (s) =>
        (s.budget === undefined || s.budget === null || s.budget >= minPrice) &&
        (s.budget === undefined || s.budget === null || s.budget <= maxPrice)
    );

    // ubicación
    if (locationFilter) {
      result = result.filter((s) => s.location === locationFilter);
    }

    // rating (mock)
    if (ratingFilter > 0) {
      result = result.filter((s) => (s.rating ?? 0) >= ratingFilter);
    }

    // disponibilidad (mock)
    if (availableOnly) {
      result = result.filter((s) => s.status === "open");
    }

    return result;
  }, [
    servicesData,
    categoryFilter,
    featuredFilter,
    searchTerm,
    minPrice,
    maxPrice,
    locationFilter,
    ratingFilter,
    availableOnly,
  ]);

  // resetear página cuando cambian filtros/resultados
  useEffect(() => {
    setPage(1);
    // clear selection if selection not in filtered results
    if (selectedService && !filteredServices.find((s) => s.id === selectedService.id)) {
      setSelectedService(null);
    }
  }, [filteredServices]);

  // paginado client-side
  const total = filteredServices.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paginatedServices = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredServices.slice(start, start + pageSize);
  }, [filteredServices, page, pageSize]);

  // Mapa: centro dinámico (primer resultado de la página o centro por defecto)
  const defaultCenter: LatLngExpression = [-34.9011, -56.1645];
  const mapCenter: LatLngExpression =
    paginatedServices.length > 0
      ? [paginatedServices[0].lat, paginatedServices[0].lng]
      : defaultCenter;

  // controles de paginación
  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const setPageSafe = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2">Cargando servicios...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-red-50 text-red-700 p-4 rounded">
        <div>
          <h3 className="font-bold">Error al cargar los servicios</h3>
          <p>{error instanceof Error ? error.message : "Error desconocido"}</p>
          <Button className="mt-2" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="flex flex-col md:flex-row h-[calc(100vh-64px)] bg-gray-100 p-4 gap-4">
      {/* Sidebar filtros + listado paginado */}
      <aside className="w-full md:w-2/5 bg-white rounded-lg shadow p-4 flex flex-col h-full">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold">Buscar y filtrar</h2>
          <div className="text-sm text-gray-600">
            {total} resultado{total !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Búsqueda */}
        <Input
          placeholder="Buscar por título, descripción o ubicación..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
          aria-label="Buscar servicios"
        />

        {/* Precio (slider) */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Rango de precio (UYU)</label>
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <div>Min: $U {minPrice.toLocaleString()}</div>
            <div>Max: $U {maxPrice.toLocaleString()}</div>
          </div>
          <Slider
            min={0}
            max={10000}
            step={100}
            value={[minPrice, maxPrice]}
            onValueChange={([min, max]) => {
              setMinPrice(min);
              setMaxPrice(max);
            }}
            className="mb-2"
            aria-label="Rango de precio"
          />
        </div>

        {/* Ubicación */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Ubicación</label>
          <Select value={locationFilter} onValueChange={(v) => setLocationFilter(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Todas las ubicaciones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Rating */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Rating mínimo</label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = star <= ratingFilter;
              return (
                <button
                  key={star}
                  onClick={() => setRatingFilter(active && ratingFilter === star ? 0 : star)}
                  className={`p-1 rounded ${active ? "bg-yellow-50" : "hover:bg-gray-50"}`}
                  aria-label={`Filtrar por ${star} estrellas`}
                >
                  <Star className={`w-5 h-5 ${active ? "text-yellow-500 fill-current" : "text-gray-400"}`} />
                </button>
              );
            })}
            <button
              onClick={() => setRatingFilter(0)}
              className="text-sm text-blue-600 ml-2"
              aria-label="Limpiar filtro de rating"
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* Disponibilidad */}
        <div className="mb-4 flex items-center gap-2">
          <Checkbox
            id="available"
            checked={availableOnly}
            onCheckedChange={(checked) => setAvailableOnly(!!checked)}
          />
          <label htmlFor="available" className="text-sm">
            Solo disponibles
          </label>
        </div>

        {/* Resultados listados (paginados) */}
        <h3 className="text-lg font-semibold mb-2">Servicios</h3>

        {paginatedServices.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No se encontraron servicios.</div>
        ) : (
          <div className="overflow-y-auto flex-grow space-y-3">
            {paginatedServices.map((service) => (
              <div
                key={service.id}
                onClick={() => setSelectedService(service)}
                className={`p-3 rounded-lg border cursor-pointer transition ${
                  selectedService?.id === service.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                }`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setSelectedService(service);
                }}
                aria-label={`Seleccionar servicio ${service.title}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-sm">{service.title}</h4>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{service.description}</p>
                    <p className="text-xs text-gray-500 mt-2">{service.location}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-green-600 font-medium">
                      $U {service.budget?.toLocaleString()}
                    </div>
                    <div className="flex items-center text-yellow-500 mt-1">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-xs ml-1">{service.rating ?? "-"}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Link href={`/tasks/${service.id}`}>
                    <Button size="sm">Ver detalles</Button>
                  </Link>
                  {service.featured && (
                    <span className="text-xs text-white bg-indigo-600 px-2 py-1 rounded">
                      Destacado
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginación */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={goPrev} disabled={page <= 1}>
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => {
                const p = i + 1;
                const isActive = p === page;
                return (
                  <button
                    key={p}
                    onClick={() => setPageSafe(p)}
                    className={`px-2 py-1 rounded ${
                      isActive ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                    aria-label={`Ir a la página ${p}`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            <Button size="sm" variant="outline" onClick={goNext} disabled={page >= totalPages}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Mostrar</span>
            <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageOptions.map((opt) => (
                  <SelectItem key={opt} value={String(opt)}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>por página</span>
          </div>
        </div>
      </aside>

      {/* Mapa */}
      <section className="w-full md:w-3/5 rounded-lg shadow overflow-hidden">
        <MapContainer center={mapCenter} zoom={6} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; OpenStreetMap contributors'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          {paginatedServices.map((service) => (
            <Marker
              key={service.id}
              position={[service.lat, service.lng]}
              eventHandlers={{
                click: () => setSelectedService(service),
              }}
            >
              <Popup>
                <strong>{service.title}</strong>
                <br />
                {service.location}
                <div className="mt-2">
                  <Link href={`/tasks/${service.id}`}>
                    <Button size="xs">Ver detalles</Button>
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </section>
    </main>
  );
}