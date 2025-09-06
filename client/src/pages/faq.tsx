// app/faq/page.tsx
import React from "react";

export const metadata = {
  title: "Preguntas Frecuentes | TaskSur",
  description: "Respuestas a las preguntas más comunes sobre cómo funciona TaskSur en Uruguay y Argentina.",
};

export default function FAQPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12 text-gray-800">
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Preguntas Frecuentes</h1>
        <p className="text-lg text-gray-600">
          Aquí encontrarás respuestas a las dudas más comunes sobre el uso de nuestra plataforma.
        </p>
      </section>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">¿Qué es TaskSur?</h2>
          <p className="text-gray-700 mt-2">
            TaskSur es una plataforma digital que conecta personas que necesitan realizar tareas con otras que están dispuestas a hacerlas. Operamos en Uruguay y Argentina para facilitar servicios locales de manera segura y eficiente.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">¿Cómo funciona TaskSur?</h2>
          <p className="text-gray-700 mt-2">
            Publicás una tarea que necesitás resolver, como por ejemplo armar un mueble o reparar algo. Personas que ofrecen servicios ("taskers") pueden postularse. Luego elegís a la persona que mejor se adapte a tu necesidad.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">¿Cuánto cuesta usar TaskSur?</h2>
          <p className="text-gray-700 mt-2">
            Crear una cuenta y publicar tareas es gratis. Solo pagás cuando contratás un servicio. Los taskers definen sus tarifas, y TaskSur cobra una pequeña comisión por el uso de la plataforma.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">¿Puedo pagar en pesos uruguayos o argentinos?</h2>
          <p className="text-gray-700 mt-2">
            Sí, aceptamos pagos en moneda local dependiendo del país desde el cual accedas. Los pagos se procesan de forma segura a través de pasarelas habilitadas para cada país.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">¿Qué pasa si tengo un problema con un servicio?</h2>
          <p className="text-gray-700 mt-2">
            Contamos con un equipo de soporte que puede ayudarte ante cualquier inconveniente. También podés calificar y dejar una reseña sobre el tasker, lo cual ayuda a mantener la calidad del servicio en la comunidad.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">¿Es seguro usar TaskSur?</h2>
          <p className="text-gray-700 mt-2">
            Sí. Verificamos perfiles, usamos sistemas de pago seguros y contamos con sistemas de reputación y soporte para garantizar una experiencia confiable tanto para quienes contratan como para quienes ofrecen servicios.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">¿Cómo me registro como tasker?</h2>
          <p className="text-gray-700 mt-2">
            Simplemente creá una cuenta y completá tu perfil con tus habilidades, ubicación y documentación requerida. Una vez aprobado, podrás comenzar a postularte a tareas.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">¿Puedo trabajar desde Argentina para tareas en Uruguay (o viceversa)?</h2>
          <p className="text-gr
