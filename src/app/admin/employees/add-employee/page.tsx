'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../lib/auth';
import ClientAuthWrapper from '../../../../lib/client-auth-wrapper';

// Definir interfaz para el tipo de empleado
interface EmployeeType {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  active: boolean;
}

// Componente interno que contiene la lógica y UI
const AddEmployeePageContent = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState<EmployeeType>({
    id: `EMP${Date.now().toString().slice(-6)}`,
    name: '',
    email: '',
    position: '',
    department: '',
    active: true
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Verificar si el usuario es administrador
  React.useEffect(() => {
    if (isAuthenticated && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isAdmin, router]);

  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [id]: value
    }));
  };

  // Manejar cambios en checkbox
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [id]: checked
    }));
  };

  // Manejar envío del formulario
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsSubmitting(true);

    try {
      // Validar campos requeridos
      if (!formData.name) {
        setError('El nombre del empleado es obligatorio');
        setIsSubmitting(false);
        return;
      }

      // Obtener empleados actuales
      const storedEmployees = localStorage.getItem('timetracker_employees');
      let employees: EmployeeType[] = [];
      
      if (storedEmployees) {
        employees = JSON.parse(storedEmployees);
      }

      // Verificar si el ID ya existe
      if (employees.some((emp: EmployeeType) => emp.id === formData.id)) {
        // Generar un nuevo ID único
        formData.id = `EMP${Date.now().toString().slice(-6)}`;
      }

      // Añadir nuevo empleado
      employees.push(formData);

      // Guardar en localStorage
      localStorage.setItem('timetracker_employees', JSON.stringify(employees));
      
      setSuccess(true);
      
      // Resetear formulario
      setFormData({
        id: `EMP${Date.now().toString().slice(-6)}`,
        name: '',
        email: '',
        position: '',
        department: '',
        active: true
      });
      
      // Redirigir después de un breve retraso
      setTimeout(() => {
        router.push('/admin/employees');
      }, 1500);
    } catch (error) {
      console.error('Error al añadir empleado:', error);
      setError('Error al añadir empleado');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Añadir Nuevo Empleado</h1>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
            <p className="font-bold">¡Empleado añadido!</p>
            <p>El empleado se ha añadido correctamente.</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
          <div className="mb-4">
            <label htmlFor="id" className="block text-gray-700 text-sm font-bold mb-2">
              ID
            </label>
            <input
              type="text"
              id="id"
              value={formData.id}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
              readOnly
            />
            <p className="text-sm text-gray-500 mt-1">ID generado automáticamente</p>
          </div>
          
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
              Nombre *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Nombre completo del empleado"
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
              value={formData.email}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Email del empleado"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="position" className="block text-gray-700 text-sm font-bold mb-2">
              Cargo
            </label>
            <input
              type="text"
              id="position"
              value={formData.position}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Cargo del empleado"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="department" className="block text-gray-700 text-sm font-bold mb-2">
              Departamento
            </label>
            <input
              type="text"
              id="department"
              value={formData.department}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Departamento del empleado"
            />
          </div>
          
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={handleCheckboxChange}
                className="mr-2"
              />
              <span className="text-gray-700">Empleado activo</span>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push('/admin/employees')}
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
              {isSubmitting ? 'Guardando...' : 'Guardar Empleado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente principal que envuelve el contenido con ClientAuthWrapper
export default function AddEmployeePage() {
  return (
    <ClientAuthWrapper>
      <AddEmployeePageContent />
    </ClientAuthWrapper>
  );
}
