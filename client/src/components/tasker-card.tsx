// src/components/TaskerCard.tsx
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, DollarSign, CheckCircle, Clock } from "lucide-react";
import { Link } from "wouter";

// Definición del tipo Tasker basado en tu estructura
interface Tasker {
  id: string | number;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  rating?: string | number | null;
  reviewCount?: number | null;
  isTasker?: boolean;
  bio?: string | null;
  hourlyRate?: string | null;
  location?: string | null;
  skills?: string[];
  // Campos adicionales para mejor presentación
  responseTime?: string | null; // Ej: "2 horas", "1 día"
  completedTasks?: number | null;
  joinedAt?: string | null; // Fecha ISO
}

interface TaskerCardProps {
  tasker: Tasker;
}

/**
 * TaskerCard - Componente optimizado para mostrar información de un tasker
 * Mejoras:
 * - Memoización de cálculos pesados
 * - Manejo robusto de valores nulos/undefined
 * - Accesibilidad mejorada (ARIA)
 * - Formato de moneda y fechas localizado
 * - Diseño responsive y visual mejorado
 * - Tipos estrictos
 */
export default React.memo(function TaskerCard({ tasker }: TaskerCardProps) {
  // Validación de datos requeridos
  if (!tasker || !tasker.id) {
    return null;
  }

  // Memoización de valores calculados
  const fullName = useMemo(() => {
    const first = tasker.firstName?.trim() || "";
    const last = tasker.lastName?.trim() || "";
    return `${first} ${last}`.trim() || "Tasker";
  }, [tasker.firstName, tasker.lastName]);

  const initials = useMemo(() => {
    const first = tasker.firstName?.charAt(0) || "";
    const last = tasker.lastName?.charAt(0) || "";
    return `${first}${last}`.toUpperCase() || "TB";
  }, [tasker.firstName, tasker.lastName]);

  const ratingValue = useMemo(() => {
    if (tasker.rating === undefined || tasker.rating === null) return null;
    const value = typeof tasker.rating === "string" ? parseFloat(tasker.rating) : tasker.rating;
    return isNaN(value) ? null : value;
  }, [tasker.rating]);

  const formattedRating = ratingValue !== null ? ratingValue.toFixed(1) : "Nuevo";
  const formattedRate = useMemo(() => {
    if (!tasker.hourlyRate) return "Consultar tarifa";
    const value = typeof tasker.hourlyRate === "string" ? parseFloat(tasker.hourlyRate) : tasker.hourlyRate;
    if (isNaN(value)) return "Consultar tarifa";
    return new Intl.NumberFormat("es-UY", {
      style: "currency",
      currency: "UYU",
      maximumFractionDigits: 0,
    }).format(value) + "/hora";
  }, [tasker.hourlyRate]);

  const getRatingColor = useMemo(() => {
    if (ratingValue === null) return "text-gray-400";
    if (ratingValue >= 4.5) return "text-green-600";
    if (ratingValue >= 4.0) return "text-yellow-600";
    return "text-orange-600";
  }, [ratingValue]);

  const joinedDate = useMemo(() => {
    if (!tasker.joinedAt) return null;
    try {
      return new Date(tasker.joinedAt).toLocaleDateString("es-ES", {
        month: "short",
        year: "numeric",
      });
    } catch {
      return null;
    }
  }, [tasker.joinedAt]);

  // Renderizado condicional de badges de habilidades
  const SkillsBadges = useMemo(() => {
    if (!tasker.skills || tasker.skills.length === 0) return null;
    
    const visibleSkills = tasker.skills.slice(0, 3);
    const remainingCount = tasker.skills.length - 3;
    
    return (
      <div className="mt-3">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Especialidades</h4>
        <div className="flex flex-wrap gap-1">
          {visibleSkills.map((skill, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {skill}
            </Badge>
          ))}
          {remainingCount > 0 && (
            <Badge variant="outline" className="text-xs">
              +{remainingCount} más
            </Badge>
          )}
        </div>
      </div>
    );
  }, [tasker.skills]);

  return (
    <Card 
      className="h-full hover:shadow-lg transition-all duration-300 border border-gray-200 rounded-xl overflow-hidden"
      data-testid={`tasker-card-${tasker.id}`}
      role="article"
      aria-labelledby={`tasker-name-${tasker.id}`}
    >
      {/* Header con avatar y datos principales */}
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-start space-x-4">
          <Avatar className="h-14 w-14 ring-2 ring-white ring-opacity-50 shadow">
            <AvatarImage
              src={tasker.profileImageUrl ?? undefined}
              alt={`Foto de perfil de ${fullName}`}
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-200 text-blue-800 font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <CardTitle 
              id={`tasker-name-${tasker.id}`}
              className="text-lg font-bold leading-tight truncate text-gray-900"
            >
              {fullName}
            </CardTitle>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              {/* Rating */}
              <div className={`flex items-center space-x-1 ${getRatingColor}`}>
                <Star className="w-4 h-4 fill-current" aria-hidden="true" />
                <span className="text-sm font-semibold">
                  {formattedRating}
                </span>
              </div>

              {/* Contador de reseñas */}
              <span className="text-gray-500 text-sm">
                ({tasker.reviewCount ?? 0} {tasker.reviewCount === 1 ? "reseña" : "reseñas"})
              </span>

              {/* Badge de verificación */}
              {tasker.isTasker && (
                <Badge variant="default" className="text-xs bg-green-100 text-green-800 hover:bg-green-100">
                  <CheckCircle className="w-3 h-3 mr-1" aria-hidden="true" />
                  Verificado
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Contenido principal */}
      <CardContent className="space-y-4 pt-4">
        {/* Biografía */}
        {tasker.bio && (
          <p className="text-gray-700 text-sm line-clamp-2 leading-relaxed">
            {tasker.bio}
          </p>
        )}

        {/* Información de precios y ubicación */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-green-600 flex-shrink-0" aria-hidden="true" />
            <span className="font-semibold text-green-700">{formattedRate}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span>{tasker.location || "Ubicación no especificada"}</span>
          </div>

          {/* Información adicional */}
          <div className="flex flex-wrap gap-3 pt-1 text-xs text-gray-500">
            {tasker.completedTasks !== undefined && tasker.completedTasks !== null && (
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" aria-hidden="true" />
                <span>{tasker.completedTasks} tareas</span>
              </div>
            )}
            
            {tasker.responseTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" aria-hidden="true" />
                <span>Respuesta en {tasker.responseTime}</span>
              </div>
            )}
            
            {joinedDate && (
              <div className="flex items-center gap-1">
                <span>Desde {joinedDate}</span>
              </div>
            )}
          </div>
        </div>

        {/* Habilidades */}
        {SkillsBadges}

        {/* Estado y CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs font-medium text-gray-600">Disponible ahora</span>
          </div>
          
          <Link href={`/taskers/${tasker.id}`} className="w-auto">
            <Button 
              variant="default" 
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
              aria-label={`Ver perfil detallado de ${fullName}`}
            >
              Ver Perfil
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
});