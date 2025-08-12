import React from 'react';
import { Route, Routes } from 'react-router-dom';
import LandPage from '../pages/LandPage';
import  Home  from '../pages/Home';
import Delivery from '../pages/Delivery';
import Config from '../pages/Config';
import Historic from '../pages/Historic';
import Usuarios from '../pages/gestao/Usuarios';
import FormasPagamento from '../pages/gestao/FormasPagamento';
import Clientes from '../pages/gestao/Clientes';
import Categorias from '../pages/gestao/Categorias';
import Produtos from '../pages/gestao/Produtos';


const LendRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandPage />} />
      <Route path="/home" element={<Home />} />
      <Route path="/delivery" element={<Delivery />} />
      <Route path="/config" element={<Config />} />
      <Route path="/historic" element={<Historic />} />
      
      {/* Rotas de Gestão */}
      <Route path="/gestao/usuarios" element={<Usuarios />} />
      <Route path="/gestao/formas-pagamento" element={<FormasPagamento />} />
      <Route path="/gestao/clientes" element={<Clientes />} />
      <Route path="/gestao/categorias" element={<Categorias />} />
      <Route path="/gestao/produtos" element={<Produtos />} />
    </Routes>
  );
};

export default LendRoutes;
