// src/components/layout/HeaderApp.jsx
import React, { useEffect, useState } from "react";
import { Bell, User } from "lucide-react";
import api from "../../services/api";

const HeaderApp = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const userId =
      localStorage.getItem("userId") || localStorage.getItem("usuarioId");

    if (!userId) return;

    async function fetchUser() {
      try {
        const response = await api.get(`/user-details/${userId}`);
        setUserData(response.data);
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      }
    }

    fetchUser();
  }, []);

  return (
    <header className="bg-white px-6 py-2 shadow-sm flex justify-between items-center fixed top-0 z-50" style={{ left: 'var(--sidebar-w, 0px)', width: 'calc(100% - var(--sidebar-w, 0px))' }}>
  {/* Logo */}
  <h1 className="text-2xl font-bold tracking-wider text-[#1A99BA] select-none">
    FILA ZERO
  </h1>

  {/* Área da direita */}
  <div className="flex items-center space-x-4">
    {/* Notificação */}
    <button className="p-2 rounded-full hover:bg-gray-100">
      <Bell className="w-5 h-5 text-gray-600" />
    </button>

    {/* Caixa do perfil */}
    <div className="flex items-center bg-gray-200 rounded-full px-3 py-1 space-x-3">
      <div className="bg-[#1A99BA] rounded-full p-2 flex items-center justify-center">
        <User className="w-5 h-5 text-white" />
      </div>
      {userData && (
        <div className="leading-tight">
          <p className="text-sm font-semibold">{userData.nome_completo}</p>
          <p className="text-xs text-gray-600">{userData.cargo}</p>
        </div>
      )}
    </div>

  </div>
</header>

  );
};

export default HeaderApp;
