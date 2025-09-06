import React, { useState } from "react";

const sections = [
  { id: "seguridad", title: "Política de Seguridad de la Información" },
  { id: "privacidad", title: "Política de Privacidad" },
  { id: "cookies", title: "Política de Cookies" },
  { id: "reembolsos", title: "Política de Reembolsos y Cancelaciones" },
  { id: "terminos", title: "Términos y Condiciones" },
  { id: "uso", title: "Política de Uso Aceptable" },
  { id: "aviso", title: "Aviso Legal y Disclaimer" },
  { id: "datos", title: "Consentimiento para el Tratamiento de Datos Personales" },
  { id: "propiedad", title: "Propiedad Intelectual" },
  { id: "marketing", title: "Política de Comunicaciones y Marketing" },
];

const Policies: React.FC = () => {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <nav className="hidden md:block w-64 bg-white shadow-lg sticky top-0 h-screen overflow-y-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Políticas</h2>
        <ul className="space-y-3">
          {sections.map(({ id, title }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className="text-blue-600 hover:underline cursor-pointer"
              >
                {title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-8 max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-10">Políticas de TaskSur</h1>

        {/* Secciones */}
        <section id="seguridad" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Política de Seguridad de la Información</h2>
          <p>
            En TaskSur nos comprometemos a proteger la información de nuestros usuarios y garantizar la seguridad de nuestros sistemas. Para ello, aplicamos las siguientes medidas:
          </p>
          <ul className="list-disc list-inside mt-3 space-y-1">
            <li><strong>Confidencialidad:</strong> Solo el personal autorizado tiene acceso a los datos personales.</li>
            <li><strong>Integridad:</strong> Protegemos la información para que no sea alterada de forma no autorizada.</li>
            <li><strong>Disponibilidad:</strong> Implementamos sistemas de respaldo y mantenimiento para asegurar la disponibilidad del servicio.</li>
            <li><strong>Medidas técnicas:</strong> Utilizamos cifrado SSL/TLS, firewalls, y monitoreo continuo para prevenir accesos no autorizados.</li>
            <li><strong>Capacitación:</strong> Nuestro equipo recibe formación en buenas prácticas de seguridad.</li>
            <li><strong>Respuesta ante incidentes:</strong> Contamos con protocolos para detectar y mitigar incidentes de seguridad rápidamente.</li>
          </ul>
          <p className="mt-3">Si sospecha alguna vulneración a la seguridad, por favor contáctenos a <a href="mailto:contacto@tasksur.com" className="text-blue-600 underline">contacto@tasksur.com</a>.</p>
        </section>

        <section id="privacidad" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Política de Privacidad</h2>
          <p>
            En TaskSur valoramos su privacidad y estamos comprometidos con la protección de sus datos personales. Esta política describe cómo recopilamos, usamos y protegemos su información.
          </p>
          <ul className="list-disc list-inside mt-3 space-y-1">
            <li><strong>Datos recopilados:</strong> Información personal que usted nos proporciona al registrarse o usar nuestros servicios.</li>
            <li><strong>Uso de datos:</strong> Para ofrecer, mejorar y personalizar nuestros servicios, y comunicarnos con usted.</li>
            <li><strong>Protección:</strong> Utilizamos medidas técnicas y organizativas para proteger sus datos.</li>
            <li><strong>Derechos:</strong> Usted puede acceder, corregir o eliminar sus datos contactándonos.</li>
            <li><strong>Compartición:</strong> No vendemos ni alquilamos sus datos a terceros sin consentimiento.</li>
          </ul>
          <p className="mt-3">Para más información, contacte a <a href="mailto:privacidad@tasksur.com" className="text-blue-600 underline">privacidad@tasksur.com</a>.</p>
        </section>

        <section id="cookies" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Política de Cookies</h2>
          <p>
            Usamos cookies para mejorar su experiencia en TaskSur, personalizar contenido y analizar el tráfico. Puede controlar y gestionar las cookies en la configuración de su navegador.
          </p>
          <ul className="list-disc list-inside mt-3 space-y-1">
            <li><strong>Cookies esenciales:</strong> necesarias para el funcionamiento básico de la plataforma.</li>
            <li><strong>Cookies de rendimiento:</strong> recopilan información anónima sobre el uso del sitio.</li>
            <li><strong>Cookies funcionales:</strong> permiten recordar preferencias y personalizar la experiencia.</li>
            <li><strong>Cookies de marketing:</strong> para mostrar anuncios relevantes.</li>
          </ul>
          <p className="mt-3">Al continuar navegando, acepta el uso de cookies. Puede cambiar sus preferencias en cualquier momento.</p>
        </section>

        <section id="reembolsos" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Política de Reembolsos y Cancelaciones</h2>
          <p>
            En TaskSur ofrecemos la posibilidad de cancelar su membresía en cualquier momento. Las condiciones para reembolsos son:
          </p>
          <ul className="list-disc list-inside mt-3 space-y-1">
            <li>Las cancelaciones deben realizarse antes de la próxima facturación para evitar cargos futuros.</li>
            <li>Los reembolsos se aplican solo en casos excepcionales y serán evaluados por nuestro equipo de soporte.</li>
            <li>No se realizan reembolsos por períodos ya utilizados o servicios consumidos.</li>
          </ul>
          <p className="mt-3">Para solicitar cancelaciones o reembolsos, contacte a <a href="mailto:soporte@tasksur.com" className="text-blue-600 underline">soporte@tasksur.com</a>.</p>
        </section>

        <section id="terminos" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Términos y Condiciones</h2>
          <p>
            Al usar TaskSur, usted acepta los siguientes términos:
          </p>
          <ul className="list-disc list-inside mt-3 space-y-1">
            <li>La plataforma es para uso legal y respetuoso con los demás usuarios.</li>
            <li>No se permite publicar contenido ilegal, ofensivo o que infrinja derechos de terceros.</li>
            <li>Nos reservamos el derecho a suspender o eliminar cuentas que violen estas reglas.</li>
            <li>TaskSur no se responsabiliza por actividades externas o acuerdos entre usuarios.</li>
          </ul>
          <p className="mt-3">Para más detalles, revise el resto de nuestras políticas o contacte a <a href="mailto:legal@tasksur.com" className="text-blue-600 underline">legal@tasksur.com</a>.</p>
        </section>

        <section id="uso" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Política de Uso Aceptable</h2>
          <p>
            El uso de TaskSur debe respetar las normas de convivencia y legalidad. Está prohibido:
          </p>
          <ul className="list-disc list-inside mt-3 space-y-1">
            <li>Enviar spam o mensajes no solicitados.</li>
            <li>Publicar contenido falso, engañoso o ilegal.</li>
            <li>Realizar actividades que puedan dañar la plataforma o sus usuarios.</li>
            <li>Usar la plataforma para actividades comerciales no autorizadas.</li>
          </ul>
          <p className="mt-3">Violaciones pueden derivar en suspensión o bloqueo de la cuenta.</p>
        </section>

        <section id="aviso" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Aviso Legal y Disclaimer</h2>
          <p>
            TaskSur no se hace responsable por daños directos o indirectos derivados del uso de la plataforma. Los servicios se ofrecen “tal cual” sin garantías explícitas.
          </p>
          <p>
            Nos reservamos el derecho a modificar o interrumpir servicios sin previo aviso.
          </p>
          <p>
            El usuario asume toda responsabilidad por el uso que haga del servicio.
          </p>
        </section>

        <section id="datos" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Consentimiento para el Tratamiento de Datos Personales</h2>
          <p>
            Al registrarse y usar TaskSur, usted acepta que sus datos personales sean tratados conforme a la legislación vigente en Uruguay y Argentina.
          </p>
          <ul className="list-disc list-inside mt-3 space-y-1">
            <li>Los datos se usarán para proveer servicios, facturación y comunicaciones.</li>
            <li>Puede ejercer sus derechos de acceso, rectificación, cancelación y oposición.</li>
            <li>Los datos no serán
