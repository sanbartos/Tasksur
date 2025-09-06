// src/pages/Dashboard.tsx
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import TaskCard from "@/components/task-card";
import { 
  Plus, 
  Clock, 
  CheckCircle, 
  MessageCircle, 
  Star,
  TrendingUp,
  Calendar,
  Settings
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { User } from "@/lib/types";
import React from "react";
import NotificationList from "@/components/NotificationList";

type Task = {
  id: number;
  title: string;
  status?: string;
  budget?: number | string;
  currency?: string;
  description?: string;
  createdAt?: string;
};

type Offer = {
  id: number;
  task: Task;
  message?: string;
  estimatedDuration?: string;
  createdAt?: string;
  amount?: number | string;
  status?: string;
};

type Stats = {
  completedTasks: number;
  totalTasks: number;
};

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("my-tasks");

  const { data: myTasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks", { clientId: user?.id }],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/tasks?clientId=${user?.id}`);
      return res.json();
    },
    enabled: !!user?.id,
  });

  const { data: assignedTasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks", { taskerId: user?.id }],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/tasks?taskerId=${user?.id}`);
      return res.json();
    },
    enabled: !!user?.id,
  });

  const { data: myOffers = [] } = useQuery<Offer[]>({
    queryKey: ["/api/users", user?.id, "offers"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/users/${user?.id}/offers`);
      return res.json();
    },
    enabled: !!user?.id,
  });

  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/users", user?.id, "stats"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/users/${user?.id}/stats`);
      return res.json();
    },
    enabled: !!user?.id,
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: number; updates: any }) => {
      return await apiRequest("PATCH", `/api/tasks/${taskId}`, updates);
    },
    onSuccess: () => {
      toast({
        title: "Tarea actualizada",
        description: "La tarea ha sido actualizada exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "No autorizado",
          description: "Necesitas iniciar sesión para actualizar tareas.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error al actualizar la tarea",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleMarkAsCompleted = (taskId: number) => {
    updateTaskMutation.mutate({
      taskId,
      updates: { status: "completed", completedAt: new Date().toISOString() },
    });
  };

  const getStatusColor = (status: string = "") => {
    switch (status) {
      case "open": return "bg-green-100 text-green-800";
      case "assigned": return "bg-blue-100 text-blue-800";
      case "in_progress": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-gray-100 text-gray-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getOfferStatusColor = (status: string = "") => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "accepted": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Section */}
      <section className="bg-gradient-to-r from-tasksur-primary to-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Panel de Control
              </h1>
              <p className="text-blue-100">
                Gestiona tus tareas, ofertas y perfil desde aquí
              </p>
            </div>
            <div className="flex gap-4 mt-6 md:mt-0">
              <Link href="/post-task">
                <Button variant="default" size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Tarea
                </Button>
              </Link>
              <Link href="/browse">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-tasksur-primary">
                  Explorar Tareas
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 text-tasksur-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-tasksur-dark">{myTasks.length}</div>
                <div className="text-tasksur-neutral">Mis Tareas</div>
              </CardContent>
            </Card>
          
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-8 h-8 text-tasksur-secondary mx-auto mb-2" />
                <div className="text-2xl font-bold text-tasksur-dark">{stats?.completedTasks || 0}</div>
                <div className="text-tasksur-neutral">Completadas</div>
              </CardContent>
            </Card>
          
            <Card>
              <CardContent className="p-6 text-center">
                <MessageCircle className="w-8 h-8 text-tasksur-accent mx-auto mb-2" />
                <div className="text-2xl font-bold text-tasksur-dark">{myOffers.length}</div>
                <div className="text-tasksur-neutral">Mis Ofertas</div>
              </CardContent>
            </Card>
          
            <Card>
              <CardContent className="p-6 text-center">
                <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-tasksur-dark">
                  {user?.rating !== undefined ? user.rating : 5.0}
                </div>
                <div className="text-tasksur-neutral">Calificación</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Dashboard Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="my-tasks">Mis Tareas</TabsTrigger>
              <TabsTrigger value="my-offers">Mis Ofertas</TabsTrigger>
              <TabsTrigger value="assigned-tasks">Tareas Asignadas</TabsTrigger>
              <TabsTrigger value="profile">Perfil</TabsTrigger>
            </TabsList>

            {/* My Tasks Tab */}
            <TabsContent value="my-tasks" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-tasksur-dark">
                  Mis Tareas Publicadas
                </h2>
                <Link href="/post-task">
                  <Button variant="default">
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Tarea
                  </Button>
                </Link>
              </div>

              {myTasks.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-tasksur-dark mb-2">
                      No has publicado ninguna tarea
                    </h3>
                    <p className="text-tasksur-neutral mb-6">
                      Publica tu primera tarea y empieza a recibir ofertas de Taskers calificados
                    </p>
                    <Link href="/post-task">
                      <Button variant="default">Publicar mi Primera Tarea</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myTasks.map((task: any) => (
                    <Card key={task.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <Badge className={getStatusColor(task.status)}>
                            {task.status === "open" ? "Abierta" :
                             task.status === "assigned" ? "Asignada" :
                             task.status === "in_progress" ? "En Progreso" :
                             task.status === "completed" ? "Completada" : task.status}
                          </Badge>
                          <div className="text-right">
                            <div className="text-lg font-bold text-tasksur-primary">
                              ${task.budget}
                            </div>
                            <div className="text-sm text-tasksur-neutral">{task.currency}</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <h3 className="font-semibold text-tasksur-dark mb-2 line-clamp-2">
                          {task.title}
                        </h3>
                        <p className="text-tasksur-neutral text-sm mb-4 line-clamp-3">
                          {task.description}
                        </p>
                      
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-tasksur-neutral">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {formatDistanceToNow(new Date(task.createdAt), { 
                                addSuffix: true, 
                                locale: es 
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Link href={`/tasks/${task.id}`} className="flex-1">
                            <Button
                              variant="default"
                              size="sm"
                              className="w-full hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                            >
                              Ver Detalles
                            </Button>
                          </Link>
                          {task.status === "in_progress" && (
                            <Button 
                              size="sm" 
                              variant="default"
                              onClick={() => handleMarkAsCompleted(task.id)}
                              disabled={updateTaskMutation.isPending}
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* My Offers Tab */}
            <TabsContent value="my-offers" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-tasksur-dark">
                  Mis Ofertas Enviadas
                </h2>
                <Link href="/browse">
                  <Button variant="default">
                    Buscar Más Tareas
                  </Button>
                </Link>
              </div>

              {myOffers.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-tasksur-dark mb-2">
                      No has enviado ninguna oferta
                    </h3>
                    <p className="text-tasksur-neutral mb-6">
                      Explora las tareas disponibles y empieza a hacer ofertas para generar ingresos
                    </p>
                    <Link href="/browse">
                      <Button variant="default">Explorar Tareas</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {myOffers.map((offer: any) => (
                    <Card key={offer.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <Link href={`/tasks/${offer.task.id}`}>
                              <h3 className="font-semibold text-tasksur-dark hover:text-tasksur-primary cursor-pointer mb-2">
                                {offer.task.title}
                              </h3>
                            </Link>
                            <p className="text-tasksur-neutral text-sm mb-3">
                              {offer.message}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-tasksur-neutral">
                              <span>Duración: {offer.estimatedDuration}</span>
                              <span>
                                Enviada {formatDistanceToNow(new Date(offer.createdAt), { 
                                  addSuffix: true, 
                                  locale: es 
                                })}
                              </span>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-xl font-bold text-tasksur-primary mb-2">
                              ${offer.amount}
                            </div>
                            <Badge className={getOfferStatusColor(offer.status)}>
                              {offer.status === "pending" ? "Pendiente" :
                               offer.status === "accepted" ? "Aceptada" :
                               offer.status === "rejected" ? "Rechazada" : offer.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Assigned Tasks Tab */}
            <TabsContent value="assigned-tasks" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-tasksur-dark">
                  Tareas Asignadas a Mí
                </h2>
              </div>

              {Array.isArray(assignedTasks) && assignedTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {assignedTasks.map((task: any) => (
                    <TaskCard key={task.id} task={task} showProgress />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-tasksur-dark mb-2">
                      No tienes tareas asignadas
                    </h3>
                    <p className="text-tasksur-neutral mb-6">
                      Cuando un cliente acepte una de tus ofertas, aparecerá aquí
                    </p>
                    <Link href="/browse">
                      <Button variant="default">Buscar Tareas</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-tasksur-dark">
                  Mi Perfil
                </h2>
                <Button
                  variant="default"
                  className="bg-tasksur-primary text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                  onClick={() => setLocation("/configuracion/perfil")}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Editar Perfil
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card className="lg:col-span-2">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-6 mb-6">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={user?.profileImageUrl ?? undefined} />
                        <AvatarFallback className="text-xl">
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-bold text-tasksur-dark mb-1">
                          {user?.firstName} {user?.lastName}
                        </h3>
                        <p className="text-tasksur-neutral mb-1">{user?.email}</p>
                        {user?.phone && <p className="text-tasksur-neutral mb-1">ðŸ“ž {user.phone}</p>}
                        {user?.location && <p className="text-tasksur-neutral mb-2">ðŸ“ {user.location}</p>}
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 fill-current text-yellow-400" />
                          <span className="font-medium">{user?.rating || "5.0"}</span>
                          <span className="text-tasksur-neutral">({(user as any)?.reviewCount || 0} reseñas)</span>
                        </div>
                      </div>
                    </div>

                    {user?.bio && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-tasksur-dark mb-2">Biografía</h4>
                        <p className="text-tasksur-neutral">{user.bio}</p>
                      </div>
                    )}

                    {user?.skills && user.skills.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-tasksur-dark mb-2">Habilidades</h4>
                        <div className="flex flex-wrap gap-2">
                          {user.skills.map((skill: string, index: number) => (
                            <Badge key={index} variant="outline">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Stats Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Estadísticas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-tasksur-primary">
                          {stats?.totalTasks || 0}
                        </div>
                        <div className="text-sm text-tasksur-neutral">Tareas Totales</div>
                      </div>
                    
                      <div className="text-center">
                        <div className="text-2xl font-bold text-tasksur-secondary">
                          {stats?.completedTasks || 0}
                        </div>
                        <div className="text-sm text-tasksur-neutral">Completadas</div>
                      </div>
                    
                      <div className="text-center">
                        <div className="text-2xl font-bold text-tasksur-accent">
                          {user?.totalEarnings
                            ? `$${Number(user.totalEarnings).toLocaleString()}`
                            : "$0"}
                        </div>
                        <div className="text-sm text-tasksur-neutral">Total Ganado</div>
                      </div>

                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-500">
                          {((stats?.completedTasks || 0) / Math.max(stats?.totalTasks || 1, 1) * 100).toFixed(0)}%
                        </div>
                        <div className="text-sm text-tasksur-neutral">Tasa de Finalización</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}




