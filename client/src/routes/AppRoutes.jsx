import React from 'react';
import { Route, Routes } from 'react-router-dom';
import LandPage from '../pages/LandPage';
import { Home } from 'lucide-react';


const LendRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandPage />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  );
};

export default LendRoutes;
