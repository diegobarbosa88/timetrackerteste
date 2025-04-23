'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../lib/auth';
import ClientAuthWrapper from '../../../../lib/client-auth-wrapper';

// Componente interno que contiene la lógica y UI de la página de añadir cliente
const AddClientPageContent = () => {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Verificar si el usuario es administrador
  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p className="font-bold">Acceso denegado</p>
          <p>No tienes permisos para acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Generar ID único para el cliente
      const generateClientId = () => {
        const storedClients = localStorage.getItem('timetracker_clients');
        let clients = [];
        
        if (storedClients) {
          clients = JSON.parse(storedClients);
        }
        
        // Encontrar el último ID numérico
        let lastId = 0;
        clients.forEach(client => {
          const idNum = parseInt(client.id.replace('CLI', ''));
          if (!isNaN(idNum) && idNum > lastId) {
            lastId = idNum;
          }
        });
        
        // Generar nuevo ID
        const newId = `CLI${String(lastId + 1).padStart(3, '0')}`;
        return newId;
      };

      // Crear nuevo cliente
      const newClient = {
        id: generateClientId(),
        name: formData.name,
        contact: formData.contact,
        notes: formData.notes,
        active: true,
        createdBy: user.id,
        createdAt: new Date().toISOString()
      };

      // Guardar en localStorage
      const storedClients = localStorage.getItem('timetracker_clients');
      let clients = [];
      
      if (storedClients) {
        clients = JSON.parse(storedClients);
      }
      
      clients.push(newClient);
      localStorage.setItem('timetracker_clients', JSON.stringify(clients));

      // Redireccionar a la lista de clientes
      router.push('/admin/clients');
    } catch (error) {
      setError('Error al guardar el cliente');
      console.error('Error al guardar cliente:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Añadir Nuevo Cliente</h1>
          <a 
            href="/admin/clients" 
            className="text-blue-600 hover:text-blue-800"
          >
            Volver a la lista
          </a>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
              Nombre del Cliente *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="contact" className="block text-gray-700 text-sm font-bold mb-2">
              Contacto *
            </label>
            <input
              type="text"
              id="contact"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Email o teléfono"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="notes" className="block text-gray-700 text-sm font-bold mb-2">
              Notas
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            ></textarea>
          </div>
          
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => router.push('/admin/clients')}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente principal que envuelve el contenido con ClientAuthWrapper
export default function AddClientPage() {
  return (
    <ClientAuthWrapper>
      <AddClientPageContent />
    </ClientAuthWrapper>
  );
}
