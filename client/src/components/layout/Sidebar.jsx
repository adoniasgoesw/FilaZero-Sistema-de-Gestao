import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, History, Truck, Settings } from "lucide-react";

const Sidebar = () => {
  const location = useLocation();

  const links = [
    { path: "/home", label: "Início", icon: Home },
    { path: "/historic", label: "Histórico", icon: History },
    { path: "/delivery", label: "Delivery", icon: Truck },
    { path: "/config", label: "Ajuste", icon: Settings }
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#1A99BA] text-white h-screen fixed left-0 top-0 z-40 shadow-lg">
      {/* Logo */}
      <div className="p-6 border-b border-[#0f5f73]">
        <h1 className="text-xl font-bold tracking-wider text-white">
          FILA ZERO
        </h1>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    location.pathname === link.path
                      ? "bg-white text-[#1A99BA] font-semibold"
                      : "hover:bg-[#0f5f73] text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
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
