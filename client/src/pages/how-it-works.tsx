import React from "react";
import { ClipboardList, UserCheck, CreditCard, Smile } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: <ClipboardList className="w-12 h-12 text-blue-600 mx-auto mb-4" />,
      title: "Publica tu tarea",
      description:
        "Describe lo que necesitas y recibe ofertas de profesionales calificados rápidamente.",
    },
    {
      icon: <UserCheck className="w-12 h-12 text-green-600 mx-auto mb-4" />,
      title: "Elige al mejor profesional",
      description:
        "Revisa perfiles, valoraciones y elige al que mejor se adapte a tus necesidades.",
    },
    {
      icon: <CreditCard className="w-12 h-12 text-purple-600 mx-auto mb-4" />,
      title: "Paga de forma segura",
      description:
        "Realiza el pago a través de nuestra plataforma con total confianza y seguridad.",
    },
    {
      icon: <Smile className="w-12 h-12 text-yellow-500 mx-auto mb-4" />,
      title: "Disfruta del servicio",
      description:
        "Recibe el trabajo realizado y califica al profesional para ayudar a otros usuarios.",
    },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-r from-blue-50 to-white min-h-screen">
      <h1 className="text-5xl font-extrabold text-center text-gray-900 mb-12">
        Cómo Funciona TaskSur
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {steps.map(({ icon, title, description }, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-2xl transition-shadow duration-300"
          >
            {icon}
            <h2 className="text-xl font-semibold mb-3 text-gray-900">{title}</h2>
            <p className="text-gray-600">{description}</p>
          </div>
        ))}
      </div>

      <section className="mt-20 text-center">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">
          ¿Listo para comenzar?
        </h2>
        <p className="max-w-xl mx-auto text-gray-700 mb-8">
          Ãšnete a miles de usuarios que ya disfrutan de servicios confiables y profesionales.
        </p>
        <a
          href="/register"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition"
        >
          Crear Cuenta
        </a>
      </section>
    </main>
  );
}




