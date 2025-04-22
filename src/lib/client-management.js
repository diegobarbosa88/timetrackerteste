// Sistema de gestión de clientes para TimeTracker

// Función para obtener todos los clientes
export const getClients = () => {
  try {
    const storedClients = localStorage.getItem('timetracker_clients');
    if (storedClients) {
      const parsedClients = JSON.parse(storedClients);
      if (Array.isArray(parsedClients) && parsedClients.length > 0) {
        return parsedClients;
      }
    }
  } catch (error) {
    console.error('Error al obtener clientes:', error);
  }
  
  // Datos de muestra si no hay datos en localStorage
  return [
    { id: 'CLI001', name: 'MAGNETIC PLACE', active: true },
    { id: 'CLI002', name: 'Cliente A', active: true },
    { id: 'CLI003', name: 'Cliente B', active: true },
    { id: 'CLI004', name: 'Cliente C', active: true }
  ];
};

// Función para guardar un nuevo cliente
export const saveClient = (clientData) => {
  try {
    // Obtener lista actual de clientes
    const clients = getClients();
    
    // Generar ID único si es un nuevo cliente
    if (!clientData.id) {
      const lastId = clients.length > 0 
        ? parseInt(clients[clients.length - 1].id.replace('CLI', '')) 
        : 0;
      clientData.id = `CLI${String(lastId + 1).padStart(3, '0')}`;
    }
    
    // Verificar si el cliente ya existe
    const existingIndex = clients.findIndex(client => client.id === clientData.id);
    
    if (existingIndex >= 0) {
      // Actualizar cliente existente
      clients[existingIndex] = { ...clients[existingIndex], ...clientData };
    } else {
      // Añadir nuevo cliente
      clients.push({ ...clientData, active: true });
    }
    
    // Guardar en localStorage
    localStorage.setItem('timetracker_clients', JSON.stringify(clients));
    
    return { success: true, client: clientData };
  } catch (error) {
    console.error('Error al guardar cliente:', error);
    return { success: false, error: error.message };
  }
};

// Función para eliminar un cliente
export const deleteClient = (clientId) => {
  try {
    // Obtener lista actual de clientes
    const clients = getClients();
    
    // Filtrar el cliente a eliminar
    const updatedClients = clients.filter(client => client.id !== clientId);
    
    // Guardar en localStorage
    localStorage.setItem('timetracker_clients', JSON.stringify(updatedClients));
    
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    return { success: false, error: error.message };
  }
};

// Función para desactivar un cliente (alternativa a eliminar)
export const toggleClientStatus = (clientId) => {
  try {
    // Obtener lista actual de clientes
    const clients = getClients();
    
    // Encontrar el cliente
    const clientIndex = clients.findIndex(client => client.id === clientId);
    
    if (clientIndex >= 0) {
      // Cambiar estado
      clients[clientIndex].active = !clients[clientIndex].active;
      
      // Guardar en localStorage
      localStorage.setItem('timetracker_clients', JSON.stringify(clients));
      
      return { success: true, active: clients[clientIndex].active };
    }
    
    return { success: false, error: 'Cliente no encontrado' };
  } catch (error) {
    console.error('Error al cambiar estado del cliente:', error);
    return { success: false, error: error.message };
  }
};

// Función para asociar clientes a un empleado
export const assignClientsToEmployee = (employeeId, clientIds) => {
  try {
    // Obtener lista de empleados
    const storedEmployees = localStorage.getItem('timetracker_employees');
    if (!storedEmployees) {
      return { success: false, error: 'No se encontraron empleados' };
    }
    
    const employees = JSON.parse(storedEmployees);
    
    // Encontrar el empleado
    const employeeIndex = employees.findIndex(emp => emp.id === employeeId);
    if (employeeIndex === -1) {
      return { success: false, error: 'Empleado no encontrado' };
    }
    
    // Asignar clientes
    employees[employeeIndex].assignedClients = clientIds;
    
    // Guardar en localStorage
    localStorage.setItem('timetracker_employees', JSON.stringify(employees));
    
    return { success: true };
  } catch (error) {
    console.error('Error al asignar clientes:', error);
    return { success: false, error: error.message };
  }
};

// Función para obtener los clientes asignados a un empleado
export const getEmployeeClients = (employeeId) => {
  try {
    // Obtener lista de empleados
    const storedEmployees = localStorage.getItem('timetracker_employees');
    if (!storedEmployees) {
      return [];
    }
    
    const employees = JSON.parse(storedEmployees);
    
    // Encontrar el empleado
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) {
      return [];
    }
    
    // Si no tiene clientes asignados, devolver todos los clientes activos
    if (!employee.assignedClients || employee.assignedClients.length === 0) {
      return getClients().filter(client => client.active);
    }
    
    // Obtener todos los clientes
    const allClients = getClients();
    
    // Filtrar solo los clientes asignados y activos
    return allClients.filter(client => 
      client.active && employee.assignedClients.includes(client.id)
    );
  } catch (error) {
    console.error('Error al obtener clientes del empleado:', error);
    return [];
  }
};
