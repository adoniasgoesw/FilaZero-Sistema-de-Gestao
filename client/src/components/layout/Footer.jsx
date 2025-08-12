import React from "react";
import { Link, useLocation } from "react-router-dom";

const Footer = () => {
  const location = useLocation();

  const links = [
    { path: "/home", label: "Início" },
    { path: "/historic", label: "Histórico" },
    { path: "/delivery", label: "Delivery" },
    { path: "/config", label: "Ajuste" }
    
  ];

  return (
    <footer className="lg:hidden fixed bottom-0 w-full bg-[#1A99BA] text-white flex justify-around items-center py-3 shadow-lg">
      {links.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          className={`px-4 py-2 rounded-lg transition-all duration-200 ${
            location.pathname === link.path
              ? "bg-white text-[#1A99BA] font-semibold"
              : "hover:bg-[#0f5f73]"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </footer>
  );
};

export default Footer;
