// src/hooks/useLogin.ts
import { useState, useContext } from "react";
import { validateLogin } from "@/services/userService";
import { AuthContext } from "@/contexts/AuthContext";

export function useLogin() {
  const [error, setError] = useState<string | null>(null);
  const { setUser } = useContext(AuthContext);

  async function login(email: string, password: string) {
    try {
      // Limpiar error previo
      setError(null);
      
      // Validar credenciales usando el servicio
      const user = await validateLogin(email, password);
      
      if (!user) {
        setError("Email o contraseña incorrectos");
        return null;
      }
      
      // Guardar usuario en el contexto global
      setUser(user);
      return user;
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
      return null;
    }
  }

  return { login, error };
}




