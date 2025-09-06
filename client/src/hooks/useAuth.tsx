// src/contexts/useAuth.tsx
import { useState, useEffect, useCallback, createContext, useContext } from "react";
import type { User } from "@/hooks/useUser";
import { supabase } from "@/lib/supabaseClient";
import type { AuthChangeEvent, Session, Provider } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  signUp: (email: string, password: string, userData: Omit<User, 'id' | 'email' | 'createdAt'>) => Promise<{ user: User | null; error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    try {
      // Obtener sesión actual
      const { data: { session } } = await supabase.auth.getSession();
      const sessionUser = session?.user;

      if (!sessionUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Obtener datos adicionales del usuario desde la tabla 'users'
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', sessionUser.id)
        .single();

      if (error) {
        console.error("Error fetching user:", error.message);
        setUser(null);
      } else {
        // Mapear los datos correctamente según tu schema
        setUser({
          id: data.id,
          email: sessionUser.email || data.email,
          firstName: data.first_name || data.firstName,
          lastName: data.last_name || data.lastName,
          profileImageUrl: data.profile_image_url || data.profileImageUrl,
          rating: data.rating,
          reviewCount: data.review_count || data.reviewCount,
          location: data.location,
          phone: data.phone,
          hourlyRate: data.hourly_rate || data.hourlyRate,
          isTasker: data.is_tasker || data.isTasker,
          bio: data.bio,
          skills: data.skills || [],
          createdAt: data.created_at || data.createdAt,
          totalEarnings: data.total_earnings || data.totalEarnings,
          notifications: data.notifications || { email: true, push: true }
        } as User);
      }
    } catch (err) {
      console.error("Unexpected error fetching user:", err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, userData: Omit<User, 'id' | 'email' | 'createdAt'>) => {
    try {
      // 1. Crear usuario en Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        return { user: null, error: signUpError.message };
      }

      const sessionUser = data.user;
      if (!sessionUser) {
        // Usuario creado pero requiere confirmación por email
        return { user: null, error: "Por favor revisa tu email para confirmar tu cuenta" };
      }

      // 2. Crear perfil en tabla 'users' usando el mismo ID de Auth
      const userProfile = {
        id: sessionUser.id,
        email: sessionUser.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        is_tasker: userData.isTasker,
        location: userData.location,
        phone: userData.phone,
        bio: userData.bio,
        skills: userData.skills,
        hourly_rate: userData.hourlyRate,
        profile_image_url: userData.profileImageUrl,
        created_at: new Date().toISOString(),
      };

      const { error: insertError } = await supabase
        .from('users')
        .insert([userProfile]);

      if (insertError) {
        console.error("Error creating user profile:", insertError.message);
        // Opcional: eliminar usuario de Auth si falla la creación del perfil
        // await supabase.auth.admin.deleteUser(sessionUser.id);
        return { user: null, error: `Error al crear perfil: ${insertError.message}` };
      }

      // 3. Obtener el usuario completo
      await fetchUser();
      
      return { user: user, error: null };
    } catch (err) {
      console.error("Unexpected error in signUp:", err);
      return { user: null, error: "Error inesperado durante el registro" };
    }
  }, [fetchUser]);

  useEffect(() => {
    fetchUser();

    // Escuchar cambios en la sesión para actualizar usuario automáticamente
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          fetchUser();
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUser]);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Error signing out:", err);
    }
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, login, logout, fetchUser, signUp }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};




