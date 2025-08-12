import React from "react";
import Footer from "../components/layout/Footer";
import HeaderApp from "../components/layout/HeaderApp";
import Sidebar from "../components/layout/Sidebar";
import SearchBar from "../components/layout/SearchBar";

const Home = () => {
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar para telas grandes */}
      <Sidebar />
      
      {/* Conteúdo principal */}
      <div className="flex-1 lg:ml-64">
        <HeaderApp />
        
        {/* Conteúdo da página */}
        <main className="pt-20 pb-16 lg:pb-0 px-4 lg:px-6">
          {/* SearchBar */}
          <div className="mb-6">
            <SearchBar />
          </div>
          
          {/* Conteúdo principal */}
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <h1 className="text-4xl font-bold text-[#1A99BA]">Bem-vindo ao Home!</h1>
          </div>
        </main>
        
        {/* Footer apenas para telas pequenas */}
        <Footer />
      </div>
    </div>
  );
};

export default Home;
