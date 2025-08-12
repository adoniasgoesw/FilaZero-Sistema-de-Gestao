import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/layout/Footer";
import HeaderApp from "../../components/layout/HeaderApp";
import Sidebar from "../../components/layout/Sidebar";

const FormasPagamento = () => {
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
              💳 Formas de Pagamento
            </h1>
            <p className="text-gray-600 mb-6">
              Gerencie as formas de pagamento aceitas pelo sistema. Configure métodos de pagamento, taxas e condições.
            </p>
            
            {/* Área de funcionalidades */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-[#1A99BA] mb-2">Adicionar Método</h3>
                <p className="text-sm text-gray-600">Cadastrar nova forma de pagamento</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-[#1A99BA] mb-2">Listar Métodos</h3>
                <p className="text-sm text-gray-600">Visualizar todos os métodos disponíveis</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-[#1A99BA] mb-2">Configurar Taxas</h3>
                <p className="text-sm text-gray-600">Definir taxas e comissões</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-[#1A99BA] mb-2">Ativar/Desativar</h3>
                <p className="text-sm text-gray-600">Habilitar ou desabilitar métodos</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-[#1A99BA] mb-2">Relatórios</h3>
                <p className="text-sm text-gray-600">Gerar relatórios de pagamentos</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-[#1A99BA] mb-2">Integrações</h3>
                <p className="text-sm text-gray-600">Configurar gateways de pagamento</p>
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

export default FormasPagamento;
