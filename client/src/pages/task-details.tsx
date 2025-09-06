// src/pages/TaskDetail.tsx
import { useParams, useLocation } from "wouter";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ArrowLeft, MapPin, Calendar, DollarSign, Clock, Star, MessageCircle, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const offerSchema = z.object({
  amount: z.string().min(1, "El monto es requerido"),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres"),
  estimatedDuration: z.string().min(1, "La duración estimada es requerida"),
});

type OfferFormData = z.infer<typeof offerSchema>;

interface UserSummary {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  rating?: string | number | null;
  reviewCount?: number | null;
  createdAt?: string;
  totalTasks?: number;
}

interface Task {
  id: number;
  clientId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category?: { name: string };
  budget: number;
  currency: string;
  location?: string;
  createdAt: string;
  dueDate?: string;
  client: UserSummary;
}

interface Offer {
  id: number;
  amount: number;
  message: string;
  estimatedDuration: string;
  createdAt: string;
  tasker: UserSummary;
}

export default function TaskDetail() {
  const params = useParams();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showOfferDialog, setShowOfferDialog] = useState(false);

  const taskId = parseInt(params.id as string);

  const { data: task, isLoading } = useQuery<Task>({
    queryKey: ["/api/tasks", taskId],
  });

  const { data: offers = [] } = useQuery<Offer[]>({
    queryKey: ["/api/tasks", taskId, "offers"],
  });

  const form = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      amount: "",
      message: "",
      estimatedDuration: "",
    },
  });

  const createOfferMutation = useMutation({
    mutationFn: async (data: OfferFormData) => {
      return await apiRequest("POST", "/api/offers", {
        taskId,
        amount: parseFloat(data.amount),
        message: data.message,
        estimatedDuration: data.estimatedDuration,
      });
    },
    onSuccess: () => {
      toast({
        title: "¡Oferta enviada!",
        description: "Tu oferta ha sido enviada al cliente.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", taskId, "offers"] });
      setShowOfferDialog(false);
      form.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "No autorizado",
          description: "Necesitas iniciar sesión para hacer ofertas.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error al enviar la oferta",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const acceptOfferMutation = useMutation({
    mutationFn: async (offerId: number) => {
      return await apiRequest("PATCH", `/api/offers/${offerId}`, {
        status: "accepted",
      });
    },
    onSuccess: () => {
      toast({
        title: "¡Oferta aceptada!",
        description: "Has aceptado la oferta. El Tasker ha sido asignado a tu tarea.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", taskId] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", taskId, "offers"] });
    },
    onError: (error) => {
      toast({
        title: "Error al aceptar la oferta",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmitOffer = (data: OfferFormData) => {
    createOfferMutation.mutate(data);
  };

  const handleAcceptOffer = (offerId: number) => {
    acceptOfferMutation.mutate(offerId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-2xl font-bold text-tasksur-dark mb-4">Tarea no encontrada</h1>
        <Button onClick={() => setLocation("/browse")}>
          Volver a Explorar
        </Button>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "normal": return "bg-blue-100 text-blue-800";
      case "low": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-green-100 text-green-800";
      case "assigned": return "bg-blue-100 text-blue-800";
      case "in_progress": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const isTaskOwner = user?.id === task.clientId;
  const canMakeOffer = !isTaskOwner && task.status === "open" && !!user;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/browse")}
              className="text-tasksur-neutral hover:text-tasksur-primary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </div>
        </div>
      </section>

      {/* Task Details */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h1 className="text-2xl font-bold text-tasksur-dark mb-2">
                        {task.title}
                      </h1>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge className={getStatusColor(task.status)}>
                          {task.status === "open" ? "Abierta" :
                           task.status === "assigned" ? "Asignada" :
                           task.status === "in_progress" ? "En Progreso" :
                           task.status === "completed" ? "Completada" : task.status}
                        </Badge>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority === "urgent" ? "Urgente" :
                           task.priority === "high" ? "Alta" :
                           task.priority === "normal" ? "Normal" :
                           task.priority === "low" ? "Baja" : task.priority}
                        </Badge>
                        {task.category && (
                          <Badge variant="outline">
                            {task.category.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-tasksur-primary">
                        ${task.budget}
                      </div>
                      <div className="text-sm text-tasksur-neutral">{task.currency}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-tasksur-dark mb-2">Descripción</h3>
                      <p className="text-tasksur-neutral whitespace-pre-wrap">
                        {task.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-tasksur-neutral">
                        <MapPin className="w-4 h-4" />
                        <span>{task.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-tasksur-neutral">
                        <Clock className="w-4 h-4" />
                        <span>
                          Publicada {formatDistanceToNow(new Date(task.createdAt), { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </span>
                      </div>
                      {task.dueDate && (
                        <div className="flex items-center gap-2 text-tasksur-neutral">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Fecha límite: {new Date(task.dueDate).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Offers Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Ofertas ({offers.length})</span>
                    {canMakeOffer && (
                      <Dialog open={showOfferDialog} onOpenChange={setShowOfferDialog}>
                        <DialogTrigger asChild>
                          <Button 
                            className="bg-tasksur-primary hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                          >
                            Hacer Oferta
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Hacer una Oferta</DialogTitle>
                          </DialogHeader>
                          <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmitOffer)} className="space-y-4">
                              <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Monto de tu oferta</FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <Input
                                          type="number"
                                          placeholder="1000"
                                          className="pl-10"
                                          {...field}
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="estimatedDuration"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Duración estimada</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Ej: 2-3 horas, 1 día, etc."
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="message"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Mensaje para el cliente</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        placeholder="Explica por qué eres la mejor opción para esta tarea..."
                                        className="min-h-[100px]"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <div className="flex justify-end gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setShowOfferDialog(false)}
                                >
                                  Cancelar
                                </Button>
                                <Button
                                  type="submit"
                                  disabled={createOfferMutation.isPending}
                                  className="bg-tasksur-primary hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                                >
                                  {createOfferMutation.isPending ? "Enviando..." : "Enviar Oferta"}
                                </Button>
                              </div>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {offers.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-tasksur-neutral">
                        Aún no hay ofertas para esta tarea
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {offers.map((offer: any) => (
                        <div key={offer.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={offer.tasker.profileImageUrl} />
                                <AvatarFallback>
                                  {offer.tasker.firstName?.[0]}{offer.tasker.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-semibold text-tasksur-dark">
                                  {offer.tasker.firstName} {offer.tasker.lastName}
                                </div>
                                <div className="flex items-center gap-1 text-sm text-tasksur-neutral">
                                  <Star className="w-3 h-3 fill-current text-yellow-400" />
                                  <span>{offer.tasker.rating || "5.0"}</span>
                                  <span>({offer.tasker.reviewCount || 0} reseñas)</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-tasksur-primary">
                                ${offer.amount}
                              </div>
                              <div className="text-sm text-tasksur-neutral">
                                {offer.estimatedDuration}
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-tasksur-neutral mb-3">{offer.message}</p>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-tasksur-neutral">
                              {formatDistanceToNow(new Date(offer.createdAt), { 
                                addSuffix: true, 
                                locale: es 
                              })}
                            </span>
                            {isTaskOwner && task.status === "open" && (
                              <Button
                                size="sm"
                                onClick={() => handleAcceptOffer(offer.id)}
                                disabled={acceptOfferMutation.isPending}
                                className="bg-tasksur-secondary hover:bg-green-600 focus:ring-2 focus:ring-green-500"
                              >
                                Aceptar Oferta
                              </Button>
                            )}
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
              {/* Client Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Cliente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar>
                      <AvatarImage src={task.client.profileImageUrl ?? undefined} />
                      <AvatarFallback>
                        {task.client.firstName?.[0]}{task.client.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-tasksur-dark">
                        {task.client.firstName} {task.client.lastName}
                      </div>
                      <div className="text-sm text-tasksur-neutral">
                        Cliente desde {task.client.createdAt ? new Date(task.client.createdAt).getFullYear() : "Desconocido"}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-tasksur-neutral">Tareas publicadas:</span>
                      <span className="font-medium">{task.client.totalTasks || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-tasksur-neutral">Calificación:</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current text-yellow-400" />
                        <span className="font-medium">{task.client.rating || "5.0"}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Task Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-tasksur-neutral">Ofertas recibidas:</span>
                      <span className="font-medium">{offers.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-tasksur-neutral">Promedio de ofertas:</span>
                      <span className="font-medium">
                        {offers.length > 0 
                          ? `$${(offers.reduce((sum: number, offer: any) => sum + parseFloat(offer.amount), 0) / offers.length).toFixed(0)}`
                          : "N/A"
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-tasksur-neutral">Estado:</span>
                      <Badge className={getStatusColor(task.status)} variant="secondary">
                        {task.status === "open" ? "Abierta" :
                         task.status === "assigned" ? "Asignada" :
                         task.status === "in_progress" ? "En Progreso" :
                         task.status === "completed" ? "Completada" : task.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

               {/* Botón Contactar */}
               <div className="mt-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
               <Button
  variant="default"
  className="w-full hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
  onClick={() => setLocation(`/chat/${task.clientId}`)}
>
  Contactar
</Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}



