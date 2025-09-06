// src/pages/SettingsPage.tsx
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequestJson } from "@/lib/queryClient";
import { MapPin, UserRound, KeyRound, BellRing } from "lucide-react";
import { useLocation } from "wouter";
import { Separator } from "@/components/ui/separator";

type User = {
  id: string;
  email?: string | null;
  profileImageUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  location?: string | null;
  hourlyRate?: string | null;
  isTasker?: boolean;
  bio?: string | null;
  skills?: string[];
  createdAt?: string | null;
  totalEarnings?: string | null;
};

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [errorUser, setErrorUser] = useState<string | null>(null);

  const { toast } = useToast();
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [, setLocation] = useLocation();

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    bio: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [notifications, setNotifications] = useState({
    emailOffers: true,
    emailUpdates: false,
    pushNotifications: true,
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await apiRequestJson("GET", "/api/auth/user");
        if (!mounted) return;
        setUser(data);
        setProfileData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          bio: data.bio || "",
        });
      } catch (err: any) {
        if (!mounted) return;
        setErrorUser(err.message || "No se pudo obtener el usuario");
      } finally {
        if (mounted) setLoadingUser(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setLoadingProfile(true);
    try {
      const data = await apiRequestJson("PATCH", "/api/users/profile", profileData);
      toast({ 
        title: "Perfil actualizado", 
        description: "Tus datos han sido guardados correctamente.",
        duration: 3000
      });
      setUser((prev) => (prev ? { ...prev, ...data.user } : prev));
    } catch (err: any) {
      toast({
        title: "Error al guardar",
        description: err.message || "No se pudo actualizar el perfil.",
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden.",
        variant: "destructive",
        duration: 4000
      });
      return;
    }

    if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
      toast({
        title: "Contraseña insegura",
        description: "La nueva contraseña debe tener al menos 6 caracteres.",
        variant: "destructive",
        duration: 4000
      });
      return;
    }

    setLoadingPassword(true);
    try {
      await apiRequestJson("POST", "/api/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast({ 
        title: "Contraseña actualizada", 
        description: "Tu contraseña ha sido cambiada exitosamente.",
        duration: 3000
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (err: any) {
      toast({
        title: "Error al cambiar contraseña",
        description: err.message || "No se pudo cambiar la contraseña.",
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setLoadingPassword(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (errorUser) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Error: {errorUser}</h1>
        <Button onClick={() => setLocation("/login")}>Iniciar sesión</Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Usuario no encontrado</h1>
        <Button onClick={() => setLocation("/")}>Volver al inicio</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Configuración de Cuenta</h1>
        <p className="mt-2 text-gray-600">
          Gestiona tu información personal, seguridad y preferencias
        </p>
      </div>

      <div className="space-y-8">
        {/* Perfil básico */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <UserRound className="h-5 w-5 text-gray-500" />
              <CardTitle>Perfil</CardTitle>
            </div>
            <CardDescription>
              Información básica de tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              {user.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt="Avatar" 
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center text-xl font-bold text-blue-800"
                  aria-hidden="true"
                >
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {user.firstName} {user.lastName}
                </h2>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" aria-hidden="true" />
                  <span>{user.location ?? "Ubicación no especificada"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Datos Personales */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <UserRound className="h-5 w-5 text-gray-500" />
              <CardTitle>Datos Personales</CardTitle>
            </div>
            <CardDescription>
              Actualiza tu información de contacto y biografía
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="firstName">Nombre</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleProfileChange}
                />
              </div>

              <div>
                <Label htmlFor="lastName">Apellido</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleProfileChange}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={profileData.email}
                onChange={handleProfileChange}
                disabled
              />
              <p className="text-sm text-gray-500 mt-1">
                El email no se puede cambiar por motivos de seguridad
              </p>
            </div>

            <div>
              <Label htmlFor="bio">Biografía</Label>
              <Textarea
                id="bio"
                name="bio"
                value={profileData.bio}
                onChange={handleProfileChange}
                rows={4}
                placeholder="Cuéntanos un poco sobre ti..."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button 
                onClick={handleSaveProfile} 
                disabled={loadingProfile}
                className="flex-1"
              >
                {loadingProfile ? "Guardando..." : "Guardar Cambios"}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setProfileData({
                    firstName: user.firstName || "",
                    lastName: user.lastName || "",
                    email: user.email || "",
                    bio: user.bio || "",
                  });
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Seguridad */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <KeyRound className="h-5 w-5 text-gray-500" />
              <CardTitle>Seguridad</CardTitle>
            </div>
            <CardDescription>
              Cambia tu contraseña y gestiona la seguridad de tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="currentPassword">Contraseña Actual</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                />
              </div>
              <div></div> {/* Espacio vacío para alineación */}
              
              <div>
                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                />
              </div>

              <div>
                <Label htmlFor="confirmNewPassword">Confirmar Nueva Contraseña</Label>
                <Input
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  type="password"
                  value={passwordData.confirmNewPassword}
                  onChange={handlePasswordChange}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button 
                onClick={handleChangePassword} 
                disabled={loadingPassword}
                className="flex-1"
              >
                {loadingPassword ? "Cambiando..." : "Cambiar Contraseña"}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() =>
                  setPasswordData({ 
                    currentPassword: "", 
                    newPassword: "", 
                    confirmNewPassword: "" 
                  })
                }
              >
                Limpiar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notificaciones */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <BellRing className="h-5 w-5 text-gray-500" />
              <CardTitle>Preferencias de Notificaciones</CardTitle>
            </div>
            <CardDescription>
              Elige qué notificaciones quieres recibir
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label>Email de ofertas y promociones</Label>
                  <p className="text-sm text-gray-500">
                    Recibe ofertas especiales y promociones exclusivas
                  </p>
                </div>
                <Switch
                  checked={notifications.emailOffers}
                  onCheckedChange={(checked) =>
                    setNotifications((prev) => ({ ...prev, emailOffers: checked }))
                  }
                  aria-label="Email de ofertas"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label>Email de actualizaciones</Label>
                  <p className="text-sm text-gray-500">
                    Notificaciones sobre tu cuenta y actividad
                  </p>
                </div>
                <Switch
                  checked={notifications.emailUpdates}
                  onCheckedChange={(checked) =>
                    setNotifications((prev) => ({ ...prev, emailUpdates: checked }))
                  }
                  aria-label="Email de actualizaciones"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label>Notificaciones push</Label>
                  <p className="text-sm text-gray-500">
                    Alertas en tiempo real en tu dispositivo
                  </p>
                </div>
                <Switch
                  checked={notifications.pushNotifications}
                  onCheckedChange={(checked) =>
                    setNotifications((prev) => ({ ...prev, pushNotifications: checked }))
                  }
                  aria-label="Notificaciones push"
                />
              </div>
            </div>

            <Separator />

            <div className="flex justify-end">
              <Button
                onClick={() => toast({ 
                  title: "Preferencias guardadas", 
                  description: "Tus configuraciones de notificaciones han sido actualizadas.",
                  duration: 3000
                })}
              >
                Guardar Preferencias
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}