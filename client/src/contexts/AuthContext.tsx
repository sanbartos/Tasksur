// src/contexts/AuthContext.tsx
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { User as AppUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabaseClient";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";

interface SignUpResult {
  user: AppUser | null;
  error: string | null;
}

interface AuthContextType {
  user: AppUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: AppUser | null) => void;
  logout: () => Promise<void>;
  fetchUser: (opts?: { force?: boolean }) => Promise<void>;
  signUp: (email: string, password: string, userData: Omit<AppUser, "id" | "email" | "createdAt">) => Promise<SignUpResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper para mapear fila de DB a objeto AppUser
const mapDbRowToAppUser = (data: any, sessionUserEmail?: string): AppUser => {
  return {
    id: data.id,
    email: sessionUserEmail ?? data.email,
    firstName: data.first_name ?? data.firstName ?? "",
    lastName: data.last_name ?? data.lastName ?? "",
    profileImageUrl: data.profile_image_url ?? data.profileImageUrl ?? null,
    rating: data.rating ?? data.avg_rating ?? 0,
    reviewCount: data.review_count ?? data.reviewCount ?? 0,
    location: data.location ?? null,
    phone: data.phone ?? null,
    hourlyRate: data.hourly_rate ?? data.hourlyRate ?? null,
    isTasker: Boolean(data.is_tasker ?? data.isTasker ?? false),
    bio: data.bio ?? null,
    skills: Array.isArray(data.skills) ? data.skills : [],
    createdAt: data.created_at ?? data.createdAt ?? null,
    totalEarnings: data.total_earnings ?? data.totalEarnings ?? 0,
    notifications: data.notifications ?? { email: true, push: true },
  } as AppUser;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const fetchUserRef = useRef<Promise<void> | null>(null);

  const fetchUser = useCallback(
    async (opts: { force?: boolean } = {}) => {
      // Evitar race conditions
      if (!opts.force && fetchUserRef.current) {
        return fetchUserRef.current;
      }

      const fetchPromise = (async () => {
        setIsLoading(true);
        try {
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) throw sessionError;

          const session = sessionData?.session;
          const sessionUser = session?.user;

          if (!sessionUser) {
            setUser(null);
            return;
          }

          const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", sessionUser.id)
            .maybeSingle();

          if (error) {
            console.error("Error fetching user from 'users' table:", error.message);
            setUser(null);
            return;
          }

          if (!data) {
            console.log("No user profile found yet for id", sessionUser.id);
            setUser(null);
            return;
          }

          setUser(mapDbRowToAppUser(data, sessionUser.email));
        } catch (err: any) {
          console.error("Unexpected error fetching user:", err);
          setUser(null);
        } finally {
          setIsLoading(false);
          fetchUserRef.current = null;
        }
      })();

      fetchUserRef.current = fetchPromise;
      return fetchPromise;
    },
    []
  );

  const signUp = useCallback(
    async (email: string, password: string, userData: Omit<AppUser, "id" | "email" | "createdAt">): Promise<SignUpResult> => {
      try {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          console.error("Supabase signUp error:", signUpError.message);
          return { user: null, error: signUpError.message };
        }

        const authUser = signUpData?.user;
        if (!authUser) {
          return { user: null, error: "Revisa tu email para confirmar la cuenta antes de completar el perfil." };
        }

        const profileRow: Record<string, any> = {
          id: authUser.id,
          email: authUser.email,
          first_name: userData.firstName ?? null,
          last_name: userData.lastName ?? null,
          is_tasker: userData.isTasker ?? false,
          location: userData.location ?? null,
          phone: userData.phone ?? null,
          bio: userData.bio ?? null,
          skills: Array.isArray(userData.skills) ? userData.skills : [],
          hourly_rate: userData.hourlyRate ?? null,
          profile_image_url: userData.profileImageUrl ?? null,
          rating: userData.rating ?? 0,
          review_count: userData.reviewCount ?? 0,
          total_earnings: userData.totalEarnings ?? 0,
          notifications: userData.notifications ?? { email: true, push: true },
          created_at: new Date().toISOString(),
        };

        const { error: insertError } = await supabase.from("users").insert([profileRow]);
        if (insertError) {
          console.error("Error inserting user profile:", insertError.message);
          return { user: null, error: `Error al crear perfil: ${insertError.message}` };
        }

        const { data: createdData, error: createdError } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .maybeSingle();

        if (createdError || !createdData) {
          await fetchUser({ force: true });
          return { user: null, error: null };
        }

        const mapped = mapDbRowToAppUser(createdData, authUser.email);
        setUser(mapped);
        return { user: mapped, error: null };
      } catch (err: any) {
        console.error("Unexpected error in signUp:", err);
        return { user: null, error: "Error inesperado durante el registro" };
      }
    },
    [fetchUser]
  );

  useEffect(() => {
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          await fetchUser({ force: true });
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      try {
        authListener?.subscription?.unsubscribe();
      } catch (err) {
        console.warn("Error unsubscribing from auth listener:", err);
      }
    };
  }, [fetchUser]);

  const login = (u: AppUser | null) => setUser(u);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Error signing out:", err);
    } finally {
      setUser(null);
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        fetchUser,
        signUp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};