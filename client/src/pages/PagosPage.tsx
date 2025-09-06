// src/pages/PagosPage.tsx
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

type PaymentMethod = {
  id: string;
  user_id: string;
  brand?: string;
  last4?: string;
  exp_month?: number;
  exp_year?: number;
  created_at?: string;
};

export default function PagosPage() {
  const { user } = useUser();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      if (!user) return setLoading(false);
      try {
        const { data, error } = await supabase
          .from("payment_methods")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setMethods((data as PaymentMethod[]) || []);
      } catch (err: any) {
        console.error("load payments:", err);
        toast({ title: "Error", description: "No se pudieron cargar métodos de pago.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const remove = async (id: string) => {
    try {
      const { error } = await supabase.from("payment_methods").delete().eq("id", id).eq("user_id", user?.id);
      if (error) throw error;
      setMethods(prev => prev.filter(m => m.id !== id));
      toast({ title: "Eliminado", description: "Método de pago eliminado." });
    } catch (err: any) {
      console.error("remove payment:", err);
      toast({ title: "Error", description: err?.message || "No se pudo eliminar el método.", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-semibold mb-6">Métodos de pago</h1>

      <Card>
        <CardHeader>
          <CardTitle>Tarjetas registradas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Cargando...</div>
          ) : methods.length === 0 ? (
            <div className="py-6 text-center text-gray-500">No hay métodos de pago registrados.</div>
          ) : (
            <div className="space-y-3">
              {methods.map(m => (
                <div key={m.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{m.brand ?? "Tarjeta" } ••{m.last4}</div>
                    <div className="text-sm text-gray-500">Exp: {m.exp_month}/{m.exp_year}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => remove(m.id)}>Eliminar</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 flex justify-end">
            <Button onClick={() => window.location.href = "/payment"}>Agregar método</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}