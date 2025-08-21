import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, History, Truck, Settings } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/home', icon: Home, label: 'Início' },
    { path: '/historico', icon: History, label: 'Histórico' },
    { path: '/delivery', icon: Truck, label: 'Delivery' },
    { path: '/ajuste', icon: Settings, label: 'Ajuste' },
  ];

  return (
    <div className="hidden lg:flex flex-col w-20 bg-white shadow-lg h-screen fixed left-0 top-0 z-50 border-r border-gray-100">
      {/* Logo */}
      <div className="flex justify-center items-center h-20 border-b border-gray-200">
        <svg 
          className="w-10 h-10 text-red-500" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>

      {/* Navegação */}
      <nav className="flex-1 flex flex-col items-center py-8 space-y-8">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group relative p-3 rounded-xl transition-all duration-200 hover:bg-orange-50 ${
                isActive ? 'bg-orange-100 text-orange-600' : 'text-gray-600 hover:text-orange-600'
              }`}
              title={item.label}
            >
              <Icon size={24} />
              
              {/* Indicador de página ativa */}
              {isActive && (
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-orange-500 rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
