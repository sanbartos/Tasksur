// app/about/page.tsx
import React from "react";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Sobre Nosotros | Sudatasker",
  description:
    "Conocé la misión y el equipo detrás de Sudatasker, la plataforma que conecta personas que necesitan ayuda con quienes pueden brindar servicios en Uruguay y Argentina.",
};

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12 text-gray-800">
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Sobre Sudatasker</h1>
        <p className="text-lg text-gray-600">
          Conectamos personas que necesitan ayuda con quienes pueden brindar servicios. Operamos en Uruguay y Argentina para transformar el acceso a tareas y soluciones cotidianas.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-4">Nuestra misión</h2>
        <p className="text-gray-700 leading-relaxed">
          En Sudatasker creemos en el poder de la colaboración local. Nuestra misión es ofrecer una plataforma segura, intuitiva y eficiente que permita a cualquier persona publicar tareas y encontrar expertos dispuestos a realizarlas, fomentando el trabajo independiente y la economía colaborativa en Sudamérica.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-4">¿Qué hacemos?</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Conectamos usuarios que necesitan servicios con quienes pueden realizarlos.</li>
          <li>Facilitamos pagos seguros y controlados entre partes.</li>
          <li>Promovemos la confianza mediante calificaciones, reseñas y soporte.</li>
          <li>Operamos cumpliendo normativas locales de Uruguay y Argentina.</li>
        </ul>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-4">Nuestro equipo</h2>
        <p className="text-gray-700 leading-relaxed">
          Sudatasker fue fundada por un equipo de profesionales de Uruguay con experiencia en tecnología, diseño y servicios. Nuestro compromiso es construir una plataforma pensada desde el sur para el sur, promoviendo el desarrollo regional.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-4">¿Dónde operamos?</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Actualmente estamos operando en:
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li><strong>Uruguay:</strong> Montevideo y principales ciudades.</li>
          <li><strong>Argentina:</strong> Buenos Aires, Córdoba, Rosario y más.</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">¿Querés saber más?</h2>
        <p className="text-gray-700">
          Podés contactarnos directamente desde nuestra <Link href="/contact" className="text-blue-600 hover:underline">página de contacto</Link> o seguirnos en redes sociales para estar al tanto de nuestras novedades.
        </p>
      </section>

      <div className="text-center mt-12">
        <Image
          src="/logo.png"
          alt="Sudatasker logo"
          width={120}
          height={120}
          className="mx-auto mb-4"
        />
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} Sudatasker. Todos los derechos reservados.
        </p>
      </div>
    </main>
  );
}
