'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth';
import ClientAuthWrapper from '../../../lib/client-auth-wrapper';

// Componente interno que contiene la lógica y UI de la página de cronómetro
const CronometroPageContent = () => {
  const { user, isAuthenticated } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [selectedClient, setSelectedClient] = useState('');
  const [clients, setClients] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState(null);

  // Cargar clientes y entradas de tiempo al montar el componente
  useEffect(() => {
    // Cargar clientes
    const loadClients = () => {
      try {
        const storedClients = localStorage.getItem('timetracker_clients');
        if (storedClients) {
          const parsedClients = JSON.parse(storedClients);
          // Filtrar solo clientes activos
          setClients(parsedClients.filter(client => client.active));
        }
      } catch (error) {
        console.error('Error al cargar clientes:', error);
      }
    };

    // Cargar entradas de tiempo
    const loadTimeEntries = () => {
      try {
        const storedEntries = localStorage.getItem(`timetracker_entries_${user.id}`);
        if (storedEntries) {
          setTimeEntries(JSON.parse(storedEntries));
        }
      } catch (error) {
        console.error('Error al cargar entradas de tiempo:', error);
      }
    };

    // Verificar si hay una entrada activa
    const checkActiveEntry = () => {
      try {
        const activeEntryStr = localStorage.getItem(`timetracker_active_entry_${user.id}`);
        if (activeEntryStr) {
          const activeEntry = JSON.parse(activeEntryStr);
          setCurrentEntry(activeEntry);
          setSelectedClient(activeEntry.clientId);
          setStartTime(new Date(activeEntry.startTime));
          setIsRunning(true);
          
          // Calcular tiempo transcurrido
          const elapsed = Math.floor((new Date() - new Date(activeEntry.startTime)) / 1000);
          setElapsedTime(elapsed);
        }
      } catch (error) {
        console.error('Error al verificar entrada activa:', error);
      }
    };

    loadClients();
    if (user && user.id) {
      loadTimeEntries();
      checkActiveEntry();
    }
  }, [user]);

  // Actualizar el tiempo transcurrido cada segundo
  useEffect(() => {
    let interval = null;
    
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((new Date() - startTime) / 1000));
      }, 1000);
    } else if (!isRunning && elapsedTime !== 0) {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, startTime, elapsedTime]);

  // Formatear segundos a formato HH:MM:SS
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  // Iniciar el cronómetro
  const startTimer = () => {
    if (!selectedClient) {
      alert('Por favor selecciona un cliente antes de iniciar el cronómetro.');
      return;
    }
    
    const now = new Date();
    setStartTime(now);
    setIsRunning(true);
    setElapsedTime(0);
    
    // Crear nueva entrada de tiempo
    const newEntry = {
      id: `entry_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      clientId: selectedClient,
      clientName: clients.find(c => c.id === selectedClient)?.name || selectedClient,
      startTime: now.toISOString(),
      endTime: null,
      duration: 0,
      notes: '',
      status: 'active'
    };
    
    setCurrentEntry(newEntry);
    
    // Guardar entrada activa en localStorage
    localStorage.setItem(`timetracker_active_entry_${user.id}`, JSON.stringify(newEntry));
  };

  // Detener el cronómetro
  const stopTimer = () => {
    if (!isRunning) return;
    
    const now = new Date();
    setIsRunning(false);
    
    // Actualizar entrada actual
    const duration = Math.floor((now - startTime) / 1000);
    const updatedEntry = {
      ...currentEntry,
      endTime: now.toISOString(),
      duration: duration,
      status: 'completed'
    };
    
    // Actualizar lista de entradas
    const updatedEntries = [...timeEntries, updatedEntry];
    setTimeEntries(updatedEntries);
    setCurrentEntry(null);
    
    // Guardar en localStorage
    localStorage.setItem(`timetracker_entries_${user.id}`, JSON.stringify(updatedEntries));
    localStorage.removeItem(`timetracker_active_entry_${user.id}`);
  };

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Cronómetro de Tiempo</h1>
        
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <div className="mb-4">
            <label htmlFor="client" className="block text-gray-700 text-sm font-bold mb-2">
              Cliente
            </label>
            <select
              id="client"
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              disabled={isRunning}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Selecciona un cliente</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="text-center py-8">
            <div className="text-6xl font-mono font-bold mb-8">
              {formatTime(elapsedTime)}
            </div>
            
            <div className="flex justify-center space-x-4">
              {!isRunning ? (
                <button
                  onClick={startTimer}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Iniciar
                </button>
              ) : (
                <button
                  onClick={stopTimer}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                  Detener
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <h2 className="text-xl font-bold text-gray-900 p-4 bg-gray-50 border-b">
            Registros Recientes
          </h2>
          
          {timeEntries.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No hay registros de tiempo. Inicia el cronómetro para crear tu primer registro.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Inicio
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fin
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duración
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[...timeEntries].reverse().slice(0, 5).map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {entry.clientName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(entry.startTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.endTime ? formatDate(entry.endTime) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTime(entry.duration)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {timeEntries.length > 5 && (
            <div className="p-4 border-t text-center">
              <a 
                href="/reports" 
                className="text-blue-600 hover:text-blue-800"
              >
                Ver todos los registros
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente principal que envuelve el contenido con ClientAuthWrapper
export default function CronometroPage() {
  return (
    <ClientAuthWrapper>
      <CronometroPageContent />
    </ClientAuthWrapper>
  );
}
