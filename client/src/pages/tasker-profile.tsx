// src/pages/TaskerProfile.tsx
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  MessageCircle,
  Award,
  TrendingUp
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";

type AuthUser = { id?: string } | null | undefined;

interface Stats {
  totalTasks?: number;
  completedTasks?: number;
  averageCompletionTime?: string;
  responseRate?: number;
}

interface Reviewer {
  profileImageUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

interface Review {
  id: string;
  reviewer: Reviewer;
  rating: number;
  createdAt: string;
  comment: string;
  task: {
    title: string;
  };
}

interface User {
  id: string;
  profileImageUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  rating?: string | number | null;
  reviewCount?: number | null;
  isTasker?: boolean;
  bio?: string | null;
  hourlyRate?: string | null;
  location?: string | null;
  skills?: string[];
  createdAt?: string;
  totalEarnings?: string | null;
  responseTime?: string | null;
  completedTasks?: number | null;
  joinedAt?: string | null;
}

export default function TaskerProfile() {
  const params = useParams();
  const taskerId = params.id as string;
  const [, setLocation] = useLocation();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/users", taskerId],
  });

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ["/api/users", taskerId, "reviews"],
  });

  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/users", taskerId, "stats"],
  });

  const { user: loggedInUser } = useAuth() as { user?: AuthUser };

  const isOwner = loggedInUser?.id !== undefined && user?.id !== undefined
    ? loggedInUser.id === user.id
    : false;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-2xl font-bold text-tasksur-dark mb-4">Tasker no encontrado</h1>
        <Button onClick={() => setLocation("/browse")}>
          Volver a Explorar
        </Button>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < Math.floor(rating) 
            ? "fill-current text-yellow-400" 
            : "text-gray-300"
        }`}
      />
    ));
  };

  const ratingValue = parseFloat(String(user.rating) || "0");
  const formattedRating = ratingValue > 0 ? ratingValue.toFixed(1) : "Nuevo";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/browse")}
              className="text-gray-600 hover:text-primary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div className="ml-auto flex gap-2">
              {!isOwner && (
                <Button
                  variant="outline"
                  onClick={() => setLocation(`/chat/${user.id}`)}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Mensaje
                </Button>
              )}
              {!isOwner && (
                <Button
                  className="bg-primary hover:bg-primary/90 flex items-center gap-2"
                  onClick={() => setLocation("/post-task")}
                >
                  <Calendar className="w-4 h-4" />
                  Contratar
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Profile Content */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Header */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex flex-col items-center">
                      <Avatar className="w-32 h-32 ring-4 ring-white ring-opacity-50 shadow-xl">
                        <AvatarImage 
                          src={user.profileImageUrl ?? undefined} 
                          className="object-cover"
                        />
                        <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-100 to-indigo-200 text-blue-800">
                          {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {user.isTasker && (
                        <Badge className="mt-4 bg-green-100 text-green-800 hover:bg-green-100 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Tasker Verificado
                        </Badge>
                      )}
                    </div>
                  
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-gray-900 mb-3">
                        {user.firstName} {user.lastName}
                      </h1>
                    
                      <div className="flex flex-wrap items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="flex">{renderStars(ratingValue)}</div>
                          <span className="text-lg font-semibold">{formattedRating}</span>
                          <span className="text-gray-500">({user.reviewCount || 0} reseñas)</span>
                        </div>
                      </div>
                    
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center gap-3 text-gray-600">
                          <MapPin className="w-5 h-5 text-primary" />
                          <span>{user.location || "Ubicación no especificada"}</span>
                        </div>
                        
                        {user.hourlyRate && (
                          <div className="flex items-center gap-3">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            <span className="text-xl font-bold text-green-700">${user.hourlyRate}/hora</span>
                          </div>
                        )}
                        
                        {user.responseTime && (
                          <div className="flex items-center gap-3 text-gray-600">
                            <Clock className="w-5 h-5 text-primary" />
                            <span>Respuesta en {user.responseTime}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-3 text-gray-600">
                          <Calendar className="w-5 h-5 text-primary" />
                          <span>Miembro desde {user.joinedAt ? new Date(user.joinedAt).getFullYear() : "Desconocido"}</span>
                        </div>
                      </div>
                      
                      {user.bio && (
                        <p className="text-gray-700 whitespace-pre-wrap mb-6">
                          {user.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Skills Section */}
              {user.skills && user.skills.length > 0 && (
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-primary" />
                      Habilidades
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {user.skills.map((skill: string, index: number) => (
                        <Badge 
                          key={index} 
                          variant="default" 
                          className="px-3 py-1.5 text-sm bg-primary/10 text-primary hover:bg-primary/20"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Reviews Section */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      Reseñas ({reviews.length})
                    </span>
                    {reviews.length > 0 && (
                      <div className="text-sm text-gray-500">
                        Promedio: {ratingValue.toFixed(1)}
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {reviews.length === 0 ? (
                    <div className="text-center py-12">
                      <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Sin reseñas aún</h3>
                      <p className="text-gray-500">
                        Este Tasker aún no tiene reseñas. ¡Sé el primero en contratarlo!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {reviews.map((review: any) => (
                        <div 
                          key={review.id} 
                          className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-4">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={review.reviewer.profileImageUrl} />
                                <AvatarFallback>
                                  {review.reviewer.firstName?.charAt(0)}{review.reviewer.lastName?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {review.reviewer.firstName} {review.reviewer.lastName}
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                  <div className="flex">{renderStars(review.rating)}</div>
                                  <span className="text-sm text-gray-500">
                                    {formatDistanceToNow(new Date(review.createdAt), { 
                                      addSuffix: true, 
                                      locale: es 
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        
                          <p className="text-gray-700 mb-3">{review.comment}</p>
                        
                          <div className="text-sm text-gray-500">
                            Tarea: <span className="font-medium">{review.task.title}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats Card */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Estadísticas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-5">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {stats?.totalTasks || 0}
                      </div>
                      <div className="text-sm text-gray-600">Tareas Totales</div>
                    </div>
                  
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {stats?.completedTasks || 0}
                      </div>
                      <div className="text-sm text-gray-600">Tareas Completadas</div>
                    </div>
                  
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {stats?.responseRate || 0}%
                      </div>
                      <div className="text-sm text-gray-600">Tasa de Respuesta</div>
                    </div>
                    
                    {stats?.averageCompletionTime && (
                      <div className="text-center p-4 bg-amber-50 rounded-lg">
                        <div className="text-2xl font-bold text-amber-600">
                          {stats.averageCompletionTime}
                        </div>
                        <div className="text-sm text-gray-600">Tiempo Promedio</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Contact Card */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Contactar</CardTitle>
                </CardHeader>
                <CardContent>
                  {isOwner ? (
                    <div className="space-y-3">
                      <Button 
                        className="w-full bg-primary hover:bg-primary/90"
                        onClick={() => setLocation("/post-task")}
                      >
                        Publicar una Tarea
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setLocation("/settings/profile")}
                      >
                        Editar Perfil
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button
                        className="w-full bg-primary hover:bg-primary/90 flex items-center gap-2"
                        onClick={() => setLocation("/post-task")}
                      >
                        <Calendar className="w-4 h-4" />
                        Contratar para una Tarea
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full flex items-center gap-2"
                        onClick={() => setLocation(`/chat/${user.id}`)}
                      >
                        <MessageCircle className="w-4 h-4" />
                        Enviar Mensaje
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Earnings Card (if applicable) */}
              {user.totalEarnings && parseFloat(user.totalEarnings) > 0 && (
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Ganancias</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center p-4 bg-emerald-50 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-600">
                        ${parseFloat(user.totalEarnings).toLocaleString('es-UY')}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total Ganado en TaskSur
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Verification Badge */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <div className="font-bold text-gray-900 mb-2">
                    Tasker Verificado
                  </div>
                  <p className="text-sm text-gray-600">
                    Identidad y habilidades verificadas por TaskSur para garantizar calidad y confianza
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}




