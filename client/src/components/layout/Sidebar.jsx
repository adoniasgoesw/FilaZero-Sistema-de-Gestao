import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, History, Truck, Settings } from "lucide-react";

const Sidebar = () => {
  const location = useLocation();

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-w', '4rem');
  }, []);

  // Sidebar permanece sempre recolhido. Sem listeners de abrir/fechar.

  const links = [
    { path: "/home", label: "Início", icon: Home },
    { path: "/historic", label: "Histórico", icon: History },
    { path: "/delivery", label: "Delivery", icon: Truck },
    { path: "/config", label: "Ajuste", icon: Settings }
  ];

  return (
    <aside
      className={`hidden lg:flex flex-col bg-[#1A99BA] text-white h-screen fixed left-0 top-0 z-40 shadow-lg w-16`}
    >
      {/* Logo no topo */}
      <div className="flex items-center justify-center p-4 border-b border-[#0f5f73]">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {/* Principais (somente ícones) */}
        <ul className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const active = location.pathname === link.path;
            return (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`flex justify-center items-center px-3 py-3 rounded-lg transition-all duration-200 text-3xl ${
                    active
                      ? "bg-white text-[#1A99BA] font-semibold"
                      : "hover:bg-[#0f5f73] text-white"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
