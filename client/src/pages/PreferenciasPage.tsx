// src/pages/PreferenciasPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Moon, Sun, Monitor } from "lucide-react";

type ThemeOption = "system" | "light" | "dark";
type Preferences = {
  theme: ThemeOption;
  compactMode: boolean;
  publicProfile: boolean;
  [k: string]: any;
};

const DEFAULT_PREFERENCES: Preferences = {
  theme: "system",
  compactMode: false,
  publicProfile: true,
};

const LOCAL_STORAGE_KEY = "app_preferences";

export default function PreferenciasPage() {
  const { user, setUser } = useUser();
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [saving, setSaving] = useState(false);

  // Inicializar preferencias desde user o localStorage
  useEffect(() => {
    if (!user) return;

    const fromUser = (user as any).preferences;
    if (fromUser && typeof fromUser === "object") {
      setPrefs(prev => ({ ...prev, ...fromUser }));
      return;
    }

    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPrefs(prev => ({ ...prev, ...parsed }));
      } catch {
        // ignore
      }
    }
  }, [user]);

  // Detectar si hay cambios
  const hasChanges = useMemo(() => {
    const current = (user as any)?.preferences ?? {};
    return Object.keys(DEFAULT_PREFERENCES).some(
      (key) => (prefs as any)[key] !== (current as any)[key]
    );
  }, [prefs, user]);

  const toggle = (key: keyof Preferences) => {
    setPrefs(prev => {
      const newValue = !prev[key];
      return { ...prev, [key]: newValue };
    });
  };

  const setTheme = (theme: ThemeOption) => {
    setPrefs(prev => ({ ...prev, theme }));
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({ preferences: prefs })
        .eq("id", user.id);

      if (error) throw error;

      setUser({ ...user, preferences: prefs });
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(prefs));
      toast.success("Preferencias guardadas correctamente");
    } catch (err: any) {
      console.error("Error saving preferences:", err);
      toast.error(err?.message || "No se pudieron guardar las preferencias");
    } finally {
      setSaving(false);
    }
  };

  const revert = () => {
    const current = (user as any)?.preferences ?? DEFAULT_PREFERENCES;
    setPrefs(current);
    toast.info("Preferencias revertidas");
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-semibold mb-6">Preferencias</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Apariencia</CardTitle>
          <CardDescription>Configura el tema y la densidad de la interfaz</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Selector */}
          <div>
            <Label className="mb-3 block">Tema</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                variant={prefs.theme === "system" ? "default" : "outline"}
                className="h-auto flex flex-col items-center justify-center p-4"
                onClick={() => setTheme("system")}
              >
                <Monitor className="h-5 w-5 mb-1" />
                <span>Sistema</span>
              </Button>
              <Button
                variant={prefs.theme === "light" ? "default" : "outline"}
                className="h-auto flex flex-col items-center justify-center p-4"
                onClick={() => setTheme("light")}
              >
                <Sun className="h-5 w-5 mb-1" />
                <span>Claro</span>
              </Button>
              <Button
                variant={prefs.theme === "dark" ? "default" : "outline"}
                className="h-auto flex flex-col items-center justify-center p-4"
                onClick={() => setTheme("dark")}
              >
                <Moon className="h-5 w-5 mb-1" />
                <span>Oscuro</span>
              </Button>
            </div>
          </div>

          <Separator />

          {/* Compact Mode */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded">
            <div>
              <Label>Modo compacto</Label>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Reduce el espaciado para ver más información
              </div>
            </div>
            <Switch
              aria-label="Activar modo compacto"
              checked={!!prefs.compactMode}
              onCheckedChange={() => toggle("compactMode")}
            />
          </div>

          <Separator />

          {/* Public Profile */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded">
            <div>
              <Label>Perfil público</Label>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Permitir que otros te encuentren en búsquedas
              </div>
            </div>
            <Switch
              aria-label="Hacer perfil público"
              checked={!!prefs.publicProfile}
              onCheckedChange={() => toggle("publicProfile")}
            />
          </div>

          <Separator />

          {/* Save Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={save} disabled={saving || !hasChanges}>
              {saving ? "Guardando..." : "Guardar preferencias"}
            </Button>
            <Button variant="outline" onClick={revert} disabled={!hasChanges}>
              Revertir cambios
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}