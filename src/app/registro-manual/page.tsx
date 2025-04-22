'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import { getEmployeeClients } from '../../lib/client-management';

export default function ManualEntryPage() {
  const { user, isAuthenticated } = useAuth();
  const [availableClients, setAvailableClients] = useState([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    entryTime: '09:00',
    exitTime: '17:00',
    clientId: '',
    tag: '',
    notes: ''
  });
  const [customTag, setCustomTag] = useState('');
  const [showCustomTag, setShowCustomTag] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Lista de etiquetas predefinidas
  const tags = [
    'Desarrollo',
    'Diseño',
    'Reunión',
    'Soporte',
    'Administrativo',
    'Otro'
  ];

  // Cargar clientes asignados al empleado
  useEffect(() => {
    if (isAuthenticated && user) {
      const employeeClients = getEmployeeClients(user.id);
      setAvailableClients(employeeClients);
      
      // Seleccionar el primer cliente por defecto si hay clientes disponibles
      if (employeeClients.length > 0 && !formData.clientId) {
        setFormData(prev => ({
          ...prev,
          clientId: employeeClients[0].id
        }));
      }
    }
  }, [isAuthenticated, user]);

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Si cambia la etiqueta, actualizar el estado de etiqueta personalizada
    if (name === 'tag') {
      setShowCustomTag(value === 'Otro');
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.date) {
      newErrors.date = 'La fecha es obligatoria';
    }
    
    if (!formData.entryTime) {
      newErrors.entryTime = 'La hora de entrada es obligatoria';
    }
    
    if (!formData.exitTime) {
      newErrors.exitTime = 'La hora de salida es obligatoria';
    }
    
    if (!formData.clientId) {
      newErrors.clientId = 'Debes seleccionar un cliente';
    }
    
    if (!formData.tag) {
      newErrors.tag = 'Debes seleccionar una etiqueta';
    }
    
    if (formData.tag === 'Otro' && !customTag) {
      newErrors.customTag = 'Debes ingresar una etiqueta personalizada';
    }
    
    // Validar que la hora de salida sea posterior a la hora de entrada
    if (formData.entryTime && formData.exitTime) {
      const entryDate = new Date(`2000-01-01T${formData.entryTime}`);
      const exitDate = new Date(`2000-01-01T${formData.exitTime}`);
      
      if (exitDate <= entryDate) {
        newErrors.exitTime = 'La hora de salida debe ser posterior a la hora de entrada';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calcular horas trabajadas
  const calculateWorkedHours = () => {
    if (!formData.entryTime || !formData.exitTime) return '';
    
    const entryDate = new Date(`2000-01-01T${formData.entryTime}`);
    const exitDate = new Date(`2000-01-01T${formData.exitTime}`);
    
    if (exitDate <= entryDate) return '';
    
    const diffMs = exitDate - entryDate;
    const diffMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    return `${hours}h ${minutes}m`;
  };

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Encontrar el nombre del cliente seleccionado
      const clientName = availableClients.find(c => c.id === formData.clientId)?.name || formData.clientId;
      
      // Determinar la etiqueta final
      const finalTag = formData.tag === 'Otro' ? customTag : formData.tag;
      
      // Calcular tiempo trabajado en minutos
      const entryDate = new Date(`2000-01-01T${formData.entryTime}`);
      const exitDate = new Date(`2000-01-01T${formData.exitTime}`);
      const diffMs = exitDate - entryDate;
      const totalMinutes = Math.floor(diffMs / 60000);
      
      // Formatear para almacenamiento
      const timeRecord = {
        date: formData.date,
        entry: formData.entryTime,
        exit: formData.exitTime,
        total: calculateWorkedHours(),
        status: 'Completado',
        client: clientName,
        tag: finalTag,
        notes: formData.notes,
        totalWorkTime: totalMinutes,
        manualEntry: true
      };
      
      // Guardar en el historial de registros del empleado
      saveTimeRecordForEmployee(user.id, timeRecord);
      
      // Guardar en los registros generales para informes
      saveTimeRecordForReports(timeRecord, user.id);
      
      // Mostrar mensaje de éxito
      setSuccessMessage('Registro de tiempo guardado correctamente');
      
      // Resetear formulario
      setFormData({
        date: new Date().toISOString().split('T')[0],
        entryTime: '09:00',
        exitTime: '17:00',
        clientId: formData.clientId, // Mantener el cliente seleccionado
        tag: '',
        notes: ''
      });
      setCustomTag('');
      setShowCustomTag(false);
      
      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error al guardar el registro de tiempo:', error);
      setErrors({ submit: 'Error al guardar el registro de tiempo' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Guardar registro de tiempo para el empleado
  const saveTimeRecordForEmployee = (employeeId, timeRecord) => {
    try {
      // Obtener lista de empleados
      const storedEmployees = localStorage.getItem('timetracker_employees');
      if (!storedEmployees) {
        console.error('No se encontraron empleados en localStorage');
        return;
      }
      
      const employees = JSON.parse(storedEmployees);
      
      // Encontrar el empleado
      const employeeIndex = employees.findIndex(emp => emp.id === employeeId);
      if (employeeIndex === -1) {
        console.error('No se encontró el empleado con ID:', employeeId);
        return;
      }
      
      // Inicializar array de registros si no existe
      if (!employees[employeeIndex].timeRecords) {
        employees[employeeIndex].timeRecords = [];
      }
      
      // Añadir el nuevo registro
      employees[employeeIndex].timeRecords.push(timeRecord);
      
      // Guardar la lista actualizada
      localStorage.setItem('timetracker_employees', JSON.stringify(employees));
      
      console.log('Registro guardado para el empleado:', employeeId);
    } catch (error) {
      console.error('Error al guardar el registro de tiempo:', error);
      throw error;
    }
  };
  
  // Guardar registro de tiempo para informes
  const saveTimeRecordForReports = (timeRecord, userId) => {
    try {
      // Obtener registros existentes
      let records = [];
      const storedRecords = localStorage.getItem('timetracker_records');
      
      if (storedRecords) {
        records = JSON.parse(storedRecords);
      }
      
      // Añadir el nuevo registro con formato compatible con informes
      records.push({
        id: `TR${Date.now().toString().slice(-6)}-${userId}`,
        userId: userId,
        date: timeRecord.date,
        entryTime: timeRecord.entry,
        exitTime: timeRecord.exit,
        client: timeRecord.client,
        totalWorkTime: timeRecord.totalWorkTime,
        usedEntryTolerance: false,
        manualEntry: true,
        tag: timeRecord.tag,
        notes: timeRecord.notes
      });
      
      // Guardar en localStorage
      localStorage.setItem('timetracker_records', JSON.stringify(records));
      
      console.log('Registro guardado para informes');
    } catch (error) {
      console.error('Error al guardar el registro para informes:', error);
      throw error;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Debes iniciar sesión para acceder a esta página</p>
          <a href="/auth/login" className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Iniciar sesión
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Registro Manual de Horas</h1>
        
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {successMessage}
          </div>
        )}
        
        {errors.submit && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {errors.submit}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="date" className="block text-gray-700 mb-2">Fecha</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.date ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
            </div>
            
            <div>
              <label htmlFor="clientId" className="block text-gray-700 mb-2">Cliente</label>
              {availableClients.length === 0 ? (
                <div className="p-2 border border-yellow-300 bg-yellow-50 rounded text-yellow-800">
                  No tienes clientes asignados. Contacta con tu administrador.
                </div>
              ) : (
                <select
                  id="clientId"
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.clientId ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Selecciona un cliente</option>
                  {availableClients.map((client) => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              )}
              {errors.clientId && <p className="mt-1 text-sm text-red-600">{errors.clientId}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="entryTime" className="block text-gray-700 mb-2">Hora de entrada</label>
              <input
                type="time"
                id="entryTime"
                name="entryTime"
                value={formData.entryTime}
                onChange={handleChange}
                className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.entryTime ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.entryTime && <p className="mt-1 text-sm text-red-600">{errors.entryTime}</p>}
            </div>
            
            <div>
              <label htmlFor="exitTime" className="block text-gray-700 mb-2">Hora de salida</label>
              <input
                type="time"
                id="exitTime"
                name="exitTime"
                value={formData.exitTime}
                onChange={handleChange}
                className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.exitTime ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.exitTime && <p className="mt-1 text-sm text-red-600">{errors.exitTime}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="tag" className="block text-gray-700 mb-2">Etiqueta</label>
              <select
                id="tag"
                name="tag"
                value={formData.tag}
                onChange={handleChange}
                className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.tag ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Seleccionar etiqueta</option>
                {tags.map((tag) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
              {errors.tag && <p className="mt-1 text-sm text-red-600">{errors.tag}</p>}
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Horas trabajadas</label>
              <div className="p-2 border border-gray-300 rounded bg-gray-50 font-medium">
                {calculateWorkedHours() || 'Pendiente de calcular'}
              </div>
            </div>
          </div>
          
          {showCustomTag && (
            <div className="mb-6">
              <label htmlFor="customTag" className="block text-gray-700 mb-2">Etiqueta personalizada</label>
              <input
                id="customTag"
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.customTag ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Ingresa una etiqueta personalizada"
              />
              {errors.customTag && <p className="mt-1 text-sm text-red-600">{errors.customTag}</p>}
            </div>
          )}
          
          <div className="mb-6">
            <label htmlFor="notes" className="block text-gray-700 mb-2">Notas (opcional)</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Añade notas o comentarios sobre este registro de tiempo"
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || availableClients.length === 0}
              className={`flex items-center justify-center px-6 py-3 rounded-md text-white font-medium ${
                isSubmitting || availableClients.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Registro'}
            </button>
          </div>
        </form>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Instrucciones:</h3>
          <ol className="list-decimal list-inside text-blue-700 space-y-1">
            <li>Selecciona la fecha del registro</li>
            <li>Elige el cliente para el que trabajaste</li>
            <li>Ingresa la hora de entrada y salida</li>
            <li>Selecciona una etiqueta que describa tu actividad</li>
            <li>Añade notas adicionales si es necesario</li>
            <li>Haz clic en "Guardar Registro" para guardar tus horas trabajadas</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
