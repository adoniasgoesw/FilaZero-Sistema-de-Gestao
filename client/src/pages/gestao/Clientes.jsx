import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/layout/Footer";
import HeaderApp from "../../components/layout/HeaderApp";
import Sidebar from "../../components/layout/Sidebar";

const Clientes = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar para telas grandes */}
      <Sidebar />
      
      {/* Conteúdo principal */}
      <div className="flex-1 lg:ml-64">
        <HeaderApp />
        
        {/* Conteúdo da página */}
        <main className="pt-20 pb-16 lg:pb-0 px-4 lg:px-6">
          {/* Botão voltar */}
          <button
            onClick={() => navigate("/config")}
            className="flex items-center space-x-2 text-[#1A99BA] hover:text-[#0f5f73] transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>

          {/* Conteúdo principal */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-3xl font-bold text-[#1A99BA] mb-4">
              📇 Clientes
            </h1>
            <p className="text-gray-600 mb-6">
              Gerencie o cadastro de clientes. Adicione novos clientes, atualize informações e acompanhe o histórico de pedidos.
            </p>
            
            {/* Área de funcionalidades */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-[#1A99BA] mb-2">Cadastrar Cliente</h3>
                <p className="text-sm text-gray-600">Adicionar novo cliente ao sistema</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-[#1A99BA] mb-2">Listar Clientes</h3>
                <p className="text-sm text-gray-600">Visualizar todos os clientes cadastrados</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-[#1A99BA] mb-2">Editar Cliente</h3>
                <p className="text-sm text-gray-600">Atualizar dados do cliente</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-[#1A99BA] mb-2">Histórico de Pedidos</h3>
                <p className="text-sm text-gray-600">Consultar pedidos do cliente</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-[#1A99BA] mb-2">Endereços</h3>
                <p className="text-sm text-gray-600">Gerenciar endereços de entrega</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-[#1A99BA] mb-2">Relatórios</h3>
                <p className="text-sm text-gray-600">Gerar relatórios de clientes</p>
              </div>
            </div>
          </div>
        </main>
        
        {/* Footer apenas para telas pequenas */}
        <Footer />
      </div>
    </div>
  );
};

export default Clientes;
