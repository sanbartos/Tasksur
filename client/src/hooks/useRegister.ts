// src/hooks/useRegister.ts
import { useState, useContext } from "react";
import { createUser } from "@/services/userService";
import { AuthContext } from "@/contexts/AuthContext";
import type { UpsertUser } from "@shared/schema";

type RegisterData = Omit<UpsertUser, "id" | "created_at" | "updated_at"> & {
  password: string;
  confirmPassword: string;
};

export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { setUser } = useContext(AuthContext);

  async function register(userData: RegisterData) {
    try {
      setError(null);
      setSuccess(false);
      setLoading(true);

      if (userData.password !== userData.confirmPassword) {
        throw new Error("Las contraseñas no coinciden");
      }

      if (userData.password.length < 6) {
        throw new Error("La contraseña debe tener al menos 6 caracteres");
      }

      const { confirmPassword, ...userDataForCreation } = userData;
      const user = await createUser(userDataForCreation as any);

      setUser(user);
      setSuccess(true);

      return user;
    } catch (err: any) {
      setError(err.message || "Error al registrar usuario");
      return null;
    } finally {
      setLoading(false);
    }
  }

  const reset = () => {
    setError(null);
    setSuccess(false);
  };

  return {
    register,
    loading,
    error,
    success,
    reset,
  };
}




