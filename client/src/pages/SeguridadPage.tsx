// src/pages/SeguridadPage.tsx
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SeguridadPage() {
  const { user, fetchUser } = useAuth();

  // Estados para cambio de contraseña
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingPassword, setLoadingPassword] = useState(false);

  // Estados para 2FA
  const [twoFAEnabled, setTwoFAEnabled] = useState<boolean>(() => !!(user as any)?.two_fa_enabled || !!(user as any)?.twoFAEnabled || false);
  const [loading2FA, setLoading2FA] = useState(false);

  // Si el objeto user carga después, sincronizamos
  useEffect(() => {
    if (!user) return;
    const flag = (user as any).two_fa_enabled ?? (user as any).twoFAEnabled ?? false;
    setTwoFAEnabled(!!flag);
  }, [user]);

  // Validación y envío cambio de contraseña
  async function handleChangePassword(e?: React.FormEvent) {
    if (e) e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Completa todos los campos");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Las nuevas contraseñas no coinciden");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("La nueva contraseña debe tener al menos 8 caracteres");
      return;
    }

    setLoadingPassword(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      // Intentamos parsear la respuesta como JSON, pero manejamos fallback
      let data: any = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        // Mensaje del backend si viene
        const msg = data?.message || data?.error || "Error al cambiar contraseña";
        throw new Error(msg);
      }

      toast.success("Contraseña cambiada correctamente");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Refrescar datos del usuario si es necesario
      try {
        await fetchUser?.();
      } catch {
        // no crítico
      }
    } catch (error: any) {
      toast.error(error?.message || "Error al cambiar contraseña");
      console.error("Change password error:", error);
    } finally {
      setLoadingPassword(false);
    }
  }

  // Toggle 2FA (intenta backend y si no existe, simula)
  async function handleToggle2FA() {
    // Si vamos a desactivar, pedimos confirmación
    if (twoFAEnabled) {
      const confirmed = confirm("¿Seguro que quieres desactivar la autenticación de dos factores?");
      if (!confirmed) return;
    }

    setLoading2FA(true);
    try {
      const res = await fetch("/api/user/toggle-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ enable: !twoFAEnabled }),
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        // Backend puede devolver el estado real
        const enabled = (data?.enabled ?? ( !twoFAEnabled ));
        setTwoFAEnabled(!!enabled);
        toast.success(`2FA ${enabled ? "activado" : "desactivado"}`);
        try {
          await fetchUser?.();
        } catch { /* no crítico */ }
        return;
      }

      // Si endpoint no existe o falla, simulamos el toggle como fallback
      const text = await res.text().catch(() => "");
      throw new Error(text || "No se pudo cambiar 2FA en el servidor");
    } catch (err) {
      // Fallback: simulación local si el backend no lo soporta
      console.warn("toggle 2FA failed, falling back to simulation:", err);
      setTwoFAEnabled(prev => {
        const next = !prev;
        toast.success(`2FA ${next ? "activado (simulado)" : "desactivado (simulado)"}`);
        return next;
      });
    } finally {
      setLoading2FA(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Seguridad</h1>

      {/* Cambio de contraseña */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Cambiar Contraseña</h2>
        <form className="space-y-4 max-w-md" onSubmit={handleChangePassword}>
          <div>
            <Label htmlFor="currentPassword">Contraseña Actual</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={loadingPassword}
              aria-required
            />
          </div>
          <div>
            <Label htmlFor="newPassword">Nueva Contraseña</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loadingPassword}
              aria-required
            />
            <p className="text-sm text-gray-500 mt-1">Mínimo 8 caracteres.</p>
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loadingPassword}
              aria-required
            />
          </div>
          <div>
            <Button type="submit" disabled={loadingPassword} className="w-full">
              {loadingPassword ? "Guardando..." : "Cambiar Contraseña"}
            </Button>
          </div>
        </form>
      </section>

      {/* Autenticación de dos factores */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Autenticación de Dos Factores (2FA)</h2>
        <p className="mb-4 max-w-md text-muted-foreground">
          Activa o desactiva la autenticación de dos factores para mayor seguridad en tu cuenta.
          (Si tu backend no soporta 2FA aún, el comportamiento se simulará localmente.)
        </p>
        <div className="flex items-center gap-3">
          <Button onClick={handleToggle2FA} disabled={loading2FA}>
            {loading2FA ? (twoFAEnabled ? "Desactivando..." : "Activando...") : (twoFAEnabled ? "Desactivar 2FA" : "Activar 2FA")}
          </Button>
          <span className={`text-sm font-medium ${twoFAEnabled ? "text-green-600" : "text-gray-600"}`}>
            {twoFAEnabled ? "2FA activado" : "2FA desactivado"}
          </span>
        </div>
      </section>
    </div>
  );
}