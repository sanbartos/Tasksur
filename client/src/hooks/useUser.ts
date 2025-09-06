// src/hooks/useUser.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

/**
 * Tipos
 */
export type NotificationPreferences = {
  emailTaskUpdates?: boolean;
  emailMessages?: boolean;
  emailPayments?: boolean;
  pushTaskUpdates?: boolean;
  pushMessages?: boolean;
  smsUrgent?: boolean;
  email?: boolean;
  push?: boolean;
  [key: string]: any;
};

export type User = {
  id: string;
  email?: string | null;
  profileImageUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  location?: string | null;
  phone?: string | null;
  hourlyRate?: number | null;
  isTasker?: boolean;
  bio?: string | null;
  skills?: string[];
  createdAt?: string | null;
  totalEarnings?: number | null;
  notifications?: NotificationPreferences | null;
  language?: string | null;
  preferences?: Record<string, any> | null;
  // Campos adicionales permitidos
  [key: string]: any;
};

type UseUserReturn = {
  user: User | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setUser: (u: User | null) => void;
  updatePreferences: (prefs: Record<string, any>) => Promise<void>;
  subscribeToRealtime?: boolean;
};

/**
 * Hook useUser: obtiene y mantiene el usuario actual desde la tabla 'users'
 * - Dedupe de fetches (evita múltiples fetch simultáneos)
 * - Escucha cambios de sesión (onAuthStateChange)
 * - Opcional: se suscribe a cambios realtime de la fila del usuario
 */
export function useUser(subscribeToRealtime: boolean = true): UseUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Referencia para dedupe / evitar carreras
  const ongoingFetch = useRef<Promise<void> | null>(null);
  const realtimeSub = useRef<any>(null);

  const parseNumber = (v: any) => {
    if (v === null || v === undefined) return null;
    if (typeof v === "number") return v;
    if (typeof v === "string" && v.trim() === "") return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  };

  const mapRowToUser = (data: any, sessionEmail?: string): User => {
    return {
      id: data.id,
      email: sessionEmail ?? data.email ?? null,
      profileImageUrl: data.profile_image_url ?? data.profileImageUrl ?? null,
      firstName: data.first_name ?? data.firstName ?? null,
      lastName: data.last_name ?? data.lastName ?? null,
      rating: parseNumber(data.rating) ?? 0,
      reviewCount: parseNumber(data.review_count ?? data.reviewCount) ?? 0,
      location: data.location ?? null,
      phone: data.phone ?? null,
      hourlyRate: parseNumber(data.hourly_rate ?? data.hourlyRate),
      isTasker: Boolean(data.is_tasker ?? data.isTasker ?? false),
      bio: data.bio ?? null,
      skills: Array.isArray(data.skills) ? data.skills : [],
      createdAt: data.created_at ?? data.createdAt ?? null,
      totalEarnings: parseNumber(data.total_earnings ?? data.totalEarnings) ?? 0,
      notifications: data.notifications ?? data.notificationPreferences ?? null,
      language: data.language ?? null,
      preferences: data.preferences ?? null,
      ...data, // permitir campos adicionales sin romper
    } as User;
  };

  const fetchUser = useCallback(async (): Promise<void> => {
    // Si ya hay una petición en curso, reusar la promesa
    if (ongoingFetch.current) return ongoingFetch.current;

    const promise = (async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        const session = sessionData?.session as Session | null;
        const sessionUser = session?.user ?? null;

        if (!sessionUser) {
          setUser(null);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from("users")
          .select("*")
          .eq("id", sessionUser.id)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (!data) {
          // No profile row yet
          setUser(null);
          return;
        }

        setUser(mapRowToUser(data, sessionUser.email ?? undefined));
      } catch (err: any) {
        console.error("useUser.fetchUser error:", err);
        setError(err?.message ?? String(err ?? "Error al cargar usuario"));
        setUser(null);
      } finally {
        setLoading(false);
        ongoingFetch.current = null;
      }
    })();

    ongoingFetch.current = promise;
    return promise;
  }, []);

  // updatePreferences: utiliza la tabla users para persistir preferencias y actualiza el state local
  const updatePreferences = useCallback(
    async (prefs: Record<string, any>) => {
      if (!user) throw new Error("No authenticated user");
      try {
        setLoading(true);
        const { error } = await supabase.from("users").update({ preferences: prefs }).eq("id", user.id);
        if (error) throw error;

        // Actualizar localmente
        setUser((prev) => (prev ? { ...prev, preferences: prefs } : prev));
      } catch (err: any) {
        console.error("Error updating preferences:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    fetchUser();

    // Escuchar cambios en la sesión
    const { data: authListener } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (session?.user) {
        // Fuerza refetch al iniciar sesión
        fetchUser().catch((e) => console.error(e));
      } else {
        // Cerrar sesión -> limpiar user
        setUser(null);
      }
    });

    return () => {
      try {
        authListener?.subscription?.unsubscribe();
      } catch (err) {
        // noop
      }
    };
  }, [fetchUser]);

  // Suscripción realtime a la fila del usuario (opcional)
  useEffect(() => {
    // Solo si subscribeToRealtime y tenemos user
    if (!subscribeToRealtime) return;

    if (!user?.id) return;

    // Limpiar subs previas
    try {
      if (realtimeSub.current) {
        supabase.removeSubscription(realtimeSub.current);
        realtimeSub.current = null;
      }
    } catch {}

    const channel = supabase
      .channel(`public:users:id=eq.${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users", filter: `id=eq.${user.id}` },
        (payload) => {
          // Cuando la fila cambia, refrescar o mapear
          if (payload?.new) {
            setUser((prev) => {
              // Mapea la nueva fila a User manteniendo campos previos si faltan
              const mapped = mapRowToUser(payload.new, prev?.email ?? undefined);
              return { ...prev, ...mapped };
            });
          } else {
            // Si se elimina la fila, limpiar user
            if (payload?.old && !payload?.new) {
              setUser(null);
            }
          }
        }
      )
      .subscribe();

    realtimeSub.current = channel;

    return () => {
      try {
        if (realtimeSub.current) {
          supabase.removeSubscription(realtimeSub.current);
          realtimeSub.current = null;
        }
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, subscribeToRealtime]);

  return {
    user,
    loading,
    error,
    refetch: fetchUser,
    setUser,
    updatePreferences,
    subscribeToRealtime,
  };
}



