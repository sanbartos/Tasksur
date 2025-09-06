// app/cookies/page.tsx
import React from "react";

export const metadata = {
  title: "Política de Cookies | TaskSur",
  description:
    "Conocé cómo y por qué TaskSur utiliza cookies para mejorar tu experiencia en la plataforma. Información clara y transparente para usuarios en Uruguay y Argentina.",
};

export default function CookiesPolicyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 text-gray-800">
      <section className="mb-10">
        <h1 className="text-4xl font-bold mb-4">Política de Cookies</h1>
        <p className="text-lg text-gray-600">
          Esta política explica qué son las cookies, cómo las usamos en TaskSur, y cómo podés controlarlas o desactivarlas si lo deseás.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">¿Qué son las cookies?</h2>
        <p className="text-gray-700 leading-relaxed">
          Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitás un sitio web. Se utilizan para recordar tus preferencias, mejorar tu experiencia y recopilar datos estadísticos.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">¿Qué tipos de cookies usamos?</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>
            <strong>Cookies esenciales:</strong> Necesarias para el funcionamiento básico de la plataforma (por ejemplo, inicio de sesión, navegación segura).
          </li>
          <li>
            <strong>Cookies de rendimiento:</strong> Nos ayudan a entender cómo los usuarios interactúan con TaskSur, para mejorar continuamente.
          </li>
          <li>
            <strong>Cookies de funcionalidad:</strong> Guardan tus preferencias (idioma, ubicación, etc.) para personalizar tu experiencia.
          </li>
          <li>
            <strong>Cookies de marketing:</strong> Utilizadas por servicios externos (como redes sociales o anuncios) para mostrarte contenido relevante.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Cookies de terceros</h2>
        <p className="text-gray-700 leading-relaxed">
          TaskSur puede utilizar servicios de terceros como Google Analytics, Facebook Pixel u otros, que también almacenan cookies en tu navegador. Estas cookies están reguladas por las políticas de privacidad de dichos proveedores.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">¿Cómo podés controlar las cookies?</h2>
        <p className="text-gray-700 leading-relaxed mb-2">
          Podés modificar tus preferencias desde tu navegador en cualquier momento. Esto te permite aceptar o rechazar cookies, eliminar las ya almacenadas, o recibir alertas al respecto.
        </p>
        <p className="text-gray-700 leading-relaxed">
          Tené en cuenta que desactivar cookies esenciales puede afectar el funcionamiento de TaskSur.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Consentimiento</h2>
        <p className="text-gray-700 leading-relaxed">
          Al utilizar TaskSur, aceptás el uso de cookies según esta política, salvo que las desactives manualmente desde tu navegador o desde nuestro banner de cookies.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Cambios en esta política</h2>
        <p className="text-gray-700 leading-relaxed">
          Podemos actualizar esta política de cookies para reflejar cambios en nuestras prácticas o por requerimientos legales en Uruguay o Argentina. Te notificaremos de cualquier cambio importante.
        </p>
      </section>

      <section>
        <p className="text-sm text-gray-500 mt-6">
          Última actualización: {new Date().toLocaleDateString("es-UY", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </section>
    </main>
  );
}
