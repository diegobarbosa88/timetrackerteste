'use client';

import React from 'react';
import { AuthProvider } from '../lib/auth';

// Componente que envuelve toda la aplicación con el proveedor de autenticación
export default function Providers({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
