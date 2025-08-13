import React from "react";
import Footer from "../components/layout/Footer";
import Sidebar from "../components/layout/Sidebar";

const Historic = () => {
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar para telas grandes */}
      <Sidebar />
      
      {/* Conteúdo principal */}
      <div className="flex-1" style={{ marginLeft: 'var(--sidebar-w, 16rem)' }}>
        {/* Conteúdo da página */}
        <main className="py-6 px-4 lg:px-6">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <h1 className="text-4xl font-bold text-[#1A99BA]">Página de Historico</h1>
          </div>
        </main>
        
        {/* Footer apenas para telas pequenas */}
        <Footer />
      </div>
    </div>
  );
};

export default Historic;
