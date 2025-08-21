import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandPage from '../pages/LandPage.jsx';
import Home from '../pages/Home.jsx';
import Historico from '../pages/Historico.jsx';
import Delivery from '../pages/Delivery.jsx';
import Ajuste from '../pages/Ajuste.jsx';
import PontoAtendimento from '../pages/PontoAtendimento.jsx';
import Usuarios from '../pages/gestao/Usuarios.jsx';
import FormasPagamento from '../pages/gestao/FormasPagamento.jsx';
import Clientes from '../pages/gestao/Clientes.jsx';
import Categorias from '../pages/gestao/Categorias.jsx';
import Produtos from '../pages/gestao/Produtos.jsx';

const AppRoute = () => {
  return (
    <Router>
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<LandPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/historico" element={<Historico />} />
          <Route path="/delivery" element={<Delivery />} />
          <Route path="/ajuste" element={<Ajuste />} />
          <Route path="/ponto-atendimento/:id" element={<PontoAtendimento />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/formas-pagamento" element={<FormasPagamento />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/produtos" element={<Produtos />} />
          {/* Fallback para rotas não encontradas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default AppRoute;
