// src/pages/ConfiguracionPage.tsx
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  UserRound, 
  ShieldCheck, 
  Bell, 
  Trash2, 
  Key,
  Palette,
  Globe,
  CreditCard
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const configSections = [
  {
    title: "Editar Perfil",
    description: "Actualiza tu información personal, foto y biografía.",
    icon: UserRound,
    href: "/configuracion/perfil",
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    title: "Seguridad",
    description: "Cambia tu contraseña y configura la autenticación de dos factores.",
    icon: ShieldCheck,
    href: "/configuracion/seguridad",
    color: "text-green-600",
    bgColor: "bg-green-50"
  },
  {
    title: "Notificaciones",
    description: "Configura cómo y cuándo recibir alertas por email, push o SMS.",
    icon: Bell,
    href: "/configuracion/notificaciones",
    color: "text-purple-600",
    bgColor: "bg-purple-50"
  },
  {
    title: "Preferencias",
    description: "Personaliza la apariencia y el comportamiento de la aplicación.",
    icon: Palette,
    href: "/configuracion/preferencias",
    color: "text-amber-600",
    bgColor: "bg-amber-50"
  },
  {
    title: "Idioma y Región",
    description: "Establece tu idioma preferido y configuración regional.",
    icon: Globe,
    href: "/configuracion/idioma",
    color: "text-teal-600",
    bgColor: "bg-teal-50"
  },
  {
    title: "Métodos de Pago",
    description: "Gestiona tus tarjetas y métodos de pago guardados.",
    icon: CreditCard,
    href: "/configuracion/pagos",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50"
  },
  {
    title: "Eliminar Cuenta",
    description: "Elimina tu cuenta permanentemente. Esta acción no se puede deshacer.",
    icon: Trash2,
    href: "/configuracion/eliminar-cuenta",
    color: "text-red-600",
    bgColor: "bg-red-50",
    isDanger: true
  }
];

export default function ConfiguracionPage() {
  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="mt-2 text-gray-600">
          Gestiona tu cuenta, preferencias y configuración de seguridad
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {configSections.map((section, index) => {
          const IconComponent = section.icon;
          return (
            <Card 
              key={index} 
              className={`hover:shadow-md transition-all duration-200 ${
                section.isDanger 
                  ? "border-red-200 hover:border-red-300" 
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Link href={section.href} className="block h-full">
                <CardHeader>
                  <div className="flex items-start space-x-3">
                    <div className={`${section.bgColor} p-2 rounded-lg`}>
                      <IconComponent className={`h-5 w-5 ${section.color}`} aria-hidden="true" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        {section.title}
                      </CardTitle>
                      <CardDescription className="mt-1 text-gray-600">
                        {section.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Link>
            </Card>
          );
        })}
      </div>

      <Separator className="my-10" />

      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">¿Necesitas ayuda?</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
          Consulta nuestro centro de ayuda o contacta con soporte si tienes alguna pregunta sobre tu cuenta.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/ayuda">
            <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
              Centro de Ayuda
            </button>
          </Link>
          <Link href="/contacto">
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
              Contactar Soporte
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}