import React, { useEffect, useState } from 'react';
import api from '../../services/api'; // sua instância axios configurada

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('userId') || localStorage.getItem('usuarioId');

    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchUserData() {
      try {
        const response = await api.get(`/user-details/${userId}`)

        setUserData(response.data);
      } catch (error) {
        console.error('Erro ao buscar dados do perfil:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, []);

  if (loading) return <p>Carregando perfil...</p>;
  if (!userData) return <p>Dados do usuário não disponíveis.</p>;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 w-full">
      <div className="flex items-center space-x-4">
        <img
          src="/logo.png"
          alt="Logo"
          className="w-16 h-16 rounded-full border"
        />
        <div>
          <h2 className="text-2xl font-bold">{userData.estabelecimento_nome}</h2>
          <p className="text-gray-600">{userData.nome_completo} ({userData.cargo})</p>
          <p className="text-gray-500">CPF: {userData.cpf}</p>
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = '/';
          }}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
