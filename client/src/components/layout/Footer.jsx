import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, History, Truck, Settings } from 'lucide-react';

const Footer = () => {
  const location = useLocation();

  const navItems = [
    { path: '/home', icon: Home, label: 'Início' },
    { path: '/historico', icon: History, label: 'Histórico' },
    { path: '/delivery', icon: Truck, label: 'Delivery' },
    { path: '/ajuste', icon: Settings, label: 'Ajuste' },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <nav className="flex justify-around items-center py-3 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 ${
                isActive ? 'text-orange-600' : 'text-gray-600'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{item.label}</span>
              
              {/* Indicador de página ativa */}
              {isActive && (
                <div className="w-1 h-1 bg-orange-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Footer;
