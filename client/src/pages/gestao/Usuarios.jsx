import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/layout/Footer";
import HeaderApp from "../../components/layout/HeaderApp";
import Sidebar from "../../components/layout/Sidebar";

const Usuarios = () => {
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
              👥 Usuários
            </h1>
            <p className="text-gray-600 mb-6">
              Aqui você pode gerenciar todos os usuários do sistema. Adicione, edite ou remova usuários conforme necessário.
            </p>
            
            {/* Área de funcionalidades */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-[#1A99BA] mb-2">Adicionar Usuário</h3>
                <p className="text-sm text-gray-600">Criar novo usuário no sistema</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-[#1A99BA] mb-2">Listar Usuários</h3>
                <p className="text-sm text-gray-600">Visualizar todos os usuários</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-[#1A99BA] mb-2">Editar Usuário</h3>
                <p className="text-sm text-gray-600">Modificar dados de usuários</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-[#1A99BA] mb-2">Permissões</h3>
                <p className="text-sm text-gray-600">Gerenciar níveis de acesso</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-[#1A99BA] mb-2">Relatórios</h3>
                <p className="text-sm text-gray-600">Gerar relatórios de usuários</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-[#1A99BA] mb-2">Configurações</h3>
                <p className="text-sm text-gray-600">Configurar políticas de usuário</p>
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

export default Usuarios;
