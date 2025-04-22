'use client';

import React from 'react';
import Link from 'next/link';

// Página de error 500 simplificada que no depende del contexto de autenticación
export default function Error500() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 max-w-md">
        <h1 className="text-6xl font-bold text-red-600 mb-4">500</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Error del servidor</h2>
        <p className="text-gray-600 mb-8">
          Lo sentimos, ha ocurrido un error en el servidor. Estamos trabajando para solucionarlo.
        </p>
        <Link href="/" className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
