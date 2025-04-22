'use client';

import React from 'react';
import Link from 'next/link';

// Página 404 extremadamente simplificada sin ninguna dependencia externa
export default function NotFound() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f9fafb'
    }}>
      <div style={{ 
        textAlign: 'center', 
        padding: '2rem', 
        maxWidth: '28rem' 
      }}>
        <h1 style={{ 
          fontSize: '3.75rem', 
          fontWeight: 'bold', 
          color: '#2563eb', 
          marginBottom: '1rem' 
        }}>404</h1>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '600', 
          color: '#1f2937', 
          marginBottom: '1rem' 
        }}>Página no encontrada</h2>
        <p style={{ 
          color: '#4b5563', 
          marginBottom: '2rem' 
        }}>
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <Link href="/" style={{ 
          display: 'inline-block', 
          padding: '0.75rem 1.5rem', 
          backgroundColor: '#2563eb', 
          color: 'white', 
          fontWeight: '500', 
          borderRadius: '0.375rem', 
          textDecoration: 'none'
        }}>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
