'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth';
import ClientAuthWrapper from '../../../lib/client-auth-wrapper';

// Componente interno que contiene la lógica y UI de la página de clientes
const ClientsPageContent = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

  // Cargar clientes al montar el componente
  useEffect(() => {
    const loadClients = () => {
      try {
        const storedClients = localStorage.getItem('timetracker_clients');
        if (storedClients) {
          setClients(JSON.parse(storedClients));
        } else {
          // Datos de muestra si no hay clientes guardados
          const sampleClients = [
            { id: 'CLI001', name: 'Cliente A', contact: 'contacto@clientea.com', active: true },
            { id: 'CLI002', name: 'Cliente B', contact: 'contacto@clienteb.com', active: true },
            { id: 'CLI003', name: 'Cliente C', contact: 'contacto@clientec.com', active: false },
            { id: 'CLI004', name: 'Cliente D', contact: 'contacto@cliented.com', active: true },
          ];
          localStorage.setItem('timetracker_clients', JSON.stringify(sampleClients));
          setClients(sampleClients);
        }
      } catch (error) {
        console.error('Error al cargar clientes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadClients();
  }, []);

  // Función para desactivar un cliente
  const deactivateClient = (clientId) => {
    const updatedClients = clients.map(client => 
      client.id === clientId ? { ...client, active: false } : client
    );
    
    localStorage.setItem('timetracker_clients', JSON.stringify(updatedClients));
    setClients(updatedClients);
    setShowDeleteModal(false);
  };

  // Función para confirmar eliminación
  const confirmDelete = (client) => {
    setClientToDelete(client);
    setShowDeleteModal(true);
  };

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

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h1>
        <a 
          href="/admin/clients/add-client" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Añadir Cliente
        </a>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-3 text-gray-600">Cargando clientes...</p>
        </div>
      ) : (
        <>
          {clients.length === 0 ? (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
              <p>No hay clientes registrados. Añade tu primer cliente.</p>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clients.map((client) => (
                    <tr key={client.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {client.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {client.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {client.contact}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          client.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {client.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <a 
                          href={`/admin/clients/edit-client?id=${client.id}`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Editar
                        </a>
                        {client.active && (
                          <button 
                            onClick={() => confirmDelete(client)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Desactivar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Modal de confirmación */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmar desactivación</h3>
                <p className="text-gray-600 mb-6">
                  ¿Estás seguro de que deseas desactivar al cliente <strong>{clientToDelete?.name}</strong>? 
                  Esta acción no eliminará al cliente, solo lo marcará como inactivo.
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => deactivateClient(clientToDelete?.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Desactivar
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Componente principal que envuelve el contenido con ClientAuthWrapper
export default function ClientsPage() {
  return (
    <ClientAuthWrapper>
      <ClientsPageContent />
    </ClientAuthWrapper>
  );
}
