// src/pages/NotificacionesPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

interface NotificationPreferences {
  emailTaskUpdates: boolean;
  emailMessages: boolean;
  emailPayments: boolean;
  pushTaskUpdates: boolean;
  pushMessages: boolean;
  smsUrgent: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  emailTaskUpdates: true,
  emailMessages: true,
  emailPayments: true,
  pushTaskUpdates: false,
  pushMessages: false,
  smsUrgent: false,
};

const LOCAL_STORAGE_KEY = "app_notification_preferences";

export default function NotificacionesPage() {
  const { user, fetchUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Estado único para preferencias
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);

  // Inicializar desde user.notifications o desde localStorage o por defecto
  useEffect(() => {
    // Preferir preferencias del servidor (user) si existen
    const initFromUser = (): NotificationPreferences | null => {
      if (!user) return null;
      // user.notifications puede venir con keys parciales
      const ns: any = (user as any).notifications;
      if (!ns) return null;
      return {
        emailTaskUpdates: ns.emailTaskUpdates ?? DEFAULT_PREFERENCES.emailTaskUpdates,
        emailMessages: ns.emailMessages ?? DEFAULT_PREFERENCES.emailMessages,
        emailPayments: ns.emailPayments ?? DEFAULT_PREFERENCES.emailPayments,
        pushTaskUpdates: ns.pushTaskUpdates ?? DEFAULT_PREFERENCES.pushTaskUpdates,
        pushMessages: ns.pushMessages ?? DEFAULT_PREFERENCES.pushMessages,
        smsUrgent: ns.smsUrgent ?? DEFAULT_PREFERENCES.smsUrgent,
      };
    };

    const fromUser = initFromUser();
    if (fromUser) {
      setPrefs(fromUser);
      return;
    }

    // Si no hay user o notifs, intentar cargar localStorage
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<NotificationPreferences>;
        setPrefs(prev => ({ ...prev, ...parsed }));
        return;
      }
    } catch (err) {
      // ignore localStorage errors
      console.warn("No se pudo leer preferencias de localStorage", err);
    }

    // fallback a defaults
    setPrefs(DEFAULT_PREFERENCES);
  }, [user]);

  const changed = useMemo(() => {
    // Si no hay user, comparo con defaults
    const server = (user as any)?.notifications ?? null;
    if (!server) {
      // comparar con localStorage o defaults
      try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<NotificationPreferences>;
          return Object.keys(DEFAULT_PREFERENCES).some(
            (k) => (prefs as any)[k] !== (parsed as any)[k]
          );
        }
      } catch {}
      return Object.keys(DEFAULT_PREFERENCES).some(
        (k) => (prefs as any)[k] !== (DEFAULT_PREFERENCES as any)[k]
      );
    }
    // existe server: comparar cada key
    return Object.keys(DEFAULT_PREFERENCES).some(
      (k) => (prefs as any)[k] !== (server as any)[k]
    );
  }, [prefs, user]);

  // Handler genérico para switches
  function setPref<K extends keyof NotificationPreferences>(key: K, value: NotificationPreferences[K]) {
    setPrefs(prev => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      // POST/PUT al backend
      const res = await fetch("/api/user/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(prefs),
      });

      if (res.ok) {
        toast.success("Preferencias guardadas correctamente");
        setLastSavedAt(new Date());
        // Guardar también en localStorage para persistencia offline
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(prefs));
        } catch (err) {
          console.warn("No se pudo guardar localmente", err);
        }
        // Refrescar usuario si el hook lo permite
        try {
          await fetchUser?.();
        } catch (err) {
          // no crítico
          console.warn("No se pudo refrescar usuario tras guardar preferencias", err);
        }
        return;
      }

      // Si el servidor responde con error, intentar leer body para mensaje
      let bodyText = "";
      try {
        const json = await res.json();
        bodyText = json?.message || json?.error || JSON.stringify(json);
      } catch {
        bodyText = await res.text().catch(() => "");
      }

      // Si status indica no implementado o similar, fallback a guardado local
      if (res.status === 404 || res.status === 501) {
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(prefs));
          toast.success("Preferencias guardadas localmente (backend no disponible)");
          setLastSavedAt(new Date());
          return;
        } catch {
          // continue to throw
        }
      }

      throw new Error(bodyText || `Error al guardar (status ${res.status})`);
    } catch (err: any) {
      console.error("Error guardando preferencias:", err);
      toast.error(err?.message || "Error al guardar preferencias");
    } finally {
      setSaving(false);
    }
  }

  // Revertir a las preferencias del servidor / defaults
  function handleRevert() {
    if ((user as any)?.notifications) {
      const ns = (user as any).notifications;
      setPrefs({
        emailTaskUpdates: ns.emailTaskUpdates ?? DEFAULT_PREFERENCES.emailTaskUpdates,
        emailMessages: ns.emailMessages ?? DEFAULT_PREFERENCES.emailMessages,
        emailPayments: ns.emailPayments ?? DEFAULT_PREFERENCES.emailPayments,
        pushTaskUpdates: ns.pushTaskUpdates ?? DEFAULT_PREFERENCES.pushTaskUpdates,
        pushMessages: ns.pushMessages ?? DEFAULT_PREFERENCES.pushMessages,
        smsUrgent: ns.smsUrgent ?? DEFAULT_PREFERENCES.smsUrgent,
      });
      toast.success("Preferencias revertidas a las del servidor");
      return;
    }

    // Si no hay servidor, revertir a defaults
    setPrefs(DEFAULT_PREFERENCES);
    toast.success("Preferencias revertidas a los valores por defecto");
  }

  // Reset total a defaults
  function handleResetDefaults() {
    setPrefs(DEFAULT_PREFERENCES);
    toast.success("Preferencias restauradas a los valores por defecto");
  }

  // Muestra spinner si todavía no hay user y estamos en estado "loading inicial"
  // (esto es opcional; en muchos casos la app ya muestra un layout)
  useEffect(() => {
    if (!user) {
      setLoading(true);
      const t = setTimeout(() => setLoading(false), 400);
      return () => clearTimeout(t);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Notificaciones</h1>
      <p className="text-muted-foreground mb-6">
        Elige qué notificaciones quieres recibir y cómo.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Actualizaciones de tareas</p>
              <p className="text-sm text-muted-foreground">Cambios en el estado de tus tareas</p>
            </div>
            <Switch
              aria-label="Email - actualizaciones de tareas"
              checked={prefs.emailTaskUpdates}
              onCheckedChange={(v) => setPref("emailTaskUpdates", !!v)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Mensajes nuevos</p>
              <p className="text-sm text-muted-foreground">Cuando recibas un mensaje de otro usuario</p>
            </div>
            <Switch
              aria-label="Email - mensajes nuevos"
              checked={prefs.emailMessages}
              onCheckedChange={(v) => setPref("emailMessages", !!v)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Pagos y facturación</p>
              <p className="text-sm text-muted-foreground">Confirmaciones de pago, recordatorios, etc.</p>
            </div>
            <Switch
              aria-label="Email - pagos y facturación"
              checked={prefs.emailPayments}
              onCheckedChange={(v) => setPref("emailPayments", !!v)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Notificaciones Push</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Actualizaciones de tareas</p>
              <p className="text-sm text-muted-foreground">En tu navegador o app móvil</p>
            </div>
            <Switch
              aria-label="Push - actualizaciones de tareas"
              checked={prefs.pushTaskUpdates}
              onCheckedChange={(v) => setPref("pushTaskUpdates", !!v)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Mensajes nuevos</p>
              <p className="text-sm text-muted-foreground">Notificaciones instantáneas de mensajes</p>
            </div>
            <Switch
              aria-label="Push - mensajes nuevos"
              checked={prefs.pushMessages}
              onCheckedChange={(v) => setPref("pushMessages", !!v)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>SMS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Alertas urgentes</p>
              <p className="text-sm text-muted-foreground">Solo para situaciones críticas (p. ej. pago fallido)</p>
            </div>
            <Switch
              aria-label="SMS - alertas urgentes"
              checked={prefs.smsUrgent}
              onCheckedChange={(v) => setPref("smsUrgent", !!v)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex gap-3 w-full sm:w-auto">
          <Button onClick={handleSave} disabled={saving || !changed}>
            {saving ? "Guardando..." : changed ? "Guardar Cambios" : "Guardar"}
          </Button>

          <Button variant="outline" onClick={handleRevert} disabled={saving || !changed}>
            Revertir
          </Button>

          <Button variant="ghost" onClick={handleResetDefaults} disabled={saving}>
            Restaurar valores por defecto
          </Button>
        </div>

        <div className="text-sm text-muted-foreground ml-0 sm:ml-4">
          {lastSavedAt ? (
            <span>Último guardado: {lastSavedAt.toLocaleString()}</span>
          ) : (
            <span>No guardado recientemente</span>
          )}
        </div>
      </div>
    </div>
  );
}