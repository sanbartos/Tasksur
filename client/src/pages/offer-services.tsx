import React from "react";
import { Button } from "@/components/ui/button";

export default function OfferServices() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-6 text-gray-900">Ofrecer Servicios</h1>
      <p className="mb-8 text-gray-700">
        Aquí puedes publicar los servicios que ofreces para que otros usuarios los encuentren.
      </p>

      {/* Ejemplo de formulario simple */}
      <form className="space-y-6 bg-white p-6 rounded shadow">
        <div>
          <label htmlFor="title" className="block text-gray-700 font-semibold mb-2">
            Título del Servicio
          </label>
          <input
            type="text"
            id="title"
            name="title"
            placeholder="Ej. Reparación de computadoras"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-gray-700 font-semibold mb-2">
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Describe tu servicio con detalle"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-gray-700 font-semibold mb-2">
            Precio
          </label>
          <input
            type="number"
            id="price"
            name="price"
            placeholder="Precio en USD"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
          Publicar Servicio
        </Button>
      </form>
    </main>
  );
}




