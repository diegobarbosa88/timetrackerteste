'use client';

import React, { useState, useEffect } from 'react';

// Componente wrapper para autenticación del lado del cliente
const ClientAuthWrapper = ({ children }) => {
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Este código solo se ejecuta en el cliente
    setIsClient(true);
    setIsLoading(false);
  }, []);

  // Mientras se carga, mostrar un spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-gray-600">Cargando...</p>
      </div>
    );
  }

  // Solo renderizar el contenido en el cliente
  if (!isClient) {
    return null;
  }

  // Renderizar los hijos cuando estamos en el cliente
  return <>{children}</>;
};

export default ClientAuthWrapper;
