// src/pages/IdiomasPage.tsx
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Globe } from "lucide-react";

// Tipos
type LanguageCode = "es" | "en" | "fr" | "de" | "it" | "pt" | "ca";
interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
}

// Opciones de idioma disponibles
const LANGUAGES: LanguageOption[] = [
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "en", name: "English", nativeName: "English" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "ca", name: "Catalan", nativeName: "Català" },
];

export default function IdiomasPage() {
  const { user, fetchUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedLang, setSelectedLang] = useState<LanguageCode>("es");

  // Inicializar idioma desde user o localStorage
  useEffect(() => {
    if (user?.language) {
      setSelectedLang(user.language as LanguageCode);
      return;
    }

    const stored = localStorage.getItem("app_language");
    if (stored && LANGUAGES.some(l => l.code === stored)) {
      setSelectedLang(stored as LanguageCode);
    }
  }, [user]);

  // Guardar idioma
  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/user/language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ language: selectedLang }),
      });

      if (res.ok) {
        toast.success("Idioma guardado correctamente");
        localStorage.setItem("app_language", selectedLang);
        try {
          await fetchUser?.();
        } catch {
          // no crítico
        }
        return;
      }

      let msg = "Error al guardar el idioma";
      try {
        const json = await res.json();
        msg = json?.message || json?.error || msg;
      } catch {
        const text = await res.text().catch(() => "");
        msg = text || msg;
      }

      throw new Error(msg);
    } catch (err: any) {
      console.error("Error guardando idioma:", err);
      toast.error(err?.message || "No se pudo guardar el idioma");
    } finally {
      setSaving(false);
    }
  }

  // Detectar si hay cambios
  const hasChanges = user?.language !== selectedLang;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Idioma
          </CardTitle>
          <CardDescription>
            Selecciona el idioma en el que deseas ver la aplicación.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="language-select">Idioma de la interfaz</Label>
            <Select value={selectedLang} onValueChange={(v) => setSelectedLang(v as LanguageCode)} disabled={loading}>
              <SelectTrigger id="language-select" className="w-full sm:w-[240px] mt-1">
                <SelectValue placeholder="Selecciona un idioma" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.nativeName} ({lang.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-2">
              El contenido generado por usuarios (como descripciones de tareas) no se traducirá automáticamente.
            </p>
          </div>

          <Separator />

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleSave} disabled={saving || !hasChanges}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedLang((user?.language as LanguageCode) || "es")}
              disabled={!hasChanges}
            >
              Revertir
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 text-sm text-muted-foreground">
        <p>¿Quieres que la aplicación esté disponible en otro idioma?</p>
        <p className="mt-1">
          <a
            href="mailto:support@tasksur.com?subject=Solicitud de nuevo idioma"
            className="text-primary hover:underline"
          >
            Envíanos una solicitud
          </a>
        </p>
      </div>
    </div>
  );
}