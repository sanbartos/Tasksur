// app/privacy/page.tsx
import React from "react";

export const metadata = {
  title: "Política de Privacidad | TaskSur",
  description: "Información sobre cómo TaskSur recopila, usa y protege tus datos personales.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12 text-gray-800">
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Política de Privacidad</h1>
        <p className="text-lg text-gray-600">
          En TaskSur nos tomamos tu privacidad muy en serio. Esta política explica cómo recopilamos, usamos y protegemos tu información.
        </p>
      </section>

      <div className="space-y-8 text-gray-700">
        <section>
          <h2 className="text-2xl font-semibold mb-2">1. Responsable del tratamiento</h2>
          <p>
            El responsable del tratamiento de tus datos personales es <strong>TaskSur</strong>, una empresa registrada en Uruguay. Para consultas, escribinos a <strong>privacidad@tasksur.com</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">2. Información que recopilamos</h2>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Datos de registro (nombre, email, contraseña)</li>
            <li>Información de perfil (foto, habilidades, ubicación)</li>
            <li>Historial de tareas, transacciones y comunicaciones</li>
            <li>Datos de pago procesados por terceros seguros</li>
            <li>Datos técnicos (IP, navegador, cookies)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">3. Finalidad del uso</h2>
          <p>Usamos tus datos para:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Proveer y gestionar los servicios de TaskSur</li>
            <li>Validar identidades y prevenir fraudes</li>
            <li>Procesar pagos y emitir facturas</li>
            <li>Enviar notificaciones importantes</li>
            <li>Mejorar la experiencia del usuario</li>
            <li>Cumplir con obligaciones legales</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">4. Base legal</h2>
          <p>
            El tratamiento de tus datos se basa en tu consentimiento, la ejecución de un contrato, el cumplimiento de obligaciones legales y el interés legítimo de mejorar nuestros servicios.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">5. Destinatarios de los datos</h2>
          <p>
            Compartimos información solo con terceros necesarios para operar la plataforma (procesadores de pago, herramientas de analítica, soporte técnico), todos bajo acuerdos de confidencialidad.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">6. Transferencias internacionales</h2>
          <p>
            Podríamos transferir datos fuera de Uruguay o Argentina cuando usamos servicios en la nube (ej: AWS, Google Cloud), asegurando siempre niveles adecuados de protección.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">7. Derechos del usuario</h2>
          <p>Tenés derecho a:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Acceder a tus datos personales</li>
            <li>Solicitar la rectificación o eliminación</li>
            <li>Revocar tu consentimiento</li>
            <li>Oponerte al tratamiento</li>
            <li>Presentar reclamos ante la autoridad local</li>
          </ul>
          <p className="mt-2">
            Para ejercer tus derechos, escribinos a <strong>privacidad@tasksur.com</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">8. Conservación de datos</h2>
          <p>
            Conservamos tus datos mientras tengas una cuenta activa o según lo exijan obligaciones legales, fiscales o contractuales. Luego, serán eliminados o anonimizados.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">9. Uso de cookies</h2>
          <p>
            Usamos cookies propias y de terceros para mejorar tu experiencia. Podés aceptar o rechazar su uso desde nuestro{" "}
            <a href="/cookies" className="text-blue-600 underline hover:text-blue-800">banner de cookies</a>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">10. Cambios en esta política</h2>
          <p>
            Podremos actualizar esta política periódicamente. Te avisaremos si los cambios son significativos. La última versión siempre estará disponible en esta página.
          </p>
        </section>
      </div>

      <footer className="text-sm text-gray-500 mt-12 text-center">
        Última actualización: {new Date().toLocaleDateString("es-UY", { year: "numeric", month: "long", day: "numeric" })}
      </footer>
    </main>
  );
}





