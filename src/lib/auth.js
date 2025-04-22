'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';

// Crear contexto de autenticación
const AuthContext = createContext();

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  return useContext(AuthContext);
};

// Proveedor de autenticación
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar estado de autenticación al montar el componente
  useEffect(() => {
    const storedUser = localStorage.getItem('timetracker_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        setIsAdmin(parsedUser.role === 'admin');
      } catch (error) {
        console.error('Error al cargar usuario:', error);
        localStorage.removeItem('timetracker_user');
      }
    }
    setLoading(false);
  }, []);

  // Función para iniciar sesión
  const login = (userData) => {
    // Validar credenciales
    if (userData.role === 'admin') {
      // Credenciales de administrador
      if (userData.username === 'admin' && userData.password === 'admin123') {
        const adminUser = {
          id: 'ADMIN001',
          name: 'Administrador',
          role: 'admin',
          email: 'admin@magneticplace.com'
        };
        setUser(adminUser);
        setIsAuthenticated(true);
        setIsAdmin(true);
        localStorage.setItem('timetracker_user', JSON.stringify(adminUser));
        return { success: true };
      }
    } else if (userData.role === 'employee') {
      // Credenciales de empleado
      // Buscar en la lista de empleados
      const storedEmployees = localStorage.getItem('timetracker_employees');
      if (storedEmployees) {
        const employees = JSON.parse(storedEmployees);
        const employee = employees.find(emp => 
          emp.id === userData.username && emp.password === userData.password
        );
        
        if (employee) {
          const employeeUser = {
            id: employee.id,
            name: employee.name,
            role: 'employee',
            email: employee.email,
            department: employee.department
          };
          setUser(employeeUser);
          setIsAuthenticated(true);
          setIsAdmin(false);
          localStorage.setItem('timetracker_user', JSON.stringify(employeeUser));
          return { success: true };
        }
      }
      
      // Verificar empleados predefinidos
      if (userData.username === 'EMP001' && userData.password === 'emp123') {
        const employeeUser = {
          id: 'EMP001',
          name: 'Carlos Rodríguez',
          role: 'employee',
          email: 'carlos.rodriguez@magneticplace.com',
          department: 'Operaciones'
        };
        setUser(employeeUser);
        setIsAuthenticated(true);
        setIsAdmin(false);
        localStorage.setItem('timetracker_user', JSON.stringify(employeeUser));
        return { success: true };
      }
    }
    
    // Credenciales inválidas
    return { success: false, error: 'Credenciales inválidas' };
  };

  // Función para cerrar sesión
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    localStorage.removeItem('timetracker_user');
  };

  // Función para verificar si un usuario tiene acceso a una ruta
  const hasAccess = (route) => {
    if (!isAuthenticated) return false;
    
    // Rutas de administrador
    if (route.startsWith('/admin') && !isAdmin) return false;
    
    return true;
  };

  // Valor del contexto
  const value = {
    user,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    hasAccess,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Componente de orden superior para proteger rutas
export function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) {
      return <div>Cargando...</div>;
    }
    
    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
      return null;
    }
    
    return <Component {...props} />;
  };
}
