// src/pages/ProfilePage.tsx
import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { useAuth } from "@/contexts/AuthContext"; // Asegúrate de que esta ruta sea correcta
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabaseClient";
import {
  Upload,
  User as UserIcon,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Star,
  Bell,
  Settings,
  Shield,
  CreditCard,
  LogOut
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
  const { user, setUser } = useUser();
  const { logout } = useAuth();
  const { notifications, markAsRead } = useNotifications(user?.id || "");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "notifications" | "settings">("profile");

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    location: user?.location || "",
    bio: user?.bio || "",
    hourlyRate: user?.hourlyRate ? String(user.hourlyRate) : "",
    isTasker: !!user?.isTasker,
  });

  // Sincroniza formData con user cuando cambia
  useEffect(() => {
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      location: user?.location || "",
      bio: user?.bio || "",
      hourlyRate: user?.hourlyRate ? String(user.hourlyRate) : "",
      isTasker: !!user?.isTasker,
    });
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: keyof typeof formData) => {
    setFormData(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSave = async () => {
    if (!user) return;

    const hourlyRateNumber = formData.hourlyRate === "" ? null : Number(formData.hourlyRate);
    if (formData.hourlyRate !== "" && (isNaN(hourlyRateNumber!) || hourlyRateNumber! < 0)) {
      console.warn("Tarifa inválida");
      return;
    }

    setLoading(true);
    try {
      const updateObj: any = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone || null,
        location: formData.location || null,
        bio: formData.bio || null,
        updated_at: new Date().toISOString(),
        is_tasker: formData.isTasker,
      };
      if (hourlyRateNumber !== null) updateObj.hourly_rate = hourlyRateNumber;
      else updateObj.hourly_rate = null;

      const { error } = await supabase
        .from("users")
        .update(updateObj)
        .eq("id", user.id);

      if (error) throw error;

      setUser({
        ...user,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
        hourlyRate: hourlyRateNumber,
        isTasker: formData.isTasker,
      });

      setIsEditing(false);
    } catch (err: any) {
      console.error("Error updating profile:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    setUploading(true);
    try {
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = (data as any)?.publicUrl;
      if (!publicUrl) throw new Error("No public URL returned");

      const { error: updateError } = await supabase
        .from("users")
        .update({ profile_image_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setUser({ ...user, profileImageUrl: publicUrl });
    } catch (err: any) {
      console.error("Error uploading avatar:", err.message);
    } finally {
      setUploading(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
            <p className="text-gray-600 mt-1">Gestiona tu información personal y preferencias</p>
          </div>
          <Button variant="outline" onClick={logout} className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "profile"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            <UserIcon className="w-4 h-4 inline mr-2" />
            Perfil
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "notifications"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("notifications")}
          >
            <Bell className="w-4 h-4 inline mr-2" />
            Notificaciones
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "settings"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Configuración
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Avatar Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5" />
                    Foto de Perfil
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={user.profileImageUrl || undefined} alt="Foto de perfil" />
                        <AvatarFallback className="text-xl bg-gradient-to-br from-blue-100 to-indigo-200 text-blue-800">
                          {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {uploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    <div className="text-center sm:text-left">
                      <label className="cursor-pointer">
                        <Button variant="outline" disabled={uploading}>
                          <Upload className="mr-2 h-4 w-4" />
                          {uploading ? "Subiendo..." : "Cambiar Foto"}
                        </Button>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          disabled={uploading}
                          aria-label="Subir nueva foto de perfil"
                        />
                      </label>
                      <p className="text-sm text-gray-500 mt-2">JPG, PNG o GIF. Máx 2MB</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Información Personal</CardTitle>
                  <CardDescription>
                    {isEditing ? "Edita tu información personal" : "Información básica de tu perfil"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isEditing ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">Nombre</Label>
                          <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Apellido</Label>
                          <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} disabled />
                        <p className="text-sm text-gray-500 mt-1">El email no se puede cambiar</p>
                      </div>

                      <div>
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} />
                      </div>

                      <div>
                        <Label htmlFor="location">Ubicación</Label>
                        <Input id="location" name="location" value={formData.location} onChange={handleInputChange} />
                      </div>

                      <div>
                        <Label htmlFor="bio">Biografía</Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          rows={4}
                          placeholder="Cuéntanos un poco sobre ti..."
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <Label htmlFor="isTasker">Modo Tasker</Label>
                          <p className="text-sm text-gray-500">Activa para ofrecer servicios</p>
                        </div>
                        <Switch
                          id="isTasker"
                          checked={formData.isTasker}
                          onCheckedChange={() => handleSwitchChange("isTasker")}
                        />
                      </div>

                      {formData.isTasker && (
                        <div>
                          <Label htmlFor="hourlyRate">Tarifa por Hora (€)</Label>
                          <Input
                            id="hourlyRate"
                            name="hourlyRate"
                            type="number"
                            value={formData.hourlyRate}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            placeholder="Ej: 25.00"
                          />
                        </div>
                      )}

                      <div className="flex gap-3 pt-4">
                        <Button onClick={handleSave} disabled={loading} className="flex-1">
                          {loading ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            setFormData({
                              firstName: user.firstName || "",
                              lastName: user.lastName || "",
                              email: user.email || "",
                              phone: user.phone || "",
                              location: user.location || "",
                              bio: user.bio || "",
                              hourlyRate: user.hourlyRate ? String(user.hourlyRate) : "",
                              isTasker: !!user.isTasker,
                            });
                          }}
                          className="flex-1"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center gap-3">
                          <UserIcon className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500">Nombre</p>
                            <p className="font-medium">{user.firstName} {user.lastName}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{user.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500">Teléfono</p>
                            <p className="font-medium">{user.phone || "No especificado"}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500">Ubicación</p>
                            <p className="font-medium">{user.location || "No especificada"}</p>
                          </div>
                        </div>

                        {user.isTasker && (
                          <>
                            <div className="flex items-center gap-3">
                              <DollarSign className="h-5 w-5 text-gray-500" />
                              <div>
                                <p className="text-sm text-gray-500">Tarifa por Hora</p>
                                <p className="font-medium">
                                  {user.hourlyRate ? `€${user.hourlyRate}/hora` : "No especificada"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <Star className="h-5 w-5 text-gray-500" />
                              <div>
                                <p className="text-sm text-gray-500">Calificación</p>
                                <p className="font-medium">
                                  {user.rating ? `${user.rating} (${user.reviewCount} reseñas)` : "Sin calificaciones"}
                                </p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      <div>
                        <Label>Biografía</Label>
                        <p className="mt-1 text-gray-700">{user.bio || "No hay biografía disponible"}</p>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <Label>Modo Tasker</Label>
                          <p className="text-sm text-gray-500">
                            {user.isTasker ? "Activo - Ofreciendo servicios" : "Inactivo - Solo buscando servicios"}
                          </p>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            user.isTasker ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.isTasker ? "ACTIVO" : "INACTIVO"}
                        </div>
                      </div>

                      <Button onClick={() => setIsEditing(true)} className="w-full">
                        Editar Perfil
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tareas Publicadas</span>
                      <span className="font-medium">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tareas Completadas</span>
                      <span className="font-medium">8</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Calificación Promedio</span>
                      <span className="font-medium">4.8</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ganancias Totales</span>
                      <span className="font-medium">€1,240</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-500" />
                    Verificación
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Email verificado</span>
                      <span className="text-green-600 font-medium">✓</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Teléfono verificado</span>
                      <span className="text-gray-400">-</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Identidad verificada</span>
                      <span className="text-gray-400">-</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    Verificar ahora
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Métodos de Pago
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">Gestiona tus métodos de pago y facturación</p>
                  <Button variant="outline" className="w-full">
                    Configurar pagos
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificaciones
              </CardTitle>
              <CardDescription>
                {unreadCount > 0 ? `${unreadCount} notificaciones sin leer` : "No hay notificaciones nuevas"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Sin notificaciones</h3>
                    <p className="text-gray-500">Aquí aparecerán tus notificaciones importantes</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border ${
                        notification.is_read ? "bg-gray-50 border-gray-200" : "bg-blue-50 border-blue-200"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{notification.title}</p>
                          <p className="text-gray-600 mt-1">{notification.message}</p>
                        </div>
                        {!notification.is_read && (
                          <Button size="sm" variant="ghost" onClick={() => markAsRead(notification.id)} className="ml-4">
                            Marcar como leído
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-3">
                        {new Date(notification.created_at).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración de Cuenta</CardTitle>
                  <CardDescription>Gestiona tus preferencias y configuración de seguridad</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Notificaciones por Email</h3>
                      <p className="text-sm text-gray-500">Recibe actualizaciones importantes por correo</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Notificaciones Push</h3>
                      <p className="text-sm text-gray-500">Recibe notificaciones en tu dispositivo</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Ubicación</h3>
                      <p className="text-sm text-gray-500">Usar ubicación para sugerencias personalizadas</p>
                    </div>
                    <Switch />
                  </div>

                  <Separator />

                  <div className="pt-4">
                    <h3 className="font-medium text-lg mb-4">Seguridad</h3>
                    <div className="space-y-4">
                      <Button variant="outline" className="w-full justify-between">
                        Cambiar contraseña
                        <span className="text-gray-400">&gt;</span>
                      </Button>
                      <Button variant="outline" className="w-full justify-between">
                        Dispositivos conectados
                        <span className="text-gray-400">&gt;</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-between text-red-600 hover:text-red-700"
                        onClick={() => (window.location.href = "/configuracion/eliminar-cuenta")}
                      >
                        Eliminar cuenta
                        <span className="text-gray-400">&gt;</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Privacidad</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">Controla quién puede ver tu información</p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Perfil público</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Mostrar en búsquedas</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Compartir estadísticas</span>
                      <Switch />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}