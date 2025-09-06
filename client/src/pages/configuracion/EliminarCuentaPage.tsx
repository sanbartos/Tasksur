// src/pages/EliminarCuentaPage.tsx
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default function EliminarCuentaPage() {
  const { logout, user } = useAuth();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  async function handleDelete() {
    if (!confirmed) {
      toast.error("Por favor, confirma que entiendes las consecuencias.");
      return;
    }

    const userConfirmed = window.confirm(
      "¿Estás completamente seguro de eliminar tu cuenta?\n\n" +
      "Esta acción es irreversible y eliminará todos tus datos asociados:\n" +
      "- Tu perfil\n" +
      "- Tus tareas publicadas\n" +
      "- Tus mensajes\n" +
      "- Tu historial de pagos\n\n" +
      "Pulsa OK para confirmar."
    );

    if (!userConfirmed) return;

    setLoading(true);
    try {
      const res = await fetch("/api/users/delete-account", {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        toast.success("Tu cuenta ha sido eliminada correctamente.");
        logout();
        setLocation("/");
        return;
      }

      let msg = "Error al eliminar la cuenta.";
      try {
        const json = await res.json();
        msg = json?.message || json?.error || msg;
      } catch {
        const text = await res.text().catch(() => "");
        msg = text || msg;
      }

      throw new Error(msg);
    } catch (err: any) {
      console.error("Error eliminando cuenta:", err);
      toast.error(err?.message || "No se pudo eliminar la cuenta. Inténtalo más tarde.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-2xl text-red-700 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            Eliminar Cuenta
          </CardTitle>
          <CardDescription>
            Elimina permanentemente tu cuenta y todos los datos asociados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Acción irreversible</AlertTitle>
            <AlertDescription>
              Esta acción eliminará permanentemente tu cuenta y todos tus datos asociados. No se puede deshacer.
            </AlertDescription>
          </Alert>

          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <h3 className="font-semibold text-red-800 mb-2">Datos que se eliminarán:</h3>
            <ul className="list-disc pl-5 text-sm text-red-700 space-y-1">
              <li>Tu perfil público y privado</li>
              <li>Todas las tareas publicadas o aceptadas</li>
              <li>Mensajes y conversaciones</li>
              <li>Historial de pagos y facturas</li>
              <li>Calificaciones y reseñas</li>
              <li>Configuración de notificaciones</li>
            </ul>
          </div>

          <div className="flex items-start space-x-3 mb-6">
            <Checkbox
              id="confirm-delete"
              checked={confirmed}
              onCheckedChange={(v) => setConfirmed(!!v)}
              aria-label="Confirmo que entiendo las consecuencias"
            />
            <label htmlFor="confirm-delete" className="text-sm text-gray-700">
              Entiendo que esta acción es <span className="font-semibold">permanente e irreversible</span> y que todos mis datos serán eliminados.
            </label>
          </div>

          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading || !confirmed}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <span className="flex items-center">
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                Eliminando cuenta...
              </span>
            ) : (
              "Eliminar mi cuenta permanentemente"
            )}
          </Button>

          <p className="mt-4 text-sm text-gray-500">
            ¿Cambiar de opinión? <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => window.history.back()}
            >
              Volver atrás
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}