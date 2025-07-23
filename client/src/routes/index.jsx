import { BrowserRouter, Routes, Route } from 'react-router-dom';
import InterativoPage from '../pages/InterativoPage';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InterativoPage />} />
      </Routes>
    </BrowserRouter>
  );
}
