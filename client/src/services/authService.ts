// services/auth.service.ts

import { supabase } from "@/lib/supabaseClient"

export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error("Error al cerrar sesión: " + error.message)
}
