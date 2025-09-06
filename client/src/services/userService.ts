// src/services/userservice.ts
import { supabase } from "@/lib/supabaseClient";
import type { UpsertUser } from "@shared/schema";
import type { User } from "@/hooks/useUser";

// Tipo para el usuario con contraseña (solo para registro)
type UserWithPassword = UpsertUser & { password: string };

export async function createUser(userData: UserWithPassword): Promise<User> {
  try {
    // Usamos Supabase Auth para crear el usuario con contraseña
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          // Agrega aquí otros campos que quieras guardar en el perfil
        }
      }
    });

    if (authError) throw new Error(`Error al crear usuario: ${authError.message}`);
    if (!authData.user) throw new Error("No se recibió datos del usuario creado");

    // Creamos el perfil en la tabla users con nombres de columnas correctos
    const { data: profileData, error: profileError } = await supabase
      .from("users")
      .upsert({
        id: authData.user.id,
        email: userData.email,
        first_name: userData.firstName,  // <-- CORREGIDO
        last_name: userData.lastName,    // <-- CORREGIDO
        // Agrega aquí otros campos del perfil
      })
      .select()
      .single();

    if (profileError) throw new Error(`Error al crear perfil: ${profileError.message}`);
    if (!profileData) throw new Error("No se recibió datos del perfil creado");

    return profileData as User;
  } catch (error: any) {
    throw new Error(error.message || "Error desconocido al crear usuario");
  }
}

export async function validateLogin(email: string, password: string): Promise<User | null> {
  try {
    // Usamos Supabase Auth para login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error("Error al iniciar sesión:", authError.message);
      return null;
    }

    if (!authData.user) {
      return null;
    }

    // Obtenemos el perfil del usuario
    const { data: profileData, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (profileError) {
      console.error("Error al obtener perfil:", profileError.message);
      return null;
    }

    return profileData as User;
  } catch (error: any) {
    console.error("Error en validación de login:", error.message);
    return null;
  }
}

// Función adicional para obtener el usuario actual
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) return null;

    const { data: profileData, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (error) {
      console.error("Error al obtener perfil:", error.message);
      return null;
    }

    return profileData as User;
  } catch (error: any) {
    console.error("Error al obtener usuario actual:", error.message);
    return null;
  }
}




