// app/contact/page.tsx
import React, { useState } from "react";

export const metadata = {
  title: "Contacto | TaskSur",
  description: "Ponte en contacto con TaskSur para consultas, soporte o información.",
};

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones simples
    if (!formData.name || !formData.email || !formData.message) {
      setError("Por favor, completa todos los campos obligatorios.");
      return;
    }

    try {
      // Aquí iría la llamada a tu API para enviar el mensaje
      // await fetch('/api/contact', { method: 'POST', body: JSON.stringify(formData) });

      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setError("Hubo un problema al enviar el mensaje. Intenta nuevamente más tarde.");
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 text-gray-800">
      <section className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Contacto</h1>
        <p className="text-lg text-gray-600">
          ¿Tenés alguna consulta o necesitás ayuda? Completa el formulario y te responderemos a la brevedad.
        </p>
      </section>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md">{error}</div>
        )}
        {submitted && (
          <div className="bg-green-100 text-green-700 p-3 rounded-md">
            ¡Mensaje enviado con éxito! Gracias por contactarte con TaskSur.
          </div>
        )}

        <div>
          <label htmlFor="name" className="block font-semibold mb-1">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Tu nombre"
          />
        </div>

        <div>
          <label htmlFor="email" className="block font-semibold mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="tuemail@ejemplo.com"
          />
        </div>

        <div>
          <label htmlFor="subject" className="block font-semibold mb-1">
            Asunto
          </label>
          <input
            type="text"
            name="subject"
            id="subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Motivo de tu consulta"
          />
        </div>

        <div>
          <label htmlFor="message" className="block font-semibold mb-1">
            Mensaje <span className="text-red-500">*</span>
          </label>
          <textarea
            name="message"
            id="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={5}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Escribe tu mensaje aquí"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
        >
          Enviar
        </button>
      </form>

      <section className="mt-16 text-center text-gray-600 text-sm">
        <p>También podés contactarnos por email: <a href="mailto:contacto@tasksur.com" className="underline text-blue-600">contacto@tasksur.com</a></p>
        <p>O por teléfono: <a href="tel:+59812345678" className="underline text-blue-600">+598 1234 5678</a></p>
      </section>
    </main>
  );
}
