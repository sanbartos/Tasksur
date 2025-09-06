// src/pages/BrowseTaskers.tsx
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MapPin, 
  Star, 
  Search, 
  Filter, 
  UserCheck,
  Clock,
  DollarSign
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

// Tipos
interface Tasker {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  bio?: string | null;
  hourlyRate?: number | null;
  location?: string | null;
  skills?: string[];
  responseTime?: string | null;
  completedTasks?: number | null;
  joinedAt?: string | null;
  isTasker?: boolean;
}

interface Filters {
  search: string;
  minRating: number | null;
  maxRate: number | null;
  location: string;
  skills: string[];
}

// Componente principal
export default function BrowseTaskers() {
  // Estados
  const [filters, setFilters] = useState<Filters>({
    search: "",
    minRating: null,
    maxRate: null,
    location: "",
    skills: []
  });
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // Fetch taskers
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["taskers", { page, filters }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      
      if (filters.search) params.append("search", filters.search);
      if (filters.minRating) params.append("minRating", filters.minRating.toString());
      if (filters.maxRate) params.append("maxRate", filters.maxRate.toString());
      if (filters.location) params.append("location", filters.location);
      if (filters.skills.length > 0) params.append("skills", filters.skills.join(","));
      
      const response = await apiRequest("GET", `/api/taskers?${params.toString()}`);
      return response;
    }
  });

  // Manejar cambio de filtros
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
    setPage(1);
  };

  const handleRatingChange = (rating: number | null) => {
    setFilters(prev => ({ ...prev, minRating: rating }));
    setPage(1);
  };

  const handleRateChange = (rate: number | null) => {
    setFilters(prev => ({ ...prev, maxRate: rate }));
    setPage(1);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, location: e.target.value }));
    setPage(1);
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill) 
        : [...prev, skill]
    );
  };

  useEffect(() => {
    setFilters(prev => ({ ...prev, skills: selectedSkills }));
    setPage(1);
  }, [selectedSkills]);

  // Resetear filtros
  const resetFilters = () => {
    setFilters({
      search: "",
      minRating: null,
      maxRate: null,
      location: "",
      skills: []
    });
    setSelectedSkills([]);
    setPage(1);
  };

  // Renderizar skeleton mientras carga
  if (isLoading && page === 1) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Skeleton className="h-12 w-full mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Encuentra el Tasker Perfecto</h1>
          <p className="text-gray-600">
            Explora nuestra red de profesionales verificados para ayudarte con cualquier tarea
          </p>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="mb-8">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar por nombre, habilidad o servicio..."
              className="pl-10 py-6 text-lg"
              value={filters.search}
              onChange={handleSearchChange}
            />
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </Button>
            
            <Button
              variant="outline"
              onClick={resetFilters}
              className="flex items-center gap-2"
            >
              Limpiar filtros
            </Button>
          </div>

          {/* Panel de filtros */}
          {showFilters && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Rating */}
                  <div>
                    <h3 className="font-medium mb-2">Calificación mínima</h3>
                    <div className="flex flex-wrap gap-2">
                      {[4.5, 4.0, 3.5, 3.0].map(rating => (
                        <Button
                          key={rating}
                          size="sm"
                          variant={filters.minRating === rating ? "default" : "outline"}
                          onClick={() => handleRatingChange(filters.minRating === rating ? null : rating)}
                          className="flex items-center gap-1"
                        >
                          <Star className="w-4 h-4 fill-current" />
                          {rating}+
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Tarifa máxima */}
                  <div>
                    <h3 className="font-medium mb-2">Tarifa máxima ($/hora)</h3>
                    <div className="flex flex-wrap gap-2">
                      {[1000, 2000, 3000, 5000].map(rate => (
                        <Button
                          key={rate}
                          size="sm"
                          variant={filters.maxRate === rate ? "default" : "outline"}
                          onClick={() => handleRateChange(filters.maxRate === rate ? null : rate)}
                        >
                          ${rate}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Ubicación */}
                  <div>
                    <h3 className="font-medium mb-2">Ubicación</h3>
                    <Input
                      type="text"
                      placeholder="Ciudad o barrio"
                      value={filters.location}
                      onChange={handleLocationChange}
                    />
                  </div>

                  {/* Habilidades comunes */}
                  <div>
                    <h3 className="font-medium mb-2">Habilidades</h3>
                    <div className="flex flex-wrap gap-2">
                      {["Electricista", "Plomero", "Limpieza", "Jardinería", "Pintura"].map(skill => (
                        <Badge
                          key={skill}
                          variant={selectedSkills.includes(skill) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleSkill(skill)}
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Resultados */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            {data?.total || 0} taskers encontrados
          </p>
          <div className="text-sm text-gray-500">
            Página {page} de {data?.totalPages || 1}
          </div>
        </div>

        {/* Lista de taskers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {data?.taskers?.map((tasker: Tasker) => (
            <Link href={`/taskers/${tasker.id}`} key={tasker.id}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={tasker.profileImageUrl ?? undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-200 text-blue-800">
                        {tasker.firstName?.charAt(0)}{tasker.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg truncate">
                          {tasker.firstName} {tasker.lastName}
                        </h3>
                        {tasker.isTasker && (
                          <UserCheck className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-current text-yellow-400" />
                          <span>{tasker.rating?.toFixed(1) || "Nuevo"}</span>
                          <span>({tasker.reviewCount || 0})</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                        {tasker.bio || "Tasker verificado con experiencia en múltiples servicios"}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {tasker.skills?.slice(0, 3).map((skill, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {tasker.skills && tasker.skills.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{tasker.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-1 text-green-600 font-semibold">
                          <DollarSign className="w-4 h-4" />
                          {tasker.hourlyRate ? `$${tasker.hourlyRate}/hora` : "Consultar"}
                        </div>
                        
                        <div className="flex items-center gap-1 text-gray-500">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate max-w-[80px]">{tasker.location || "Ubicación"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Paginación */}
        {data?.totalPages > 1 && (
          <div className="flex justify-center gap-2 mb-8">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || isFetching}
            >
              Anterior
            </Button>
            
            {[...Array(Math.min(5, data.totalPages))].map((_, i) => {
              const pageNum = Math.max(1, page - 2) + i;
              if (pageNum > data.totalPages) return null;
              
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  onClick={() => setPage(pageNum)}
                  disabled={isFetching}
                >
                  {pageNum}
                </Button>
              );
            })}
            
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages || isFetching}
            >
              Siguiente
            </Button>
          </div>
        )}

        {/* Mensaje sin resultados */}
        {!isLoading && data?.taskers?.length === 0 && (
          <div className="text-center py-12">
            <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No se encontraron taskers</h3>
            <p className="text-gray-500 mb-4">
              Intenta ajustar tus filtros o buscar con otros términos
            </p>
            <Button onClick={resetFilters}>
              Limpiar todos los filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}