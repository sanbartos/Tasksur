// app/legal/page.tsx
import React from "react";

export const metadata = {
  title: "Aviso Legal | TaskSur",
  description: "Información legal y condiciones de uso de la plataforma TaskSur.",
};

export default function LegalNoticePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12 text-gray-800">
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Aviso Legal</h1>
        <p className="text-lg text-gray-600">
          Información legal y condiciones generales de uso de la plataforma TaskSur.
        </p>
      </section>

      <div className="space-y-8 text-gray-700">
        <section>
          <h2 className="text-2xl font-semibold mb-2">1. Información del prestador</h2>
          <p>
            TaskSur es una plataforma digital operada por <strong>TaskSur S.R.L.</strong>, empresa registrada en Uruguay, con domicilio en <em>[Dirección completa]</em>. Para consultas legales, contactarse a <a href="mailto:legal@tasksur.com" className="text-blue-600 underline">legal@tasksur.com</a>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">2. Objeto</h2>
          <p>
            El presente Aviso Legal regula el acceso y uso del sitio web y plataforma digital <strong>TaskSur</strong>, cuyo objetivo es conectar usuarios que ofrecen y solicitan servicios tipo marketplace.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">3. Condiciones de uso</h2>
          <p>
            El usuario se compromete a utilizar la plataforma de manera responsable y conforme a la ley vigente en Uruguay y Argentina. No podrá usar TaskSur para actividades ilícitas, ni violar derechos de terceros.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">4. Propiedad intelectual</h2>
          <p>
            Todos los contenidos, marcas, logos, diseños, y software de TaskSur son propiedad exclusiva de TaskSur S.R.L. Queda prohibida su reproducción, distribución o modificación sin autorización expresa.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">5. Responsabilidad</h2>
          <p>
            TaskSur no se responsabiliza por daños o perjuicios derivados del uso de la plataforma ni por las relaciones entre usuarios. La plataforma funciona como intermediaria sin intervenir en contratos ni pagos.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">6. Protección de datos</h2>
          <p>
            El tratamiento de datos personales se rige por la <a href="/privacy" className="text-blue-600 underline">Política de Privacidad</a>. Al usar la plataforma, el usuario acepta dichas condiciones.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">7. Jurisdicción y ley aplicable</h2>
          <p>
            Estos términos se rigen por las leyes de Uruguay. Cualquier conflicto será sometido a la jurisdicción exclusiva de los tribunales de Montevideo, salvo que la legislación local aplicable disponga otra cosa.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">8. Modificaciones</h2>
          <p>
            TaskSur puede modificar este Aviso Legal en cualquier momento, notificando a los usuarios a través del sitio o por correo electrónico.
          </p>
        </section>
      </div>

      <footer className="text-sm text-gray-500 mt-12 text-center">
        Última actualización: {new Date().toLocaleDateString("es-UY", { year: "numeric", month: "long", day: "numeric" })}
      </footer>
    </main>
  );
}
