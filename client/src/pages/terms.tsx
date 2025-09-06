// app/terms/page.tsx
import React from "react";

export const metadata = {
  title: "Términos y Condiciones | TaskSur",
  description: "Leé los términos legales para usar TaskSur en Uruguay y Argentina como usuario o proveedor de servicios.",
};

export default function TermsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12 text-gray-800">
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Términos y Condiciones</h1>
        <p className="text-lg text-gray-600">
          Leé detenidamente estos términos antes de utilizar nuestra plataforma.
        </p>
      </section>

      <div className="space-y-8 text-gray-700">
        <section>
          <h2 className="text-2xl font-semibold mb-2">1. Aceptación de los términos</h2>
          <p>
            Al registrarte, acceder o usar la plataforma TaskSur, aceptás estos Términos y Condiciones de uso. Si no estás de acuerdo, no debés utilizar nuestros servicios.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">2. Descripción del servicio</h2>
          <p>
            TaskSur es una plataforma que conecta a personas que necesitan realizar tareas con prestadores de servicios ("taskers"). Actuamos como intermediarios digitales, pero no somos parte del contrato entre usuarios.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">3. Registro de usuarios</h2>
          <p>
            Para usar la plataforma necesitás crear una cuenta con datos verídicos y mantenerla actualizada. TaskSur puede suspender o eliminar cuentas que incumplan estos términos.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">4. Responsabilidad de las partes</h2>
          <p>
            TaskSur no es responsable por la calidad, cumplimiento o resultados de las tareas acordadas entre usuarios. Cada parte asume su responsabilidad y debe actuar de buena fe.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">5. Pagos y comisiones</h2>
          <p>
            Los pagos se realizan a través de medios habilitados por TaskSur. Aplicamos una comisión por el uso de la plataforma, visible antes de confirmar cada transacción. Los precios se expresan en moneda local (UYU o ARS).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">6. Cancelaciones y reembolsos</h2>
          <p>
            Cada tarea puede tener condiciones específicas de cancelación. En casos de disputa, TaskSur intermediará para resolverla de forma justa, pero no garantiza reembolsos automáticos.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">7. Conducta del usuario</h2>
          <p>
            Está prohibido utilizar TaskSur para actividades ilegales, engañosas o abusivas. Nos reservamos el derecho de suspender cuentas sin previo aviso ante conductas inapropiadas.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">8. Protección de datos</h2>
          <p>
            Cumplimos con la Ley N° 18.331 (Uruguay) y Ley 25.326 (Argentina) de protección de datos personales. Más información en nuestra{" "}
            <a href="/privacy" className="text-blue-600 underline hover:text-blue-800">Política de Privacidad</a>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">9. Modificaciones</h2>
          <p>
            TaskSur puede modificar estos términos en cualquier momento. Los cambios entrarán en vigencia al publicarse en esta página. Se recomienda revisar periódicamente.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">10. Jurisdicción</h2>
          <p>
            En caso de conflicto legal, la jurisdicción será la de los tribunales competentes en Uruguay o Argentina, según corresponda al país desde el cual se utiliza la plataforma.
          </p>
        </section>
      </div>

      <footer className="text-sm text-gray-500 mt-12 text-center">
        Última actualización: {new Date().toLocaleDateString("es-UY", { year: "numeric", month: "long", day: "numeric" })}
      </footer>
    </main>
  );
}




