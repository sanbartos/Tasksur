import { useState } from "react";
import PayPalButton from "@/components/PayPalButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Payment() {
  const [amount, setAmount] = useState("100.00");
  const [currency, setCurrency] = useState("UYU");
  const [showPayPal, setShowPayPal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Demostración de Pago con PayPal
        </h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Configurar Pago</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="amount">Monto</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100.00"
              />
            </div>
            
            <div>
              <Label htmlFor="currency">Moneda</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UYU">Peso Uruguayo (UYU)</SelectItem>
                  <SelectItem value="ARS">Peso Argentino (ARS)</SelectItem>
                  <SelectItem value="USD">Dólar Americano (USD)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={() => setShowPayPal(true)} 
              className="w-full"
              disabled={!amount || parseFloat(amount) <= 0}
            >
              Mostrar Botón de PayPal
            </Button>
          </CardContent>
        </Card>

        {showPayPal && (
          <Card>
            <CardHeader>
              <CardTitle>Pagar con PayPal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <p className="text-lg">
                  Monto: {amount} {currency}
                </p>
                <div className="flex justify-center">
                  <PayPalButton
                    amount={amount}
                    currency={currency}
                    intent="CAPTURE"
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Este es un entorno de pruebas (Sandbox). No se realizarán pagos reales.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Información sobre PayPal en TaskSur</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Monedas Soportadas</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li><strong>UYU</strong> - Peso Uruguayo (ideal para Uruguay)</li>
                <li><strong>ARS</strong> - Peso Argentino (ideal para Argentina)</li>
                <li><strong>USD</strong> - Dólar Americano (ampliamente aceptado)</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Ventajas de PayPal</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Popular y confiable en América del Sur</li>
                <li>Protección para compradores y vendedores</li>
                <li>Soporte completo para monedas locales</li>
                <li>Integración segura y fácil de usar</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}




