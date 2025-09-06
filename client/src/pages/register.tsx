// src/pages/register.tsx
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function Register() {
  console.log("VITE_BACKEND_URL =", import.meta.env.VITE_BACKEND_URL);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { signUp, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Registro con Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      console.log("ðŸ” signUp data:", signUpData);
      console.log("âŒ signUp error:", signUpError);

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      const authUser = signUpData?.user ?? null;
      const session = signUpData?.session ?? null;

      if (!authUser) {
        setError("No se pudo crear la cuenta.");
        setLoading(false);
        return;
      }

      // Si no hay sesión (email confirm activo), crear perfil desde backend
      if (!session) {
        const profileData = {
          id: authUser.id,
          email: authUser.email,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          is_tasker: false,
          location: "",
          phone: null,
          bio: null,
          skills: [],
          hourly_rate: null,
          profile_image_url: null,
          rating: 0,
          review_count: 0,
          total_earnings: 0,
          notifications: { email: true, push: true },
          created_at: new Date().toISOString(),
        };

        const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
        const secret = import.meta.env.VITE_CREATE_PROFILE_SECRET || "";

        console.log("Backend URL used for create-profile:", backendUrl);

        const res = await fetch(`${backendUrl}/api/create-profile`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(secret ? { "x-create-profile-secret": secret } : {}),
          },
          body: JSON.stringify(profileData),
        });

        // Manejo seguro evitando doble lectura: uso de res.clone()
        if (!res.ok) {
          let body: any = null;
          try {
            body = await res.clone().json();
          } catch {
            try {
              body = await res.clone().text();
            } catch {
              body = null;
            }
          }
          const errMsg = (body && (body.error || body.message)) || `Error ${res.status} al crear perfil`;
          setError(errMsg);
          setLoading(false);
          return;
        }

        // ok
        setSuccess(true);
        setTimeout(() => setLocation("/login"), 2000);
        return;
      }

      // Si hay sesión, crear perfil desde cliente (usar signUp del contexto)
      const result = await signUp(email, password, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        isTasker: false,
        location: "",
        phone: null,
        bio: null,
        skills: [],
        hourlyRate: null,
        profileImageUrl: null,
        rating: 0,
        reviewCount: 0,
        totalEarnings: 0,
        notifications: { email: true, push: true } as any,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => setLocation("/home"), 2000);
      }
    } catch (err) {
      console.error("Error in signup:", err);
      setError("Error inesperado durante el registro");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">¡Registro Exitoso!</CardTitle>
            <CardDescription>Bienvenido a TaskSur</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-green-600">
              {success === true
                ? "Tu cuenta ha sido creada correctamente. Serás redirigido automáticamente..."
                : "Confirma tu email para completar el registro."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Crear Cuenta</CardTitle>
          <CardDescription>
            Ingresa tus datos para crear una cuenta en TaskSur
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre</Label>
              <Input
                id="firstName"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={loading || isLoading}
                placeholder="Tu nombre"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido</Label>
              <Input
                id="lastName"
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={loading || isLoading}
                placeholder="Tu apellido"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || isLoading}
                placeholder="tu@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || isLoading}
                placeholder="Mínimo 6 caracteres"
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading || isLoading}
                placeholder="Repite tu contraseña"
                minLength={6}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || isLoading}
            >
              {loading || isLoading ? "Creando cuenta..." : "Registrarse"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-500">
            Al registrarte, aceptas nuestros{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Términos de Servicio
            </Link>{" "}
            y{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Política de Privacidad
            </Link>
          </div>

          <div className="text-center text-sm">
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              ¿Ya tienes cuenta? Inicia sesión
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}




