// src/pages/Config.jsx
import React from "react";
import Footer from "../components/layout/Footer";
import Profile from "../components/details/Profile";
import GestaoCards from "../components/cards/GestaoCards";
import AdminCard from "../components/cards/AdminCard";
import CaixaCard from "../components/cards/CaixaCard";
import HeaderApp from "../components/layout/HeaderApp";
import Sidebar from "../components/layout/Sidebar";

const Config = () => {
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar para telas grandes */}
      <Sidebar />
      
      {/* Conteúdo principal */}
      <div className="flex-1 lg:ml-64">
        <HeaderApp />

        {/* Conteúdo da página */}
        <main className="pt-20 pb-16 lg:pb-0 px-4 lg:px-6">
          {/* Título principal */}
          <h1 className="text-3xl font-bold text-[#1A99BA] mb-8">Ajustes</h1>

          {/* Sessão de Perfil */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A99BA] mb-4">Perfil</h2>
            <Profile />
          </div>

          {/* Sessão de Gestão */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A99BA] mb-4">Gestão</h2>
            <GestaoCards />
          </div>

          {/* Sessão de Administração */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A99BA] mb-4">Área Administrativa</h2>
            <div className="space-y-4">
              <AdminCard />
              <CaixaCard />
            </div>
          </div>
        </main>
        
        {/* Footer apenas para telas pequenas */}
        <Footer />
      </div>
    </div>
  );
};

export default Config;
