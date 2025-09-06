// src/lib/supabaseClient.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // Lanzar aquí ayuda a detectar configuración mal establecida en tiempo de desarrollo
  throw new Error("Faltan las variables de entorno de Supabase: VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY");
}

const isBrowser = typeof window !== "undefined";

/**
 * Cliente Supabase para uso en el frontend (Vite).
 * - persistSession: mantiene la sesión en localStorage/sessionStorage.
 * - detectSessionInUrl: útil para flujos OAuth (solo en browser).
 *
 * NOTA: Si necesitas llamadas seguras del lado servidor (supabase-admin),
 * usa la SERVICE_ROLE_KEY desde el backend y nunca la expongas en el cliente.
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: isBrowser,
  },
  // Config extra si la necesitas (e.g. realtime, global fetch), se puede añadir aquí.
});

/**
 * Helper: obtener la sesión actual (útil para componentes que quieren chequear auth sin repetir lógica).
 */
export async function getCurrentSession() {
  const { data } = await supabase.auth.getSession();
  return data?.session ?? null;
}

/**
 * Helper: wrapper para onAuthStateChange.
 * Devuelve la función de unsubscribe.
 */
export function onAuthStateChange(handler: (event: string, session: any) => void) {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    handler(event, session);
  });
  return () => {
    try {
      (data as any)?.subscription?.unsubscribe();
    } catch {
      // noop
    }
  };
}

export default supabase;