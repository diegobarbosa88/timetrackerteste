'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import ClientAuthWrapper from '../../lib/client-auth-wrapper';

// Componente interno que contiene la lógica y UI de la página de registro manual
const RegistroManualPageContent = () => {
  const { user, isAuthenticated } = useAuth();
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    clientId: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

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

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Calcular duración en segundos
  const calculateDuration = (startTime, endTime) => {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    // Si el tiempo de fin es menor que el de inicio, asumimos que es del día siguiente
    const durationMinutes = endTotalMinutes >= startTotalMinutes 
      ? endTotalMinutes - startTotalMinutes 
      : (24 * 60 - startTotalMinutes) + endTotalMinutes;
    
    return durationMinutes * 60; // Convertir a segundos
  };

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsSubmitting(true);

    try {
      // Validar que se haya seleccionado un cliente
      if (!formData.clientId) {
        setError('Por favor selecciona un cliente');
        setIsSubmitting(false);
        return;
      }

      // Validar que la hora de fin sea posterior a la de inicio
      const startTotalMinutes = formData.startTime.split(':').map(Number).reduce((acc, val, i) => acc + (i === 0 ? val * 60 : val), 0);
      const endTotalMinutes = formData.endTime.split(':').map(Number).reduce((acc, val, i) => acc + (i === 0 ? val * 60 : val), 0);
      
      if (endTotalMinutes <= startTotalMinutes) {
        setError('La hora de fin debe ser posterior a la hora de inicio');
        setIsSubmitting(false);
        return;
      }

      // Crear objeto de fecha para inicio y fin
      const dateObj = new Date(formData.date);
      const startDateTime = new Date(dateObj);
      const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
      startDateTime.setHours(startHours, startMinutes, 0);

      const endDateTime = new Date(dateObj);
      const [endHours, endMinutes] = formData.endTime.split(':').map(Number);
      endDateTime.setHours(endHours, endMinutes, 0);

      // Calcular duración
      const duration = calculateDuration(formData.startTime, formData.endTime);

      // Crear nueva entrada de tiempo
      const newEntry = {
        id: `entry_${Date.now()}`,
        userId: user.id,
        userName: user.name,
        clientId: formData.clientId,
        clientName: clients.find(c => c.id === formData.clientId)?.name || formData.clientId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        duration: duration,
        notes: formData.notes,
        status: 'completed',
        manualEntry: true
      };

      // Guardar en localStorage
      const storedEntries = localStorage.getItem(`timetracker_entries_${user.id}`);
      let entries = [];
      
      if (storedEntries) {
        entries = JSON.parse(storedEntries);
      }
      
      entries.push(newEntry);
      localStorage.setItem(`timetracker_entries_${user.id}`, JSON.stringify(entries));

      // Mostrar mensaje de éxito y resetear formulario
      setSuccess(true);
      setFormData({
        ...formData,
        notes: ''
      });
    } catch (error) {
      setError('Error al guardar el registro de tiempo');
      console.error('Error al guardar registro:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Registro Manual de Tiempo</h1>
        
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
            <p className="font-bold">¡Registro guardado!</p>
            <p>El registro de tiempo se ha guardado correctamente.</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
          <div className="mb-4">
            <label htmlFor="date" className="block text-gray-700 text-sm font-bold mb-2">
              Fecha *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          
          <div className="flex flex-wrap -mx-2 mb-4">
            <div className="w-1/2 px-2">
              <label htmlFor="startTime" className="block text-gray-700 text-sm font-bold mb-2">
                Hora de inicio *
              </label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="w-1/2 px-2">
              <label htmlFor="endTime" className="block text-gray-700 text-sm font-bold mb-2">
                Hora de fin *
              </label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="clientId" className="block text-gray-700 text-sm font-bold mb-2">
              Cliente *
            </label>
            <select
              id="clientId"
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              required
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
          
          <div className="mb-6">
            <label htmlFor="notes" className="block text-gray-700 text-sm font-bold mb-2">
              Notas
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Descripción de las tareas realizadas"
            ></textarea>
          </div>
          
          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente principal que envuelve el contenido con ClientAuthWrapper
export default function RegistroManualPage() {
  return (
    <ClientAuthWrapper>
      <RegistroManualPageContent />
    </ClientAuthWrapper>
  );
}
