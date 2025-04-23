'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../../lib/auth';
import ClientAuthWrapper from '../../../../lib/client-auth-wrapper';

// Componente interno que contiene la lógica y UI
const EditClientPageContent = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  // Añadir verificación de nulos para searchParams
  const clientId = searchParams?.get('id') || '';
  
  const [clientData, setClientData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    active: true
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verificar si el usuario es administrador
  useEffect(() => {
    if (isAuthenticated && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isAdmin, router]);

  // Cargar datos del cliente
  useEffect(() => {
    const loadClientData = () => {
      if (!clientId) {
        setError('ID de cliente no proporcionado');
        setIsLoading(false);
        return;
      }

      try {
        const storedClients = localStorage.getItem('timetracker_clients');
        if (storedClients) {
          const clients = JSON.parse(storedClients);
          const client = clients.find(c => c.id === clientId);
          
          if (client) {
            setClientData(client);
          } else {
            setError('Cliente no encontrado');
          }
        } else {
          setError('No hay clientes almacenados');
        }
      } catch (error) {
        console.error('Error al cargar datos del cliente:', error);
        setError('Error al cargar datos del cliente');
      } finally {
        setIsLoading(false);
      }
    };

    if (clientId) {
      loadClientData();
    } else {
      setIsLoading(false);
    }
  }, [clientId]);

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setClientData({
      ...clientData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsSubmitting(true);

    try {
      // Validar campos requeridos
      if (!clientData.name) {
        setError('El nombre del cliente es obligatorio');
        setIsSubmitting(false);
        return;
      }

      // Obtener clientes actuales
      const storedClients = localStorage.getItem('timetracker_clients');
      let clients = [];
      
      if (storedClients) {
        clients = JSON.parse(storedClients);
      }

      // Actualizar cliente existente
      const updatedClients = clients.map(client => 
        client.id === clientData.id ? clientData : client
      );

      // Guardar en localStorage
      localStorage.setItem('timetracker_clients', JSON.stringify(updatedClients));
      
      setSuccess(true);
      
      // Redirigir después de un breve retraso
      setTimeout(() => {
        router.push('/admin/clients');
      }, 1500);
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      setError('Error al actualizar cliente');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center p-8">Cargando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar Cliente</h1>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
            <p className="font-bold">¡Cliente actualizado!</p>
            <p>El cliente se ha actualizado correctamente.</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
              Nombre *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={clientData.name}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Nombre del cliente"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={clientData.email}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Email del cliente"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={clientData.phone}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Teléfono del cliente"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="address" className="block text-gray-700 text-sm font-bold mb-2">
              Dirección
            </label>
            <textarea
              id="address"
              name="address"
              value={clientData.address}
              onChange={handleChange}
              rows="3"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Dirección del cliente"
            ></textarea>
          </div>
          
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="active"
                checked={clientData.active}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-gray-700">Cliente activo</span>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push('/admin/clients')}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente principal que envuelve el contenido con ClientAuthWrapper
export default function EditClientPage() {
  return (
    <ClientAuthWrapper>
      <EditClientPageContent />
    </ClientAuthWrapper>
  );
}
