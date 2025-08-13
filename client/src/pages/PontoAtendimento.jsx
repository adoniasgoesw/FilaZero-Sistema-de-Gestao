import React, { useEffect } from "react";
import Footer from "../components/layout/Footer";
import Sidebar from "../components/layout/Sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import PainelDetalhes from "../components/details/PainelDetalhes";

const PontoAtendimento = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ponto = location.state?.ponto;

  useEffect(() => {
    // Fecha sidebar ao entrar nesta página
    window.dispatchEvent(new Event('sidebar:close'));
    // Opcional: reabrir ao sair desta tela poderia ser feito com cleanup
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />
      <div className="flex-1" style={{ marginLeft: 'var(--sidebar-w, 0px)' }}>
        <main className="py-6 px-4 lg:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
            {/* Painel Detalhes - 30% */}
            <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <PainelDetalhes ponto={ponto} onVoltar={() => navigate('/home')} />
            </div>
            {/* Painel Itens - 70% */}
            <div className="lg:col-span-7 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-xl font-semibold text-gray-800 mb-3">Painel de Itens</div>
              <div className="text-gray-600">Listagem de categorias e produtos (visual mock).</div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default PontoAtendimento;



