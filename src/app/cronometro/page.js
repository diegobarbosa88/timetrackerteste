'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import ClientAuthWrapper from '../../lib/client-auth-wrapper';

// Componente interno que contiene la lógica y UI de la página de cronómetro
const CronometroPageContent = () => {
  const { user, isAuthenticated } = useAuth();
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [notes, setNotes] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [currentEntry, setCurrentEntry] = useState(null);

  // Cargar clientes al montar el componente
  useEffect(() => {
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

    loadClients();
  }, []);

  // Efecto para el cronómetro
  useEffect(() => {
    let interval = null;
    
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds + 1);
      }, 1000);
    } else if (!isRunning && seconds !== 0) {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, seconds]);

  // Formatear segundos a formato hh:mm:ss
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  };

  // Iniciar el cronómetro
  const startTimer = () => {
    if (!selectedClient) {
      alert('Por favor selecciona un cliente antes de iniciar el cronómetro');
      return;
    }
    
    const now = new Date();
    setStartTime(now);
    setIsRunning(true);
    
    // Crear una nueva entrada de tiempo
    const newEntry = {
      id: `entry_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      clientId: selectedClient,
      clientName: clients.find(c => c.id === selectedClient)?.name || selectedClient,
      startTime: now.toISOString(),
      endTime: null,
      duration: 0,
      notes: notes,
      status: 'running'
    };
    
    setCurrentEntry(newEntry);
  };

  // Detener el cronómetro
  const stopTimer = () => {
    if (!isRunning) return;
    
    const now = new Date();
    setIsRunning(false);
    
    // Actualizar la entrada actual
    if (currentEntry) {
      const updatedEntry = {
        ...currentEntry,
        endTime: now.toISOString(),
        duration: seconds,
        notes: notes,
        status: 'completed'
      };
      
      // Guardar en localStorage
      const storedEntries = localStorage.getItem(`timetracker_entries_${user.id}`);
      let entries = [];
      
      if (storedEntries) {
        entries = JSON.parse(storedEntries);
      }
      
      entries.push(updatedEntry);
      localStorage.setItem(`timetracker_entries_${user.id}`, JSON.stringify(entries));
      
      // Resetear el estado
      setCurrentEntry(null);
      setSeconds(0);
      setNotes('');
    }
  };

  // Resetear el cronómetro
  const resetTimer = () => {
    setIsRunning(false);
    setSeconds(0);
    setStartTime(null);
    setCurrentEntry(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Cronómetro de Tiempo</h1>
        
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="text-center mb-6">
            <div className="text-6xl font-mono font-bold mb-4">{formatTime(seconds)}</div>
            
            <div className="flex justify-center space-x-4">
              {!isRunning ? (
                <button
                  onClick={startTimer}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded"
                >
                  Iniciar
                </button>
              ) : (
                <button
                  onClick={stopTimer}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded"
                >
                  Detener
                </button>
              )}
              
              <button
                onClick={resetTimer}
                disabled={isRunning}
                className={`bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded ${
                  isRunning ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Reiniciar
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="client" className="block text-gray-700 text-sm font-bold mb-2">
              Cliente *
            </label>
            <select
              id="client"
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              disabled={isRunning}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                isRunning ? 'bg-gray-100' : ''
              }`}
            >
              <option value="">Selecciona un cliente</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="notes" className="block text-gray-700 text-sm font-bold mb-2">
              Notas
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Descripción de las tareas realizadas"
            ></textarea>
          </div>
        </div>
        
        {currentEntry && (
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4" role="alert">
            <p className="font-bold">Registro en curso</p>
            <p>Cliente: {currentEntry.clientName}</p>
            <p>Inicio: {new Date(currentEntry.startTime).toLocaleString()}</p>
          </div>
        )}
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
