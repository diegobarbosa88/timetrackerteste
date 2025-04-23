'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth';
import ClientAuthWrapper from '../lib/client-auth-wrapper';

// Componente interno que contiene la lógica y UI del Navbar
const NavbarContent = () => {
  const pathname = usePathname();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <nav className="bg-blue-600 text-white fixed w-full z-10 shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="font-bold text-xl">TimeTracker</span>
            </Link>
          </div>

          <div className="flex items-center">
            {isAuthenticated ? (
              <>
                <div className="hidden md:flex space-x-4 mr-4">
                  <Link 
                    href="/cronometro" 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === '/cronometro' ? 'bg-blue-700' : 'hover:bg-blue-500'}`}
                  >
                    Cronómetro
                  </Link>
                  
                  <Link 
                    href="/registro-manual" 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === '/registro-manual' ? 'bg-blue-700' : 'hover:bg-blue-500'}`}
                  >
                    Registro Manual
                  </Link>
                  
                  <Link 
                    href="/reports" 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === '/reports' ? 'bg-blue-700' : 'hover:bg-blue-500'}`}
                  >
                    Informes
                  </Link>
                  
                  {isAdmin && (
                    <div className="relative group">
                      <button className={`px-3 py-2 rounded-md text-sm font-medium ${pathname.startsWith('/admin') ? 'bg-blue-700' : 'hover:bg-blue-500'}`}>
                        Administración
                      </button>
                      <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                        <div className="py-1">
                          <Link 
                            href="/admin/employees" 
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Empleados
                          </Link>
                          <Link 
                            href="/admin/clients" 
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Clientes
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center">
                  <span className="text-sm mr-2 hidden md:block">{user?.name}</span>
                  <button 
                    onClick={logout}
                    className="px-3 py-2 rounded-md text-sm font-medium bg-red-500 hover:bg-red-600"
                  >
                    Salir
                  </button>
                </div>
              </>
            ) : (
              <Link 
                href="/auth/login" 
                className="px-3 py-2 rounded-md text-sm font-medium bg-blue-500 hover:bg-blue-400"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Componente principal que envuelve el contenido con ClientAuthWrapper
export default function Navbar() {
  return (
    <ClientAuthWrapper>
      <NavbarContent />
    </ClientAuthWrapper>
  );
}
