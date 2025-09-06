// components/CookieBanner.tsx
"use client";

import React, { useEffect, useState } from "react";

const COOKIE_KEY = "cookie_consent";

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleConsent = (accepted: boolean) => {
    localStorage.setItem(COOKIE_KEY, accepted ? "accepted" : "rejected");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-white shadow-lg border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between">
      <div className="text-sm text-gray-700 mb-3 sm:mb-0 sm:mr-4">
        Utilizamos cookies para mejorar tu experiencia. Al continuar navegando aceptás nuestra{" "}
        <a
          href="/cookies"
          className="text-blue-600 underline hover:text-blue-800 transition"
        >
          política de cookies
        </a>
        .
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => handleConsent(false)}
          className="px-4 py-2 text-sm border border-gray-400 rounded-md text-gray-600 hover:bg-gray-100"
        >
          Rechazar
        </button>
        <button
          onClick={() => handleConsent(true)}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
}
